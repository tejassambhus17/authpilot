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

To verify unfamiliar-provider generation with your own server-side OpenAI API key, follow this sequence. Automated fixtures do not incur paid API calls:

1. Start with the seeded guides and inspect the evidence panel.
2. Enter an unfamiliar provider, such as a provider not present in the directory.
3. Confirm the live events originate from actual API/search lifecycle events.
4. Open the resulting guide and inspect every source link, retrieval date, unsupported/unclear status, and unknown requirement.
5. Reload its URL, then open it in a private window to verify persisted public reading and independent checklist state.
6. Simulate a missing/invalid API key, provider API failure, and a canceled request. Check the error gives a recovery path without exposing upstream credentials.

No OAuth provider setup, approval, sign-in, or credential exchange is represented as tested. Provider-source validation is documented separately in `provider-validation.md`.

## Recorded results

- 2026-11-03 runtime regression: reproduced the real `ERR_REQUIRE_ESM` by loading `@tailwindcss/postcss` on the system Node 20.9.0; the same installed plugin loaded successfully on Node 24.22.1. Added a portable npm runtime launcher and an ignored local Node 24 executable for this machine. The launcher chooses an explicit shell override, the current supported runtime, or the local fallback; it does not change the system Node. `npm run runtime` now reports 24.22.1 when invoked from the original Node 20.9/npm 10 shell.
- After the runtime correction, normal npm commands passed TypeScript, lint, **80 unit tests across 5 files**, and the production build. New regression cases load the real PostCSS plugin, check the runtime inherited by child tools, preserve arguments and failure exit codes, and reject an invalid runtime override with actionable instructions.
- All **8 browser tests passed** against a fresh dev server launched through the corrected npm commands. This exercised actual font/Tailwind CSS compilation as well as the existing user journeys; no paid research calls were made for this runtime fix.

- 2026-11-03: Vitest 4.1.12 passed **77 tests across 4 files**, using Node.js 24.22.1. Coverage includes schema/evidence integrity, accidental credential rejection, injected research transport failures and orchestration, request security, SQLite persistence across connections, immutable snapshots, persistent rate budgets, automatic downgrading of explicit uncertainty, and model-specific reasoning options.
- 2026-11-03: **All 8 Playwright browser tests passed** against the rebuilt production app using installed Edge. The real browser found a same-origin validation mismatch caused by Next.js's internal URL hostname; the guard was corrected, security cases added, and the actual missing-key submission passed in the final run.
- Visual verification covered desktop library, guide, research, dark theme, and mobile library. Screenshots had no horizontal overflow at 1440 px or 390 px. Final metrics confirmed 15 px guide text with 26.25 px line height, a 75ch reading limit, visible panel focus outlines, and 44 px primary/menu targets.
- The final mobile-close correction was checked separately against the frozen build: the targeted browser test passed, the close target measured 44 × 44 px, and close/reopen navigation worked. The same five screenshots were recaptured after QA cleanup, with an additional navigation screenshot; every image was opened and checked for valid content.
- Production dependency audit reported **0 vulnerabilities**. The full development dependency audit has **16 moderate transitive minimatch findings**. The earlier critical test-runner dependency findings were removed by upgrading to Vitest 4.1.12.
- An exact-match scan of 32 compiled client JavaScript/JSON files found no configured server API key. The key itself was not logged or included in review artifacts.
- Three genuine, unmocked Linear requests verified the research-to-guide workflow and informed evidence-grounding improvements. The final GPT-5.5 request completed in 129 seconds, selected ten official sources, persisted after reload, and returned HTTP 200 for Markdown export. A fresh independent audit found no material error in three sampled lifecycle/approval claim groups. Earlier semantic errors are retained with errata in the validation record. See `live-validation.md` and `examples/linear-final.md`; this is not full-guide certification. Provider-console setup, sign-in, token exchange, and approval remain untested.
