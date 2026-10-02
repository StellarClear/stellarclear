# Non-Custodial Architecture & Trust Model

StellarClear separates confidential business trade metadata from immutable on-chain cryptographic proofs.

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           Off-Chain Layer                               │
│  ┌───────────────────────┐       ┌───────────────────────────────────┐  │
│  │   Private Trade Data  │       │         Matcher Engine            │  │
│  │  (Expected & Observed)│ ───►  │  (Reconcile & Break Taxonomy)    │  │
│  └───────────────────────┘       └─────────────────┬─────────────────┘  │
│              │                                     │                    │
│              ▼                                     ▼                    │
│  ┌───────────────────────┐       ┌───────────────────────────────────┐  │
│  │     Proof Engine      │       │            REST API               │  │
│  │ (SHA-256 Commitments) │ ◄───► │   (Endpoints, Audit & Probes)     │  │
│  └───────────────────────┘       └─────────────────┬─────────────────┘  │
└────────────────────────────────────────────────────┼────────────────────┘
                                                     │ Anchors & Verifies
                                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Stellar & Soroban On-Chain Layer                  │
│  ┌──────────────────────────────┐     ┌──────────────────────────────┐  │
│  │      SettlementRegistry      │     │      Streaming Indexer       │  │
│  │  (Soroban Smart Contract)    │ ──► │  (Event Sync & Checkpoints)  │  │
│  └──────────────────────────────┘     └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Monorepo Component Layout

- **`services/api`**: Fastify-compatible REST API dispatcher handling case lifecycle ingestion, attestations, disputes, and operational health probes.
- **`services/matcher`**: Pure deterministic reconciliation engine performing decimal arithmetic and break classification.
- **`services/indexer`**: Resilient streaming ingestion worker decoding Soroban contract events into persistent PostgreSQL storage.
- **`packages/proof`**: Cryptographic engine generating deterministic RFC 8785 canonical JSON serializations and SHA-256 commitments.
- **`packages/db`**: Database abstraction supporting PostgreSQL and in-memory test clients with idempotent deduplication.
- **`packages/sdk`**: TypeScript client SDK providing contract bindings, error normalization, and lifecycle helpers.
- **`packages/schemas`**: Protocol domain models and Zod runtime schema validators.
- **`packages/settlement-registry`**: Auto-generated TypeScript bindings generated from Soroban smart contract WASM bytecode.

## Trust Model & Privacy Boundary

| Role / Entity | Capabilities & Responsibilities | Trust Assumptions |
| :--- | :--- | :--- |
| **Case Owner** | Submits expected settlement instructions and signs owner attestations. | Assumed to agree with trade terms prior to anchoring. |
| **Counterparty** | Executes payment on Stellar and submits counterparty attestations. | Relies on contract to anchor exact terms hash and dispute rights. |
| **Independent Observers** | Authorized independent verifiers or automated oracles registered on-chain. | Authorized on-chain by admin; can submit neutral witness attestations. |
| **Contract Admin** | Configures contract parameters and registers observer public keys. | Multi-sig administrator; cannot mutate existing finalized cases. |

### On-Chain vs. Off-Chain Separation

- **What Goes On-Chain (`SettlementRegistry`)**:
  - Deterministic 32-byte SHA-256 hashes (`termsCommitment`, `observationCommitment`, `resolutionCommitment`).
  - Stellar payment transaction hash (`txHash`) and ledger sequence.
  - Lifecycle state machine status (`CaseStatus`).
  - Participant public keys, attestation signatures, and `BreakCode` identifiers.
- **What Stays Off-Chain (Private Databases)**:
  - Counterparty commercial identities, trade notes, invoices, and payment descriptions.
  - Raw financial metadata and internal accounting references.
