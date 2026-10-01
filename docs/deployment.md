# StellarClear Deployment Guide

This guide covers deployment procedures for StellarClear across development, staging (Testnet), and production environments.

---

## 1. Prerequisites & System Requirements

- **Node.js**: `>=22.12.0`
- **npm**: `>=10.0.0`
- **PostgreSQL**: `>=15.0`
- **Stellar CLI**: `@stellar/cli` or standalone binary
- **Rust Toolchain**: `stable` with `wasm32v1-none` target (for contract compilation)

---

## 2. Environment Configuration

StellarClear services and packages are configured via standard environment variables. Create a `.env` file based on `.env.example`:

```bash
# Network & Stellar Configuration
STELLAR_NETWORK=testnet
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
STELLAR_CONTRACT_ID="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM"

# Off-Chain Persistence
DATABASE_URL="postgres://stellarclear:stellarclear@localhost:5432/stellarclear_db"

# API & Gateway Ports
API_PORT=3000
API_HOST="0.0.0.0"

# Observer Credentials (for signing on-chain anchors)
OBSERVER_SECRET_KEY="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

---

## 3. Soroban Smart Contract Deployment

1. **Compile the SettlementRegistry Contract**:
   From the contract repository (`stellarclear-contract`):
   ```bash
   stellar contract build
   ```

2. **Deploy the WASM to Stellar**:
   ```bash
   stellar contract deploy \
     --wasm target/wasm32v1-none/release/settlement_registry.wasm \
     --source <DEPLOYER_SECRET_OR_IDENTITY> \
     --network testnet
   ```
   Save the returned Contract ID (e.g. `CAAA...`).

3. **Initialize the Contract**:
   ```bash
   stellar contract invoke \
     --id <CONTRACT_ID> \
     --source <DEPLOYER_SECRET_OR_IDENTITY> \
     --network testnet \
     -- __constructor \
     --admin <ADMIN_PUBLIC_KEY>
   ```

4. **Authorize Observers**:
   ```bash
   stellar contract invoke \
     --id <CONTRACT_ID> \
     --source <ADMIN_SECRET_OR_IDENTITY> \
     --network testnet \
     -- add_observer \
     --observer <OBSERVER_PUBLIC_KEY>
   ```

5. **Generate TypeScript Monorepo Bindings**:
   In `stellarclear-app` monorepo root:
   ```bash
   SETTLEMENT_REGISTRY_WASM=/path/to/settlement_registry.wasm npm run generate:bindings
   ```

---

## 4. Database Setup & Migrations

StellarClear uses PostgreSQL for off-chain indexed data and private settlement metadata.

1. **Initialize Database**:
   ```bash
   createdb stellarclear_db
   ```

2. **Apply Schema Migrations**:
   The database schema is defined in `@stellarclear/db`. Tables created include:
   - `settlement_cases`
   - `settlement_observations`
   - `reconciliation_results`
   - `breaks`
   - `contract_events`
   - `attestations`
   - `disputes`
   - `resolutions`
   - `ingestion_cursors`
   - `idempotency_records`

---

## 5. Running Monorepo Services

### API Service
```bash
npm run build
node services/api/dist/index.js
```

### Ingestion Indexer Service
```bash
node services/indexer/dist/index.js
```

---

## 6. Docker & Container Deployment

StellarClear includes production-ready Dockerfile structures:

```dockerfile
# Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY services/ ./services/
COPY tsconfig.base.json ./
RUN npm ci
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["node", "services/api/dist/index.js"]
```

Run with `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: stellarclear
      POSTGRES_PASSWORD: password
      POSTGRES_DB: stellarclear_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://stellarclear:password@postgres:5432/stellarclear_db
      - STELLAR_RPC_URL=https://soroban-testnet.stellar.org
      - STELLAR_NETWORK=testnet
    depends_on:
      - postgres

volumes:
  pgdata:

---

## 7. Release Candidate Promotion & Verification

Before promoting builds to production staging or mainnet:
1. Follow the verification gates in [Release Candidate Runbook](./release-candidate-runbook.md).
2. Execute `npm run verify:release`.
3. Inspect operational diagnostics at `GET /v1/operations/diagnostics`.

```
