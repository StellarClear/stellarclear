# StellarClear

<div align="center">

<!-- Banner / Logo Placeholder -->
<p align="center">
  <img src="assets/banner.png" alt="StellarClear Banner" width="100%" onerror="this.style.display='none'"/>
</p>

[![CI](https://github.com/StellarClear/stellarclear/actions/workflows/ci.yml/badge.svg)](https://github.com/StellarClear/stellarclear/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Soroban](https://img.shields.io/badge/Soroban-v22-purple.svg)](https://soroban.stellar.org)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](https://github.com/StellarClear/stellarclear/releases/tag/v0.1.0)

<p align="center">
  <strong>Open-source Stellar-native settlement evidence and reconciliation protocol.</strong>
</p>

</div>

---

## Overview

StellarClear provides cryptographic certainty and operational visibility for institutional and peer-to-peer financial settlements on the Stellar network.

The protocol continuously compares:
1. **Expected Settlement Instructions** (off-chain bilateral agreements, trade parameters, deadlines), and
2. **Observed Stellar Transactions** (on-chain payments, ledger timestamps, asset transfers),

and produces:
- **Deterministic Reconciliation**: Automated match verification or precise break classification (asset mismatch, amount variance, destination routing errors, late settlements).
- **Cryptographic Commitments**: SHA-256 canonical commitments binding off-chain terms to on-chain state without leaking confidential trade terms.
- **On-Chain Soroban Anchoring**: Immutable settlement records in the `SettlementRegistry` contract.
- **Multi-Party Attestation**: Digital confirmations from owners, counterparties, and independent observers.
- **Portable Settlement Proofs**: Self-contained JSON-LD/schema proofs independently verifiable offline and against live Soroban state.

> **Contract Layer**: The smart contract implementation is hosted in [`StellarClear/stellarclear-contract`](https://github.com/StellarClear/stellarclear-contract) (`SettlementRegistry`). This monorepo consumes generated TypeScript bindings in `packages/settlement-registry`.

---

## Architecture

StellarClear combines high-throughput off-chain processing with tamper-evident on-chain anchoring:

```
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

- **API Service (`services/api`)**: Dispatcher providing REST endpoints for case creation, observation submissions, reconciliation, attestations, disputes, and diagnostic health checks.
- **Matcher Service (`services/matcher`)**: Pure deterministic reconciliation engine performing exact decimal amount arithmetic and break code classification.
- **Indexer Service (`services/indexer`)**: Streaming ledger ingestion service that decodes Soroban contract events and maintains durable checkpoints.
- **Proof Package (`packages/proof`)**: Canonical deterministic JSON serialization and cryptographic commitment generation.
- **Database Package (`packages/db`)**: Repository abstraction supporting PostgreSQL with strict idempotency and deduplication.
- **Client SDK (`packages/sdk`)**: TypeScript client library with typed contract bindings, error normalization, and lifecycle helpers.

---

## Monorepo Structure

```text
stellarclear/
├── packages/
│   ├── schemas/               # Protocol Zod schemas and TypeScript domain models
│   ├── proof/                 # Canonical serialization and proof generator/verifier
│   ├── db/                    # Settlement persistence layer (PostgreSQL & In-Memory)
│   ├── settlement-registry/   # Generated Soroban contract TypeScript bindings
│   └── sdk/                   # StellarClear TypeScript client SDK
├── services/
│   ├── matcher/               # Deterministic settlement reconciliation engine
│   ├── indexer/               # Durable Stellar & Soroban event ingestion service
│   └── api/                   # REST API service (Fastify-compatible dispatcher)
├── docs/                      # Technical architecture and operational specifications
└── tests/                     # Unit, security, and live Soroban integration tests
```

---

## Quick Start

### Prerequisites
- **Node.js**: `>=22.12.0`
- **npm**: `>=10.0.0`
- **Stellar CLI**: (Optional, for contract deployment/bindings)

### Installation & Build

```bash
# 1. Clone the repository
git clone https://github.com/StellarClear/stellarclear.git
cd stellarclear

# 2. Install dependencies
npm install

# 3. Build all workspace packages and services
npm run build

# 4. Run the full test suite (192+ tests)
npm test
```

### Modular Test Pipelines

```bash
npm run test:unit         # Unit and contract release tests
npm run test:api          # API endpoints & operational health diagnostics
npm run test:security     # Adversarial security & idempotency regression tests
npm run test:indexer      # Indexer & event synchronization tests
npm run test:integration  # Live Soroban contract integration tests

# Run comprehensive 8-stage pre-release verification pipeline
npm run verify:release
```

---

## Environment Configuration

Copy the example environment file to configure network and database connections:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `STELLAR_NETWORK` | Target Stellar network | `testnet` |
| `STELLAR_NETWORK_PASSPHRASE` | Network passphrase | `Test SDF Network ; September 2015` |
| `STELLAR_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `STELLAR_CONTRACT_ID` | Deployed `SettlementRegistry` ID | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/stellarclear` |
| `API_PORT` | REST API HTTP port | `3000` |

---

## Security & Privacy Boundary

The protocol maintains strict separation between private trade details and public ledger anchors:
- **Private Data (Off-Chain)**: Trade references, exact counterparty information, payment descriptions, and internal bookkeeping details remain in private off-chain databases.
- **Public Anchors (On-Chain)**: Only deterministic SHA-256 commitments (`termsCommitment`, `observationCommitment`, `resolutionCommitment`), Stellar transaction references, case lifecycle states, and participant attestations are written to Soroban.

---

## Maintainers

| Maintainer | Role | GitHub |
| :--- | :--- | :--- |
| **Oluwasegun Adejumo** | Lead Protocol Engineer | [@smog123](https://github.com/smog123) / [@Adejumo-2](https://github.com/Adejumo-2) |

---

## Community & Discussions

- **GitHub Discussions**: [StellarClear Discussions](https://github.com/StellarClear/stellarclear/discussions)
- **Issues & Roadmap**: [GitHub Issues](https://github.com/StellarClear/stellarclear/issues)
- **Stellar Developers**: [Stellar Developer Discord](https://discord.gg/stellardev)

---

## Contributing

Contributions are welcome! Please check our open issues and read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for development workflows, branch naming, and pull request guidelines.

---

## Contributors

Made with [contrib.rocks](https://contrib.rocks).

<a href="https://github.com/StellarClear/stellarclear/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=StellarClear/stellarclear" alt="StellarClear Contributors" />
</a>

---

## License

Apache-2.0 — see [`LICENSE`](./LICENSE) for details.
