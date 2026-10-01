# Contributing to StellarClear

Thanks for contributing — all contributors welcome.

## Quick start

```bash
npm install
npm run build
npm test
```

Node `>=22.12.0`, npm `>=10`.

To regenerate Soroban bindings you need a `settlement_registry.wasm` build from
[`stellarclear-contract`](https://github.com/StellarClear/stellarclear-contract):

```bash
SETTLEMENT_REGISTRY_WASM=/path/to/settlement_registry.wasm npm run generate:bindings
```

Copy `.env.example` to `.env` and set `STELLAR_CONTRACT_ID` to your testnet deployment.

## How to pick up an issue

- Look for `good first issue` / `help wanted` labels.
- Comment to request assignment before starting work.
- Keep PRs focused; one issue per PR.
- Add/extend tests under `tests/` for behavior changes.
- Run `npm run build && npm test` before pushing.

## PR checklist

- [ ] Linked issue with scope and acceptance criteria
- [ ] Tests added or updated, all green
- [ ] `npm run typecheck` clean
- [ ] No secrets committed (`.env` stays local, never commit real keys)
- [ ] Apache-2.0 applies — all contributions under same license

## Code of conduct

Be respectful and constructive. See `CODE_OF_CONDUCT.md`.
