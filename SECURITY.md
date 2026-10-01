# Security Policy

## Reporting Security Vulnerabilities

Please report security issues using **GitHub Private Vulnerability Reporting** (Security tab → Advisories → Report a vulnerability) or by emailing our security team directly:

- **Responsible Disclosure Email:** [`security@stellarclear.io`](mailto:security@stellarclear.io) / [`adejumooluwasegun35@gmail.com`](mailto:adejumooluwasegun35@gmail.com)

Please do not open public issues for security vulnerabilities. When submitting a report, include detailed reproduction steps, environment, affected versions, and security impact.

## Security Status

> **UNAUDITED CODE**: This repo is under active development and has not undergone a formal third-party audit. Do not use with real funds in production without prior audit. On-chain layer: see `stellarclear-contract/SECURITY.md`.

## Defined Scope

### In-Scope
- **Reconciliation & Matching**: Bypass vulnerabilities in `services/matcher` allowing false matches or break evasion.
- **Proof & Commitments**: Cryptographic commitment/proof tampering or forgery vulnerabilities in `packages/proof`.
- **API & Authentication**: Input validation, authorization, and error sanitization vulnerabilities in `services/api`.
- **Indexer & Ingestion**: Unsafe event deserialization or state corruption in `services/indexer`.
- **Persistence & Idempotency**: Database state manipulation, duplicate row insertion, or cursor tampering in `packages/db`.

### Out-of-Scope
- Toolchain and compiler bugs in upstream dependencies (Node.js, TypeScript).
- Social engineering, phishing, or physical attacks.
- Off-chain third-party infrastructure outside the StellarClear codebase.

