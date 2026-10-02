# Protocol Roadmap & Release Scope

This page outlines the deployed `v0.1.0` capabilities alongside planned post-v0.1.0 roadmap items.

## Current Deployed Scope (`v0.1.0`)

The current release is deployed and active on the **Stellar Testnet**:
- **Contract ID**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- **Implemented Features**:
  - Deterministic 7-state settlement lifecycle state machine on Soroban.
  - Standardized 9-category reconciliation break taxonomy.
  - Canonical JSON serialization (`RFC 8785`) & SHA-256 commitments.
  - Portable, self-contained `SettlementProof` bundle generation and offline verification.
  - 19 REST API endpoints for case management, attestations, disputes, and operational health probes.
  - PostgreSQL persistence with strict idempotency protection.
  - Standalone streaming indexer service with durable checkpointing.
  - Production-grade multi-stage Dockerfile and Docker Compose topology (`postgres`, `indexer`, `api`).

---

## Active Roadmap Backlog

The following features represent upcoming roadmap items tracked on GitHub:

| Issue | Area | Title | Dependencies / Scope |
| :--- | :--- | :--- | :--- |
| **#2** | Indexer | `feat(indexer): add real-time websocket event subscription stream` | Enables client applications to subscribe to streaming settlement transitions. |
| **#3** | CI / Testing | `test(e2e): automate multi-party attestation flow against testnet` | Continuous automated testing of ephemeral settlement cases on Testnet. |
| **#16** | SDK & API | `feat(sdk,api): add observer quorum verification and threshold attestation support` | Multi-oracle quorum validation (`M-of-N`). Depends on `stellarclear-contract#5`. |
| **#17** | Indexer | `feat(indexer): handle on-chain dispute expiration TTL events and state progression` | Automated off-chain state updates when dispute TTL expires. Depends on `stellarclear-contract#6`. |
| **#18** | API / Ops | `feat(api): expose Prometheus-compatible metrics endpoint for operational telemetry` | Prometheus exposition format (`/metrics`) for Grafana scrapers. |
| **#19** | Indexer | `feat(indexer): add exponential backoff and jitter for resilient RPC error recovery` | Adaptive backoff during RPC rate limits and transient network partitions. |
