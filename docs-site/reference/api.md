# REST API Reference

The StellarClear REST API exposes endpoints for case creation, observations, reconciliation, proofs, attestations, disputes, and operational probes.

## Base URL
- **Local / Docker**: `http://localhost:3000`
- **Default Port**: `3000`

---

## Health & Probe Endpoints

### 1. `GET /health`
Liveness probe.
- **Response (`200 OK`)**:
  ```json
  { "status": "ok", "version": "0.1.0", "uptimeSeconds": 300.2, "timestamp": "2026-10-02T10:00:00.000Z" }
  ```

### 2. `GET /ready`
Readiness probe verifying DB and RPC connectivity.
- **Response (`200 OK` or `503 Service Unavailable`)**:
  ```json
  { "status": "ready", "checks": { "database": { "status": "healthy" } } }
  ```

### 3. `GET /version`
Returns service and deployed contract release version information.
- **Response (`200 OK`)**:
  ```json
  { "version": "0.1.0", "contractVersion": "0.1.0", "contractId": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC", "network": "testnet" }
  ```

### 4. `GET /v1/operations/diagnostics`
Structured operations telemetry and metrics.

---

## Settlement Case Endpoints

### 5. `POST /v1/cases`
Creates a new settlement case with expected trade terms and anchors `termsCommitment` on Soroban.
- **Request Body**:
  ```json
  {
    "expected": {
      "caseId": "1212121212121212121212121212121212121212121212121212121212121212",
      "owner": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFTGOBKGOTQTV4HXY5SLQ",
      "counterparty": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      "tradeReference": "TRADE-EURUSD-001",
      "asset": "EURC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "amount": "1000.0000000",
      "expectedDestination": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFTGOBKGOTQTV4HXY5SLQ",
      "reference": "INV-2026-001",
      "deadline": 2000000
    }
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "case": {
      "caseId": "1212121212121212121212121212121212121212121212121212121212121212",
      "status": "OPEN",
      "termsCommitment": "a1b2c3d4...",
      "createdAt": "2026-10-02T10:00:00.000Z"
    }
  }
  ```

### 6. `GET /v1/cases/:caseId`
Fetches complete settlement case details, observed payments, breaks, and current status.

### 7. `POST /v1/cases/:caseId/observe`
Records observed on-chain Stellar transaction payment details.
- **Request Body**:
  ```json
  {
    "observed": {
      "caseId": "1212121212121212121212121212121212121212121212121212121212121212",
      "txHash": "3434343434343434343434343434343434343434343434343434343434343434",
      "ledger": 1995000,
      "amount": "1000.0000000",
      "asset": "EURC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "destination": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFTGOBKGOTQTV4HXY5SLQ",
      "reference": "INV-2026-001",
      "status": "SUCCESS"
    }
  }
  ```

### 8. `POST /v1/cases/:caseId/reconcile`
Executes the deterministic matcher and updates decision (`MATCHED` or `BREAK`).

### 9. `GET /v1/cases/:caseId/proof`
Generates and returns the portable canonical JSON `SettlementProof` bundle.

### 10. `POST /v1/proofs/verify`
Cryptographically verifies an exported Settlement Proof.

---

## Attestation & Dispute Endpoints

### 11. `POST /v1/cases/:caseId/attestations`
Submits an authorized `OWNER`, `COUNTERPARTY`, or `OBSERVER` attestation.

### 12. `GET /v1/cases/:caseId/attestations`
Lists all submitted attestations for a case.

### 13. `POST /v1/cases/:caseId/dispute`
Opens a formal dispute on a broken settlement case with evidence hash.

### 14. `POST /v1/cases/:caseId/resolve`
Submits an agreed resolution commitment.

### 15. `POST /v1/cases/:caseId/finalize`
Finalizes a matched or resolved settlement case on Soroban.

---

## Consistency & Chain Audit Endpoints

### 16. `GET /v1/cases/:caseId/audit`
Returns the complete chronological lifecycle audit log.

### 17. `GET /v1/cases/:caseId/verify-consistency`
Verifies consistency across DB records, proof commitments, and on-chain contract state.

### 18. `GET /v1/cases/:caseId/chain`
Queries live Soroban smart contract state directly.

### 19. `POST /v1/cases/:caseId/verify-chain-proof`
Validates proof commitments against live on-chain contract state.
