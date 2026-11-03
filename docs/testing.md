# Verification

Use Node.js 22.12 or newer; the recorded unit run used Node.js 24.22.1.

Run the checks from the repository root:

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run check` covers type checking, lint, unit tests, and the production build. End-to-end tests run separately because a browser installation is required. `PLAYWRIGHT_CHANNEL=msedge` can use an installed Edge browser instead of Playwright's Chromium.

Playwright starts or reuses the local app on `http://127.0.0.1:3100`, avoiding conflicts with other services using the default Next.js port. Telemetry is disabled for the test server so it does not need to write user-level Next.js configuration.

## Automated coverage

- Strict research input validation, including malformed text and unknown fields.
- Complete nine-section guides; distinct source, section, and checklist identifiers.
- Source-confirmed claims require references; references cannot point to absent sources.
- Fabricated agent-tested setup findings are rejected.
- HTTP-safe source URLs and machine-readable retrieval dates.
- Directory search, guide navigation, blocked/completed checklist persistence after reload, Markdown export, and light/dark switching.
- Graceful provider-directory empty state and invalid research request handling.
- Actual missing-API-key feedback and preserved provider input.
- Test-only HTTP fixtures exercise research rate limits, retry, NDJSON event rendering, successful guide navigation, and truncated-stream rejection. These verify the UI consumer and do not claim a paid live research call or a provider OAuth setup succeeded.
- Backend research and persistence tests cover their own boundaries with injected test transports rather than a production demo flow.

## Manual paid live verification

This session has no configured OpenAI API key. The real paid unfamiliar-provider journey must be verified by the evaluator after configuring one:

1. Start with the seeded guides and inspect the evidence panel.
2. Enter an unfamiliar provider, such as a provider not present in the directory.
3. Confirm the live events originate from actual API/search lifecycle events.
4. Open the resulting guide and inspect every source link, retrieval date, unsupported/unclear status, and unknown requirement.
5. Reload its URL, then open it in a private window to verify persisted public reading and independent checklist state.
6. Simulate a missing/invalid API key, provider API failure, and a canceled request. Check the error gives a recovery path without exposing upstream credentials.

No OAuth provider setup, approval, sign-in, or credential exchange is represented as tested. Provider-source validation is documented separately in `provider-validation.md`.

## Recorded results

- 2026-11-03: Vitest 4.1.12 passed **45 tests across 4 files**, using Node.js 24.22.1. Coverage includes schema/evidence integrity, injected research transport failures and orchestration, request security, SQLite persistence across connections, immutable snapshots, and persistent rate budgets.
- Paid OpenAI research and provider-console setup were not run; no API key or provider account was used.
