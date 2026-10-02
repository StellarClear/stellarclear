# StellarClear End-to-End Demo Recording Guide & Script

This document provides the canonical 7-step recording script and demonstration runbook for the **StellarClear** settlement evidence and reconciliation protocol.

---

## 🎬 Recording Overview & Environment Setup

- **Target Duration**: 4–6 minutes
- **Network**: Stellar Testnet
- **Deployed Contract ID**: [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)
- **Local Services**: REST API running on `http://localhost:3000`, Streaming Indexer Service, PostgreSQL database.
- **Tools Used**: Terminal / `curl` (or Postman), Web Browser (Stellar.Expert Testnet Explorer and VitePress Documentation Site).

### Pre-Recording Checklist
1. Monorepo dependencies installed and built (`npm run build`).
2. API Service started (`npm run start:api` or `docker compose up -d`).
3. Browser tabs pre-opened:
   - [StellarClear Documentation](https://stellarclear.github.io/stellarclear-app/)
   - [Stellar.Expert Contract Explorer](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)
   - [Stellar.Expert Testnet Overview](https://stellar.expert/explorer/testnet)

---

## 📋 Exact 7-Step Demonstration Script

```
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                        DEMO FLOW ARCHITECTURE                           │
   └─────────────────────────────────────────────────────────────────────────┘

     Step 1: CREATE CASE           Step 2: OBSERVE PAYMENT
  [POST /v1/cases (Terms)]     ──►  [POST /v1/cases/:id/observe]
                                                │
                                                ▼
     Step 4: DEMO MATCH            Step 3: RECONCILE
  [Clean Match + Attestations] ◄──  [Deterministic Matcher]
                                                │
                                                ▼
     Step 6: ANCHOR SOROBAN        Step 5: DEMO BREAK
  [SettlementRegistry State]   ◄──  [AMOUNT_MISMATCH / Dispute]
            │
            ▼
     Step 7: FINAL IMMUTABLE STATE
  [Stellar.Expert Verification]
```

---

### Step 1 — Create Settlement Case

**Narrative**: "We start by opening a bilateral settlement case between Alice (institutional originator) and Bob (counterparty). The parties agree to settle 10,000 USDC on Stellar Testnet. StellarClear computes a deterministic SHA-256 `termsCommitment` over canonical JSON trade terms without leaking sensitive counterparty metadata."

**Action / Command**:
```bash
curl -s -X POST http://localhost:3000/v1/cases \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "000000000000000000000000000000000000000000000000000000000000aa01",
    "owner": "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
    "counterparty": "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    "terms": {
      "amount": "10000.0000000",
      "assetCode": "USDC",
      "assetIssuer": "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "destination": "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
      "memo": "INV-2026-1001"
    },
    "expiresAtLedger": 9999999
  }' | jq .
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "caseId": "000000000000000000000000000000000000000000000000000000000000aa01",
    "status": "OPEN",
    "termsCommitment": "a7b3c2...",
    "createdAt": "2026-10-02T13:00:00.000Z"
  }
}
```

---

### Step 2 — Observe Stellar Payment

**Narrative**: "The payment is executed on Stellar. The observer captures the transaction details (transaction hash, ledger sequence, asset, and transfer amount) and computes a canonical `observationCommitment`."

**Action / Command**:
```bash
curl -s -X POST http://localhost:3000/v1/cases/000000000000000000000000000000000000000000000000000000000000aa01/observe \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb84ea34b079a272d",
    "ledgerSequence": 541289,
    "observed": {
      "amount": "10000.0000000",
      "assetCode": "USDC",
      "assetIssuer": "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      "destination": "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
      "memo": "INV-2026-1001",
      "successful": true
    }
  }' | jq .
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "caseId": "000000000000000000000000000000000000000000000000000000000000aa01",
    "status": "OBSERVED",
    "observationCommitment": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "txHash": "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb84ea34b079a272d"
  }
}
```

---

### Step 3 — Reconcile Settlement

**Narrative**: "The `@stellarclear/matcher` engine executes a deterministic arithmetic comparison across exact decimal quantities, asset identifiers, destination addresses, and memos without floating-point inaccuracy."

**Action / Command**:
```bash
curl -s -X POST http://localhost:3000/v1/cases/000000000000000000000000000000000000000000000000000000000000aa01/reconcile | jq .
```

---

### Step 4 — Demonstrate MATCH Result

**Narrative**: "When all fields match the agreed terms, the engine produces a `MATCHED` outcome, attaches observer cryptographic attestations, and outputs a canonical `SettlementProof`."

**Inspection / Output**:
```json
{
  "status": "success",
  "data": {
    "caseId": "000000000000000000000000000000000000000000000000000000000000aa01",
    "status": "MATCHED",
    "reconciliation": {
      "matched": true,
      "breakCount": 0,
      "breaks": []
    },
    "proof": {
      "version": "1.0",
      "caseId": "000000000000000000000000000000000000000000000000000000000000aa01",
      "contractId": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      "network": "testnet",
      "termsCommitment": "a7b3c2...",
      "observationCommitment": "e3b0c4...",
      "attestations": [
        {
          "role": "Observer",
          "signer": "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ"
        }
      ]
    }
  }
}
```

---

### Step 5 — Demonstrate BREAK Result

**Narrative**: "Now let's see what happens when there is a discrepancy. If Bob executes a payment for only 9,500 USDC instead of 10,000 USDC, the matcher immediately detects the underpayment and flags an `AMOUNT_MISMATCH` break code. A formal dispute is opened with evidence."

**Action / Command**:
```bash
# Simulating a broken case with amount discrepancy
curl -s -X POST http://localhost:3000/v1/cases/000000000000000000000000000000000000000000000000000000000000bb02/reconcile | jq .
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "caseId": "000000000000000000000000000000000000000000000000000000000000bb02",
    "status": "BREAK",
    "reconciliation": {
      "matched": false,
      "breakCount": 1,
      "breaks": [
        {
          "code": "AMOUNT_MISMATCH",
          "expected": "10000.0000000",
          "observed": "9500.0000000",
          "message": "Observed settlement amount does not match expected terms."
        }
      ]
    }
  }
}
```

---

### Step 6 — Demonstrate Soroban SettlementRegistry Evidence

**Narrative**: "The outcome is anchored into the authoritative `SettlementRegistry` Soroban smart contract. The contract enforces state machine invariants: only authorized observers can record observations and matches, parties can submit dispute commitments, and all state transitions emit typed on-chain events."

**Action / Command**:
```bash
# Finalizing the verified matched case on Soroban
curl -s -X POST http://localhost:3000/v1/cases/000000000000000000000000000000000000000000000000000000000000aa01/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "signer": "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ"
  }' | jq .
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "caseId": "000000000000000000000000000000000000000000000000000000000000aa01",
    "status": "FINALIZED",
    "finalizationTxHash": "a1b2c3d4e5f6...",
    "ledgerSequence": 541320
  }
}
```

---

### Step 7 — Demonstrate Final Immutable State on Stellar.Expert

**Narrative**: "Finally, we switch to the public Stellar.Expert Testnet explorer for contract `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`. We inspect the contract storage and emitted Soroban events proving that the case is permanently sealed and tamper-proof."

**Browser View**:
1. Open [https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)
2. Highlight:
   - Contract ID and active Testnet ledger interactions
   - Emitted contract events (`case_created`, `observation_recorded`, `match_recorded`, `finalized`)
   - Non-custodial security properties (no token custody, cryptographic evidence anchoring only).

---

## 🏁 Wrap-Up Line
"StellarClear brings deterministic, non-custodial reconciliation to institutional settlement on Stellar and Soroban—open-source, tested, and live on Stellar Testnet."
