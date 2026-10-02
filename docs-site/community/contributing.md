# Contributing to StellarClear

We welcome contributions to the StellarClear protocol, documentation, SDKs, and developer tools.

## Development Workflow

1. **Pick an Issue**: Check our open issues on GitHub and request assignment before starting.
2. **Dedicated Branch**: Create a focused branch for your work (e.g. `feat/observer-quorum`).
3. **Reproducible Install**: Use `npm ci` for deterministic dependencies.
4. **Code & Test**: Write code and add unit/integration tests under `tests/`.
5. **Pre-flight Verification**: Run the full validation suite:
   ```bash
   npm run typecheck
   npm test
   npm run verify:release
   ```

## Commit Conventions

All commit messages and PR titles must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new user-facing features or capabilities
- `fix:` for bug fixes and error resolution
- `docs:` for documentation additions and updates
- `test:` for test additions, unit tests, and regression tests
- `chore:` for maintenance, dependency updates, and housekeeping
- `refactor:` for code improvements that do not alter external behavior

Example: `feat(sdk): add observer quorum verification helper`

## Pull Request Checklist

- [ ] Linked GitHub issue with scope and acceptance criteria
- [ ] All tests passing (`npm test`)
- [ ] TypeScript strict typecheck clean (`npm run typecheck`)
- [ ] Pre-release verification gates passing (`npm run verify:release`)
- [ ] Conventional Commit format used
- [ ] No secrets or private keys committed
- [ ] Apache-2.0 license applies to all contributions
