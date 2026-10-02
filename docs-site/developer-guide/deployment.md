# Docker & Multi-Service Deployment

StellarClear includes a production-grade multi-stage `Dockerfile` and a 3-service `docker-compose.yml` topology defining `postgres`, `indexer`, and `api`.

## Service Architecture Topology

```text
               ┌────────────────────────┐
               │    Client Application  │
               └───────────┬────────────┘
                           │ HTTP Requests (Port 3000)
                           ▼
               ┌────────────────────────┐
               │      REST API (api)    │
               └───────────┬────────────┘
                           │
             ┌─────────────┴─────────────┐
             │ Internal Private Network  │
             ▼                           ▼
┌────────────────────────┐   ┌────────────────────────┐
│  PostgreSQL (postgres) │◄──┤ Streaming Worker (idx) │
└────────────────────────┘   └───────────┬────────────┘
                                         │ Soroban RPC Event Polling
                                         ▼
                             ┌────────────────────────┐
                             │   Stellar / Soroban    │
                             └────────────────────────┘
```

## Running the Full Stack with Docker Compose

To start all services in detached mode:

```bash
docker compose up -d
```

### Checking Service Logs

```bash
# View API service logs
docker compose logs -f api

# View Indexer streaming worker logs
docker compose logs -f indexer

# View PostgreSQL logs
docker compose logs -f postgres
```

### Verifying Service Health

```bash
curl http://localhost:3000/health
```

## Multi-Stage Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY services/ ./services/
RUN npm ci
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["node", "services/api/dist/main.js"]
```
