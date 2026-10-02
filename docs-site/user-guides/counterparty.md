# Counterparty User Guide

The **Counterparty** is the secondary trading party responsible for executing payment or receiving funds according to agreed settlement terms.

## Persona Responsibilities
- Executes the underlying payment transfer on the Stellar ledger.
- Submits cryptographic `COUNTERPARTY` attestations.
- Opens formal on-chain disputes if an unexpected reconciliation break occurs.
- Participates in dispute resolution and arbitration workflows.

---

## Step-by-Step Workflow

### 1. Verify Agreed Terms

Fetch the case details from the API to verify expected payment parameters (asset, amount, destination address, and deadline):

```bash
curl http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212
```

---

### 2. Execute Payment on Stellar

Using standard Stellar wallets, SDKs, or custodians, execute the transfer to the designated destination address (`expectedDestination`) including the agreed memo/reference before the target ledger deadline:

- **Amount**: `1000.0000000` EURC
- **Destination**: `GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFTGOBKGOTQTV4HXY5SLQ`
- **Memo**: `INV-2026-001`

---

### 3. Submit Counterparty Attestation

When the case matches successfully (`MATCHED`), submit a counterparty attestation confirming receipt and agreement:

```bash
curl -X POST http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212/attestations \
  -H "Content-Type: application/json" \
  -d '{
    "role": "COUNTERPARTY",
    "signer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    "signature": "3044022011abcdef..."
  }'
```

---

### 4. Handling Reconciliation Breaks & Disputes

If the matcher engine flags a break (`BREAK`), the counterparty can review the break code (e.g., `AMOUNT_MISMATCH`) and open an on-chain dispute with supporting evidence:

```bash
curl -X POST http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212/dispute \
  -H "Content-Type: application/json" \
  -d '{
    "initiator": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    "evidenceHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "reason": "Payment completed with agreed fee deduction"
  }'
```

**Expected Outcome**: Case transitions to `DISPUTED` on Soroban.
