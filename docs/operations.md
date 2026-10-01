# StellarClear Operations & Monitoring Guide

This guide specifies operational baselines, telemetry, health/readiness probes, database maintenance, consistency diagnostics, recovery playbooks, and incident response procedures for operating StellarClear v0.1.0 in production and testnet environments.

---

## 1. Operational Probes & Service Health Monitoring

StellarClear exposes three tiers of monitoring endpoints designed for container orchestrators (Kubernetes), load balancers, and observability agents (Prometheus/Grafana/Datadog):

### Liveness Probe (`GET /health`)
Verifies that the Node.js API process event loop is active and serving traffic.

```bash
curl -i http://localhost:3000/health
```

**Response (HTTP 200 OK):**
```json
{
  "status": "ok",
  "service": "stellarclear-api",
  "version": "0.1.0",
  "uptimeSeconds": 86400,
  "timestamp": "2026-10-01T12:00:00.000Z"
}
```

### Readiness Probe (`GET /ready`)
Performs active ping checks against downstream dependencies:
- **Database**: Executes `SELECT 1;`
- **Soroban RPC**: Validates network passphrase and RPC connectivity
- **SettlementRegistry Contract**: Validates contract ID StrKey format and network compatibility
- **Indexer**: Verifies sync cursor availability

```bash
curl -i http://localhost:3000/ready
```

**Response (HTTP 200 OK):**
```json
{
  "status": "ready",
  "timestamp": "2026-10-01T12:00:00.000Z",
  "version": "0.1.0",
  "network": "testnet",
  "contractId": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  "services": {
    "database": { "status": "up", "details": { "driver": "postgresql/in-memory" } },
    "sorobanRpc": { "status": "up", "details": { "network": "testnet", "contractId": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC" } },
    "settlementRegistry": { "status": "up", "details": { "contractId": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC", "validFormat": true } },
    "indexer": { "status": "up", "details": { "synced": true, "network": "testnet" } }
  }
}
```
*Returns `HTTP 503 Service Unavailable` with `status: "not_ready"` if any core dependency fails.*

---

## 2. Structured Settlement Health Diagnostics

For deep operational telemetry, query `GET /v1/operations/diagnostics`:

```bash
curl -s http://localhost:3000/v1/operations/diagnostics | jq
```

```json
{
  "status": "healthy",
  "timestamp": "2026-10-01T12:00:00.000Z",
  "uptimeSeconds": 86400,
  "version": "0.1.0",
  "environment": "testnet",
  "release": {
    "protocol": "STELLARCLEAR",
    "version": "0.1.0",
    "releaseTag": "v0.1.0",
    "contract": {
      "name": "settlement_registry",
      "version": "0.1.0",
      "releaseTag": "v0.1.0",
      "wasmHash": "1018a81b1ac95046cb00466ceda7ee347204c08b71b1c51b3c9611dd32215d66",
      "specVersion": 1,
      "contractId": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      "network": "testnet",
      "compatible": true
    },
    "features": [
      "case_creation",
      "observation_anchoring",
      "match_reconciliation",
      "break_classification",
      "dispute_workflows",
      "arbitration_resolution",
      "multi_party_attestations",
      "onchain_finalization"
    ]
  },
  "database": {
    "status": "healthy",
    "latencyMs": 3,
    "totalCases": 1250,
    "totalObservations": 1248,
    "totalReconciliations": 1248,
    "totalBreaks": 14
  },
  "contract": {
    "status": "healthy",
    "contractId": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    "network": "testnet",
    "rpcUrl": "https://soroban-testnet.stellar.org",
    "anchoringEnabled": true,
    "rpcLatencyMs": 42
  },
  "indexing": {
    "status": "synced",
    "latestLedger": 1650420,
    "indexedCheckpoint": 1650420,
    "pendingEventsCount": 0
  },
  "pipeline": {
    "openCases": 2,
    "matchedCases": 1234,
    "brokenCases": 14,
    "disputedCases": 4,
    "resolvedCases": 4,
    "finalizedCases": 1230
  }
}
```

---

## 3. Indexer Progression, Checkpoints & Ingestion

The Indexer service continuously streams Soroban contract events:

### Cursor Management
- Durably saved in PostgreSQL table `ingestion_cursors`.
- Stores `network`, `last_processed_ledger`, and `last_processed_event_cursor`.
- Advance occurs within atomic transaction boundaries only after all event state updates succeed.

### Checkpoint Ingestion Flow
```
Soroban RPC (getEvents) ──► EventProcessor ──► SettlementStateSynchronizer ──► Update Cursor
```

### Ingestion Failures & Retry
- **RPC Transient Failure**: Exponential backoff (1s, 2s, 4s, 8s, max 30s) before reconnecting.
- **Malformed Events**: Skipped with diagnostic error logs without terminating the ingestion daemon.
- **Replayed Events**: Ingestion is fully idempotent; database uses `ON CONFLICT DO NOTHING` and in-memory unique key matching.

---

## 4. Cross-Layer Consistency Diagnostics

To detect state drift between database, indexer, contract, and settlement proofs:

```bash
curl http://localhost:3000/v1/cases/:caseId/consistency
```

### Consistency Classifications:
| Classification | Description | Automatic Remediation |
| :--- | :--- | :--- |
| `CONSISTENT` | 100% agreement between off-chain DB, Soroban contract, and cryptographic proof. | None required. |
| `MISSING_ONCHAIN_CASE` | Case exists in DB but not on-chain (e.g. failed RPC submission). | Re-submit `anchorCaseCreation` or retry creation. |
| `COMMITMENT_MISMATCH` | Terms or observation hash differs between DB and Soroban. | Investigate payload mutation; verify domain canonicalization. |
| `STATE_MISMATCH` | Database status conflicts with on-chain status. | Check indexer sync status; trigger state resynchronization. |
| `STALE_DATABASE` | Soroban state advanced beyond database representation. | Allow indexer catch-up or force replay from checkpoint ledger. |
| `STALE_CHAIN_REFERENCE` | Finalized record in DB lacks `finalization_tx_hash`. | Indexer syncs missing transaction reference on event arrival. |

---

## 5. Database Maintenance & Growth Considerations

### Sizing & Indexing Baseline
- `settlement_cases`: Primary key on `id` (64-byte hex); composite unique constraint `(network, id)`.
- `settlement_observations`: Foreign key `case_id`; unique constraint `(network, case_id, tx_hash)`.
- `contract_events`: Append-only event store; indexed by `(network, cursor)` and `(network, ledger)`.

### Routine Maintenance
```sql
-- Analyze table query plans
VACUUM ANALYZE settlement_cases;
VACUUM ANALYZE settlement_observations;
VACUUM ANALYZE contract_events;

-- Reindex high-cardinality tables monthly
REINDEX TABLE CONCURRENTLY settlement_cases;
```

---

## 6. Incident Response & Recovery Playbooks

### Playbook A: Stalled Indexer Ingestion
1. Check indexer diagnostic status: `GET /v1/operations/diagnostics` -> `indexing.status`.
2. Inspect last recorded cursor:
   ```sql
   SELECT * FROM ingestion_cursors WHERE network = 'testnet';
   ```
3. Restart indexer with safe replay offset:
   ```bash
   START_LEDGER=1500000 npm run start --workspace=@stellarclear/indexer
   ```

### Playbook B: Soroban RPC Outage / Rate-Limiting
1. `GET /ready` returns `503 Service Unavailable` (`sorobanRpc: down`).
2. Verify RPC endpoint health:
   ```bash
   curl -X POST https://soroban-testnet.stellar.org -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
   ```
3. Failover to backup RPC endpoint by updating `STELLAR_RPC_URL` in `.env` and reloading the service.

### Playbook C: Stale Chain References Detected
1. Run consistency check on affected case ID: `GET /v1/cases/:caseId/consistency`.
2. Query audit trail: `GET /v1/cases/:caseId/audit`.
3. Ingest missing ledger events or trigger sync via indexer.

---

## 7. Known v0.1.0 Limitations

1. **Bilateral Arbitration**: v0.1.0 dispute resolution accepts counterparty or registered arbiter agreements; multi-sig arbitration voting is scheduled for v0.2.0.
2. **WebSocket Subscriptions**: Real-time event push streaming is scheduled for v0.2.0 (currently polling via Indexer).
3. **Storage Retention**: Off-chain audit history is retained indefinitely; database partitioning by month is recommended for >10M settlement cases.
