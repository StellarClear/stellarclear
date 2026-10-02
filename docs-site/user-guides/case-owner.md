# Case Owner User Guide

The **Case Owner** is the initiator or primary beneficiary of a bilateral financial settlement (e.g., an institutional trading desk, exporter, or payment originator).

## Persona Responsibilities
- Registers bilateral trade terms in off-chain API databases.
- Anchors the initial `termsCommitment` on Soroban (`OPEN`).
- Submits cryptographic `OWNER` attestations.
- Finalizes matched or resolved cases on Soroban (`FINALIZED`).

---

## Step-by-Step Workflow

### 1. Register Expected Settlement Case

Submit the bilateral trade instructions via the REST API:

```bash
curl -X POST http://localhost:3000/v1/cases \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Expected Outcome**: API creates off-chain record and anchors `termsCommitment` on Soroban. Initial state is `OPEN`.

---

### 2. Monitor Settlement Status

Query the current case status and reconciliation decision:

```bash
curl http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212
```

---

### 3. Submit Owner Attestation

Once the case is reconciled as `MATCHED`, submit a signed owner attestation:

```bash
curl -X POST http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212/attestations \
  -H "Content-Type: application/json" \
  -d '{
    "role": "OWNER",
    "signer": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFTGOBKGOTQTV4HXY5SLQ",
    "signature": "304502210089abcdef..."
  }'
```

---

### 4. Finalize Settlement on Soroban

Immutably seal the settlement case on-chain:

```bash
curl -X POST http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "signer": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFTGOBKGOTQTV4HXY5SLQ"
  }'
```

**Expected Outcome**: Case transitions to `FINALIZED`. No further modifications are permitted on-chain.

---

### 5. Download Settlement Proof

Download the complete JSON audit proof bundle for accounting and compliance archives:

```bash
curl http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212/proof
```
