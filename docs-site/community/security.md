# Security Policy & Vulnerability Disclosure

Security and audit integrity are paramount to the StellarClear protocol.

## Reporting Security Vulnerabilities

Please report security issues using **GitHub Private Vulnerability Reporting** (Security tab → Advisories → Report a vulnerability) or by emailing our security team:

- **Responsible Disclosure Email:** [`security@stellarclear.io`](mailto:security@stellarclear.io) / [`adejumooluwasegun35@gmail.com`](mailto:adejumooluwasegun35@gmail.com)

> [!WARNING]
> Please do NOT open public GitHub issues for sensitive security vulnerabilities. Include detailed reproduction steps, environment, affected versions, and security impact in private reports.

## Security Status

> **UNAUDITED CODE DISCLAIMER**: This codebase is under active development and has not undergone a formal third-party security audit. It is deployed exclusively to the **Stellar Testnet** for testing and demonstration purposes. Do not use with real mainnet funds without prior independent security audit.

## Defined Scope

### In-Scope
- **Reconciliation & Matching Engine**: Bypass vulnerabilities in `services/matcher` allowing false matches or break evasion.
- **Proof & Commitments**: Cryptographic commitment/proof tampering or forgery vulnerabilities in `packages/proof`.
- **API & Authentication**: Input validation, authorization, and error sanitization in `services/api`.
- **Indexer & Ingestion**: Unsafe event deserialization or state corruption in `services/indexer`.
- **Persistence & Idempotency**: Database state manipulation, duplicate row insertion, or cursor tampering in `packages/db`.

### Out-of-Scope
- Toolchain and compiler bugs in upstream dependencies (Node.js, TypeScript).
- Social engineering, phishing, or physical attacks.
- Off-chain third-party infrastructure outside the StellarClear codebase.
