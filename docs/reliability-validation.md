# Research reliability and launch planning

Follow-up to the browser audit supplied by the owner, 3 November 2026. Work remains on `main`; no push or deployment was performed. The existing charcoal/violet desktop interface and connected routes are preserved.

## Audit findings addressed

| Finding | Result and boundary |
| --- | --- |
| Figma URL search failed before a successful name retry | Transient search, synthesis, and separate-assessment failures receive at most one observed stage retry within the same request budget. Known authentication, quota, refusal, output-limit, validation and save failures are not automatically retried. The cause of the historical failure was not established; this change does not claim to establish it or guarantee availability. |
| No useful hands-on duration | New output requires separate numeric registration and implementation ranges with assumptions, clearly labelled planning estimates. Older supported snapshots use an explicitly generic baseline. Unsupported/unclear OAuth has no executable effort estimate. Approval waiting remains separate source evidence or unknown. |
| Private/public/listing tasks mixed together | Research collects audience, API/scope interests, declared permissions, and optional listing interest. Server-authored original context travels with the guide; personal changes stay local. Explicit path metadata controls filtering. Only explicitly optional listing tasks can be excluded by the listing preference. Conflicting internal/listing preferences retain both audience branches. |
| No Not applicable state | Added a fifth personal state with omitted counts and a visible caveat. Skipping a required prerequisite cannot satisfy its dependencies. A plan with no remaining applicable tasks is not represented as a successfully executed OAuth setup. |
| Figma refresh-token rotation / missing PKCE | Generic generation and review instructions now distinguish refresh-token reuse, access-token replacement, refresh-token rotation, and required versus recommended PKCE. The audited historical snapshot has a dated, manually sourced amendment; original storage and inaccurate wording are retained transparently. See [provider corrections](provider-corrections.md). |
| Generic blocked-step recovery | Curated steps now record explicit dependencies, direct documentation, recovery instructions and responsible roles. Personal blocker reason/owner fields persist in this browser. Explicitly independent planning may continue; blocked tasks remain excluded from immediate action. |
| Google and Slack timing gaps | Updated the affected official-documentation timing branches and conditions. Google branding is separate from scope verification; Slack Marketplace expectations are separate from internal/admin consent. Published review expectations are not approval promises. |
| Loopback URL accepted | Shared client/server input validation rejects localhost, address literals including encoded loopback forms, internal suffixes and unsupported ports before paid research. This checks input spelling, not DNS ownership. Existing page retrieval independently resolves and pins public addresses. |
| Duplicate campaign links | Shared canonicalization removes known tracking parameters and fragments for candidate identity while retaining semantic query parameters. Displayed source candidates are deduplicated; they remain distinct from final guide citations. |
| Practical setup attempt missing | Recorded an actual unauthenticated GET of GitHub's registration entry, its restricted DNS failure, and a permitted retry reaching the sign-in page. No form, credentials, client registration, token exchange or review submission was attempted. This is a public-console preflight, not a completed OAuth setup. |

## Reliability boundaries

The server creates a request reference, returns it in headers/JSON/stream events, and includes it with sanitized failure diagnostics. It never logs the query, source text, response body, key, or token. The interface preserves input and context after failure, displays the reference, and measures actual elapsed time without inventing research activity.

SDK hidden retries are disabled. An explicit stage retry emits an event only after a retry-eligible failure. A known `Retry-After` longer than five seconds is not ignored; the request instead fails with an explicit recovery path. Cancellation and the remaining deadline prevent another attempt. Validation and database saves are never retried automatically. A new user submission is a new request and can incur additional charges.

The 270-second application budget begins at handler entry, including database admission. A fake-clock route regression verifies that 50 seconds spent in admission leaves 220 seconds. The route still declares a 300-second deployment duration; actual platform settings and hosted behavior remain unverified.

## Executed automated checks

| Check | Actual result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed |
| Unit/integration suite | **282 passed across 19 files** after the live-plan correction |
| Research-quality benchmark | **18 passed**, included in the unit total; fixture guard behavior, not live semantic accuracy |
| Production build | Passed; Next.js 16.4.4 / Webpack, Node.js 24.22.1 |
| Installed Edge browser suite | **24/24 passed in 20.4 seconds** on the final build; the earlier pre-amendment run also passed 24/24 in 18.9 seconds |
| Current environment configuration | Passed; local SQLite, configured server key; no credential value printed |
| Vercel configuration check | Correctly failed with `DATABASE_NOT_CONFIGURED`; remote URL/token pair absent |

New tests cover retry exhaustion, permanent failures, cancellation, upstream waiting, request deadlines/references, context forwarding and server-only authorship, private input, source canonicalization, applicability conflicts, required-versus-optional omission, separate effort ranges, scoped manual amendments, export provenance, personal notes and fresh-reader isolation.

The first full unit run found two regressions: a historical-correction fixture already mentioned generic PKCE, and an older export assertion expected the preserved browser-progress wording. The correction now explicitly adds S256 when absent, and the export retains that privacy statement. The next complete run passed all 279 tests. The first browser run passed 21/24: two new native-select locators needed accessible-role selectors, and an older recovery assertion expected missing step documentation. Test-only corrections retained the stronger concrete recovery behavior; the next 24/24 run passed without an application change or another build.

The live-plan issue below justified one bounded correction batch and another complete verification. All **282** final unit tests passed, including three added snapshot-ordering checks. Final lint initially found the local CommonJS capture helpers under the already Git-ignored review-artifact directory. ESLint now ignores that generated directory consistently with test/build artifacts; application and test sources remain checked. Lint, TypeScript, the quality subset and production build then passed.

## Live and visual verification

Exactly **one real Figma URL submission** ran through the production UI with the configured server API. No automated fixture substituted for it, and no second paid request was made after the corrections.

| Observed item | Actual result |
| --- | --- |
| Input | `https://developers.figma.com/docs/rest-api/oauth-apps/`; public audience, read Figma files, `file_content:read`, permissions unknown, optional listing off |
| Start / request reference | `2026-11-03T16:47:16.261Z`; `AP-e9678a60-e99` |
| Completion | Guide saved; observed within approximately **185 seconds**, not an exact retained server latency |
| Stored guide | `figma-fe206d20-77d`; original research context retained |
| Evidence pipeline output | **9 selected sources, 8 retrieved pages, 32 claims**: 23 labelled source-confirmed, 8 unknown, 1 estimate; **57 matched passages**. These are pipeline results, not an independent audit of every claim. |
| Sampled token / PKCE findings | Reusable refresh token, replacement access token, and optional highly recommended S256 PKCE appear correctly with retained supporting passages. Public-review timing remains unknown. |
| Portable/public workflow | Reload, Saved/reopen, blocker-note persistence, matched-passage inspection, copied share link, fresh-reader HTTP 200 with Not started progress, and Markdown HTTP 200 passed. Export contains context, estimates, dates and all source URLs, with no personal blocker notes. |

Observed lifecycle samples were search at 21/41/61 seconds, synthesis at 81/101/121, and evidence checking at 141/161/181. The UI then showed the completed saved guide. The QA observer failed to read `response.text()` after completion because the CDP response body was unavailable. **Raw NDJSON and any unobserved automatic retry count were not retained.** Read-only follow-up confirmed the saved result without resubmitting. An initial Saved/reopen observer read the URL before navigation settled; a targeted wait for the URL and heading confirmed success at `16:52:58.211Z`.

The independent review caught one real **P2 planning failure** in that generated result: an audience-choice step also said to publish before reviewer materials, and no separate final submission/provider-decision steps existed. A dated, scoped reading amendment now makes the choice non-publishing, gates submission on tests/materials/readiness and selected optional listing preparation, and separates the unknown provider decision. Optional listing is affirmative; unlisted-public uncertainty remains visible outside the excluded optional task. The original database record, factual claims, source passages, retrieval dates and AI support assessments are preserved. The overview visibly identifies the amendment. [Provider corrections](provider-corrections.md) record its scope.

Generic generation and review prompts now explicitly separate audience choice, preparation/testing, submission and provider decision. An installed-SDK request test checks these rules reach all three stages. **That prompt refinement was not verified by another paid generation.** The deterministic amendment and dependency behavior are tested; future generated plans still need semantic review.

The bounded initial visual batch opened **ten distinct states**: desktop ready/running/completed research, live guide, launch context, blocked step, matched-passage inspector, light guide, historical manual-correction inspector, and one 390px form guard. There were no horizontal page/dialog overflows, page errors or console errors. The completion image retained its original observer-failure filename as an unchanged alias; it depicts successful application completion. Canonical design documentation and ten rendered component snippets were also validated. Artifacts remain local and ignored under `.impeccable/review/reliability/`.

**Final correction confirmation, 17:00:50 UTC:** the final production build passed all 24 browser journeys in 20.4 seconds. Only the two requested desktop states were captured and opened: the amendment notice/link and corrected terminal checklist steps. Both had zero overflow or browser errors, and the confirmation issued **zero research POSTs**. A simulated blocked submission prevented recommending provider waiting; completing submission exposed the explicit provider handoff. Export returned HTTP 200 with the amendment and corrected dependencies. The stored document retained **14 steps**, byte-identical before/after (SHA-256 `7810728022c9e58600e8453b23f308af115b0e82649dba67ec115ff4676e1560`); the reading view has **16 steps** with unchanged claims, sources, passages and verification dates. One confirmation-observer selector initially waited for a closed limitations section instead of the visible notice; correcting that observer required no application change or additional research. Original observer failures remain in the local evidence packet.

## Remaining manual work

The original failed Figma request's cause remains unknown. One live run cannot quantify a reliability improvement. AI effort ranges, applicability and dependencies remain planning judgments; deterministic filtering cannot prove their semantic correctness. Source text matching and a separate AI assessment are not independent certification.

The operator still needs remote persistence, Vercel configuration, confirmation to push/deploy, a tested hosted URL, deployed duration/connectivity/cold-start checks, and real provider-account setup. Sign-in, app creation, credential handling, token exchange and approval remain manual and unexecuted. Existing guide IDs retain their immutable stored evidence; the dated Figma reading amendment is intentionally limited to the audited historical snapshot.
