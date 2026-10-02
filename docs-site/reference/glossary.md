# Protocol Glossary

This glossary defines key cryptographic, domain, and architecture terms used throughout StellarClear.

## Core Terms

- **`termsCommitment`**: 32-byte SHA-256 cryptographic digest of canonical JSON-serialized expected settlement terms (`STELLARCLEAR/TERMS/V1`).
- **`observationCommitment`**: 32-byte SHA-256 cryptographic digest of canonical JSON-serialized observed Stellar payment data (`STELLARCLEAR/OBSERVATION/V1`).
- **`resolutionCommitment`**: 32-byte SHA-256 cryptographic digest of canonical JSON terms agreed upon during dispute resolution (`STELLARCLEAR/RESOLUTION/V1`).
- **`caseId`**: Deterministic 32-byte hexadecimal hash uniquely identifying a bilateral settlement agreement between an owner and counterparty.
- **`Observer`**: An authorized independent third-party entity or oracle node registered on-chain in `SettlementRegistry` capable of recording observations, reconciliation decisions, and attestations.
- **`Attestation`**: A cryptographic digital signature submitted by an owner, counterparty, or observer affirming agreement with a settlement state.
- **`BreakCode`**: A standardized machine-readable error code classifying the exact parameter variance during reconciliation (e.g., `AMOUNT_MISMATCH`, `LATE_SETTLEMENT`).
- **`Settlement Proof`**: A portable, self-contained JSON artifact containing transaction hashes, commitments, and digital signatures proving a settlement occurred and anchored to Soroban.
- **`Canonical JSON (RFC 8785)`**: Deterministic byte representation of JSON data guaranteeing invariant hashing regardless of key order or whitespace.
- **`SettlementRegistry`**: The authoritative Soroban Rust smart contract managing lifecycle states, commitments, and attestations on the Stellar network.
