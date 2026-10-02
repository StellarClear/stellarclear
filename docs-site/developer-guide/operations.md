# Operations, Diagnostics & Incident Response

StellarClear includes built-in operational observability, health probes, and structured diagnostics.

## Health Probes

### Liveness Probe (`GET /health`)
Verifies that the process is running and responding to HTTP requests:

```bash
curl http://localhost:3000/health
```

**Response**:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "uptimeSeconds": 1420.5,
  "timestamp": "2026-10-02T10:00:00.000Z"
}
```

### Readiness Probe (`GET /ready`)
Verifies active connectivity to PostgreSQL and Soroban RPC:

```bash
curl http://localhost:3000/ready
```

**Response (`200 OK`)**:
```json
{
  "status": "ready",
  "checks": {
    "database": { "status": "healthy", "latencyMs": 2 },
    "sorobanRpc": { "status": "healthy", "latencyMs": 45 }
  }
}
```

## Operational Diagnostics (`GET /v1/operations/diagnostics`)

Exposes real-time settlement metrics, break counts, and indexing cursor status:

```bash
curl http://localhost:3000/v1/operations/diagnostics
```

**Response**:
```json
{
  "status": "healthy",
  "metrics": {
    "totalCases": 450,
    "matchedCases": 435,
    "breakCases": 15,
    "disputedCases": 2,
    "finalizedCases": 433
  },
  "indexer": {
    "currentLedger": 1995120,
    "cursorLag": 0
  }
}
```

## Incident Response Playbooks

### Scenario A: Indexer Cursor Lagging Behind Live Ledger
- **Symptoms**: Observed payments not appearing in API queries; `cursorLag > 50`.
- **Mitigation**:
  1. Inspect indexer logs: `docker compose logs indexer`.
  2. Verify Soroban RPC availability: `curl https://soroban-testnet.stellar.org/health`.
  3. If rate-limited, adjust `INDEXER_POLL_INTERVAL_MS` or rotate RPC provider.

### Scenario B: Database Connection Timeout
- **Symptoms**: `GET /ready` returns HTTP 503 `not_ready`.
- **Mitigation**:
  1. Check PostgreSQL container: `docker compose ps postgres`.
  2. Inspect connection limits and restart if exhausted: `docker compose restart postgres`.
