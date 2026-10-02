# Canonical Serialization & SHA-256 Commitments

To anchor sensitive trade terms to Soroban without revealing confidential commercial numbers on-chain, StellarClear uses deterministic cryptographic commitments.

## Canonical JSON Serialization (`RFC 8785`)

Cryptographic hashing requires deterministic byte serialization regardless of object key order, whitespace, or floating-point formatting. StellarClear implements canonical JSON serialization following **RFC 8785**:

1. **Deterministic Key Ordering**: Object keys are sorted lexicographically by UTF-16 code units.
2. **Whitespace Stripping**: Zero insignificant whitespace, tabs, or newlines.
3. **Decimal Precision**: Financial numbers are encoded as exact string representations (`"1000.0000000"`).
4. **UTF-8 Byte Encoding**: String values are serialized as UTF-8 byte arrays.

## Commitment Types & Domain Separation

Every protocol commitment uses an explicit domain prefix to prevent cross-protocol collision attacks:

### 1. Terms Commitment (`termsCommitment`)
- **Domain Tag**: `STELLARCLEAR/TERMS/V1`
- **Formula**:
  $$\text{termsCommitment} = \text{SHA-256}(\text{UTF-8}(\text{canonical}(\text{ExpectedSettlement})))$$
- **Anchored At**: `create_case`

### 2. Observation Commitment (`observationCommitment`)
- **Domain Tag**: `STELLARCLEAR/OBSERVATION/V1`
- **Formula**:
  $$\text{observationCommitment} = \text{SHA-256}(\text{UTF-8}(\text{canonical}(\text{ObservedSettlement})))$$
- **Anchored At**: `record_observation`

### 3. Resolution Commitment (`resolutionCommitment`)
- **Domain Tag**: `STELLARCLEAR/RESOLUTION/V1`
- **Formula**:
  $$\text{resolutionCommitment} = \text{SHA-256}(\text{UTF-8}(\text{canonical}(\text{ResolvedTerms})))$$
- **Anchored At**: `submit_resolution`

## Deterministic Case Identifier (`caseId`)

The unique 32-byte case identifier is generated deterministically from the case parameters:

$$\text{caseId} = \text{SHA-256}(\text{UTF-8}(\text{canonical}(\{ \text{owner}, \text{counterparty}, \text{tradeReference} \})))$$

This ensures idempotent case creation across all participants and prevents duplicate records for identical trade agreements.
