# Overview & Problem Statement

## The Settlement Reconciliation Challenge

Traditional post-trade financial reconciliation between counterparties is largely fragmented across disconnected spreadsheets, internal ledger databases, and manual email exchanges. Industry estimates show that between **2% to 5% of cross-border financial settlements experience breaks** due to timing discrepancies, rounding errors, mismatched transaction memos, or failed payment execution.

These discrepancies lead to:
- **Delayed Dispute Discovery**: Parties often take hours or days to discover mismatched settlement instructions.
- **Conflicting Records**: Disjoint off-chain databases lead to contradictory audit logs.
- **Privacy Trade-offs**: Traditional public blockchain settlement can accidentally expose confidential trade volumes, client identities, and bilateral pricing terms to competitors.

## The StellarClear Solution

**StellarClear** is an open-source, Stellar-native settlement evidence and reconciliation protocol. It automates bilateral trade verification by comparing off-chain settlement commitments against on-chain Stellar transactions, classifying variances using a deterministic break taxonomy, and immutably anchoring cryptographic proofs to Soroban smart contracts.

```text
┌────────────────────────┐      ┌────────────────────────┐
│ Expected Terms (Off)   │      │ Observed Payment (On)  │
│ - Trade Reference      │      │ - Stellar Tx Hash      │
│ - Asset & Amount       │      │ - Amount & Asset       │
│ - Destination Address  │      │ - Destination & Ledger │
└───────────┬────────────┘      └───────────┬────────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
           ┌─────────────────────────────────┐
           │        Matcher Engine           │
           │  (Exact Decimal Arithmetic &    │
           │     Break Classification)       │
           └────────────────┬────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
     ┌─────────────┐                 ┌─────────────┐
     │   MATCHED   │                 │    BREAK    │
     │  (Verified) │                 │ (Classified)│
     └──────┬──────┘                 └──────┬──────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
           ┌─────────────────────────────────┐
           │  Soroban SettlementRegistry     │
           │   (SHA-256 Anchored Proof)      │
           └─────────────────────────────────┘
```

## Non-Custodial Boundary

> [!IMPORTANT]
> **StellarClear does NOT move funds, hold user custody, or run escrow mechanisms.**

All token and asset transfers occur directly between counterparties' own Stellar accounts (`GA...` / `GB...`). StellarClear operates strictly as an **off-chain reconciliation engine, proof generator, and on-chain evidentiary audit anchor**.

## Core Protocol Pillars

1. **Deterministic Matcher Engine**: Compares financial amounts, assets, destination accounts, references, and deadline sequences with exact string and decimal arithmetic.
2. **Standardized Break Taxonomy**: Classifies any settlement discrepancy into one of 9 standardized `BreakCode` identifiers.
3. **Cryptographic Commitments**: Computes deterministic SHA-256 hashes using canonical JSON serialization (`RFC 8785`), preserving commercial privacy while proving data integrity.
4. **On-Chain Soroban Anchoring**: Records cryptographic commitments, multi-party attestations, and lifecycle state changes on the `SettlementRegistry` smart contract.
5. **Portable Settlement Proofs**: Packages self-contained, offline-verifiable JSON proof artifacts containing transaction references and multi-party digital signatures.
