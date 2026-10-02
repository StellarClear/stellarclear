# Break Taxonomy & Classification

When expected settlement terms conflict with observed Stellar transactions, the matcher engine deterministically classifies the discrepancy into one of 9 standardized break codes.

## Complete Break Taxonomy Table

| Break Code | Discriminant Tag | Exact Trigger Condition | Resolution Action |
| :--- | :--- | :--- | :--- |
| **`AMOUNT_MISMATCH`** | `AmountMismatch` | `observed.amount !== expected.amount` | Counterparty submits top-up transfer or agrees to revised amount via dispute resolution. |
| **`ASSET_MISMATCH`** | `AssetMismatch` | `observed.asset !== expected.asset` | Correct asset transfer required; incorrect transfer returned off-chain. |
| **`DESTINATION_MISMATCH`** | `DestinationMismatch` | `observed.destination !== expected.expectedDestination` | Verify destination account routing; resubmit to agreed address. |
| **`REFERENCE_MISMATCH`** | `ReferenceMismatch` | `observed.reference !== expected.reference` | Confirm invoice / payment memo tag mapping. |
| **`MISSING_SETTLEMENT`** | `MissingSettlement` | No transaction observed before `expected.deadline` sequence | Execute missing transfer or cancel expired trade agreement. |
| **`DUPLICATE_SETTLEMENT`** | `DuplicateSettlement` | Multiple conflicting payment transfers observed for a single case ID | Identify duplicate payment and refund redundant transaction. |
| **`LATE_SETTLEMENT`** | `LateSettlement` | `observed.ledger > expected.deadline` | Counterparties open dispute to accept late payment or agree penalty terms. |
| **`FAILED_TRANSACTION`** | `FailedTransaction` | Observed Stellar transaction completed with failed execution status (`op_failed`, `tx_bad_auth`, etc.) | Retry transaction submission on Stellar network with valid signatures/balance. |
| **`UNEXPECTED_TRANSACTION`** | `UnexpectedTransaction` | Observed transaction contains malformed or unregistered trade metadata | Validate trade reference and schema compliance. |

## Matcher Precedence Logic

The matcher evaluates settlement conditions in deterministic precedence order:

1. **Transaction Existence Check**: If no transaction exists and current ledger sequence exceeds deadline $\rightarrow$ `MISSING_SETTLEMENT`.
2. **Execution Status Check**: If transaction is marked failed $\rightarrow$ `FAILED_TRANSACTION`.
3. **Asset & Destination Check**: Validates asset code/issuer and recipient account $\rightarrow$ `ASSET_MISMATCH` or `DESTINATION_MISMATCH`.
4. **Amount Verification**: Performs exact 7-decimal string arithmetic $\rightarrow$ `AMOUNT_MISMATCH`.
5. **Timeline Verification**: Verifies observed ledger sequence against deadline $\rightarrow$ `LATE_SETTLEMENT`.
6. **Reference Verification**: Validates trade reference and memo $\rightarrow$ `REFERENCE_MISMATCH`.
7. **Clean Match**: If all checks pass $\rightarrow$ `MATCHED`.
