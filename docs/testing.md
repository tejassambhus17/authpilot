# Verification

The final engineering pass on 3 November 2026 passed **192 unit tests**, **19 browser journeys**, TypeScript, lint, and a production build. The focused research-quality benchmark passed **18 deterministic cases**, with **8** separate evidence-path integration checks and **46** source-retrieval guard tests included in the unit total. These subsets overlap the total and must not be added to it. See [final validation](final-validation.md) for actual live outcomes, retained failures, corrections, and unexecuted production checks.

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
- Library search and recovery, all three example guides, four-state checklist reload persistence, Markdown export, share feedback, and persisted light/dark switching.
- Explore-to-research navigation with a prefilled provider and no automatic paid request; invalid research input handling.
- Browser-local save/unsave across library, Saved, guide view, navigation, and reload; public shared content with independent progress in a fresh browser session.
- Mobile navigation, accessible keyboard tabs, and honest evidence labels without whole-guide setup verification.
- Missing-API-key feedback and preserved provider input. An unconfigured server exercises its real response; a configured server uses a conditional test-only health/503 fixture so the test never changes or exposes credentials.
- Test-only HTTP fixtures exercise research rate limits, retry, NDJSON event rendering, successful guide navigation, cancellation, and truncated-stream rejection. These verify the UI consumer and do not claim a paid live research call or a provider OAuth setup succeeded.
- Backend research and persistence tests cover their own boundaries with injected test transports rather than a production demo flow.

## Manual paid live verification

To verify unfamiliar-provider generation with your own server-side OpenAI API key, follow this sequence. Automated fixtures do not incur paid API calls:

1. Start with the seeded guides and inspect their Sources tab and evidence labels.
2. Enter an unfamiliar provider on Explore, continue to the prefilled research screen, and explicitly start research.
3. Confirm the live events originate from actual API/search lifecycle events.
4. Open the resulting guide and inspect every source link, retrieval date, unsupported/unclear status, and unknown requirement.
5. Reload its URL, save and reopen it from Saved, export Markdown, then open the share URL in a private window to verify persisted public content and independent checklist/bookmark state.
6. Run the separate failure-fixture tests for missing configuration, rate limits, cancellation, and interruption. Check the error gives a recovery path without exposing upstream credentials.

No OAuth provider setup, approval, sign-in, or credential exchange is represented as tested. Provider-source validation is documented separately in `provider-validation.md`.

## Recorded results

- **Final reference redesign, 2026-11-03:** TypeScript, lint, **85 unit tests**, and the production build passed. All **16 Playwright tests passed** against installed Edge after the final icon and navigation-label changes. Browser transport fixtures stayed within the tests; no paid research was triggered by this suite.
- One genuine **Notion** request through the redesigned UI produced persisted guide `notion-626d0e8d-c08` with six official citations. Its actual event stream showed 38 observed events and 35 returned search candidates before completion; candidates are not equivalent to final citations. Reload, Saved reopening, share feedback, fresh-session reading with independent progress, and Markdown HTTP 200 were verified without a second research request. An exact elapsed duration was not retained. Two independently sampled official-documentation groups were corroborated, without claiming complete guide certification or provider setup.
- The final visual pass opened twelve matrix screenshots and two stored Notion screenshots. Seventeen route/theme/viewport checks at **1440×900**, **390×844**, and **768×1024** found zero horizontal overflow and zero browser page errors. Both official Notion icons decoded with natural dimensions 64×64. The final recapture issued zero research POSTs. The retained active-research screenshot is historical evidence from the genuine request before the icon hookup, not a recreated active state. See [redesign validation](redesign-validation.md) for the bounded source audit and artifact inventory.

### Earlier verification before the reference redesign

The following records describe the preceding implementation and runtime fixes. Their test counts are historical; the final redesign results above supersede them.

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
