# Dispute Resolution & Arbitration Guide

When a settlement break cannot be resolved through automated matching, counterparties and designated **Dispute Arbitrators** use the formal resolution workflow.

## Persona Responsibilities
- Reviews evidence submitted during dispute initiation (`DISPUTED`).
- Coordinates bilateral agreement or arbitrates revised settlement terms.
- Anchors the cryptographic `resolutionCommitment` on Soroban.
- Unlocks the case for finalization (`RESOLVED`).

---

## Step-by-Step Workflow

### 1. Review Dispute Evidence & Audit History

Retrieve the complete audit history and break details for the contested case:

```bash
curl http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212/audit
```

---

### 2. Formulate Revised Settlement Terms

The parties or arbitrator agree upon revised terms (e.g. accepted partial amount, fee adjustment, or updated deadline). A canonical `resolutionCommitment` hash is generated from the agreed terms.

---

### 3. Submit Matching Resolution Commitments

Both parties (or the authorized arbitrator acting for the case) submit the resolution commitment:

**Owner Submission**:
```bash
curl -X POST http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "resolver": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFTGOBKGOTQTV4HXY5SLQ",
    "resolutionCommitment": "c3d4e5f60123456789abcdef0123456789abcdef0123456789abcdef01234567"
  }'
```

**Counterparty Submission**:
```bash
curl -X POST http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "resolver": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    "resolutionCommitment": "c3d4e5f60123456789abcdef0123456789abcdef0123456789abcdef01234567"
  }'
```

**Expected Outcome**: When matching commitments are confirmed on-chain, status transitions to `RESOLVED`.

---

### 4. Proceed to Finalization

The case owner can now finalize the resolved settlement case:

```bash
curl -X POST http://localhost:3000/v1/cases/1212121212121212121212121212121212121212121212121212121212121212/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "signer": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFTGOBKGOTQTV4HXY5SLQ"
  }'
```
