# Guide overview and effort refinement

Recorded on **4 November 2026 (Asia/Calcutta)**. This pass preserves the existing charcoal/violet interface and connected routes; it adds no separate dashboard, accounts or collaboration service. These results describe local verification. Earlier hosted research, persistence and deployment outcomes remain in [production validation](production-validation.md).

## Implemented behavior

- A guide-level readiness summary combines this browser's declared launch preferences and checklist state with recorded research. It shows actionable work, marked blockers, dependency/support locks and remaining provider-owned steps.
- Unsupported/unclear OAuth, non-optional omissions, blocked work and unresolved/conflicting audience preferences remain explicit. Independent work can continue without making a blocked task actionable. Recorded completion does not certify OAuth setup or provider approval.
- Unknown findings are deduplicated across approval, section and blocker claims. They are explicitly snapshot-wide, including other launch paths; personal preferences do not resolve evidence or establish policy applicability.
- Blocker disclosures retain browser-local reasons/owners and navigation to recovery guidance. Provider-owned remaining steps do not establish that a submission occurred or review began. Navigation actions move keyboard focus to their destination.
- Older guides retain their original narrative effort estimate. Generic **15–45-minute registration** and **2–8-hour implementation** fallback ranges were removed. Existing structured ranges remain separate, with assumptions and approval waiting excluded; absent ranges remain unknown. Unsupported/unclear OAuth effort is not presented as executable in the UI or export.
- Source-free planning estimates open a compact **About this estimate** dialog. It shows the recorded planning judgment and assumptions/exclusions without empty source-evidence sections. Full requirement inspection and retained source/verification evidence remain available.

## Executed checks

| Check | Actual result |
| --- | --- |
| Unit/integration suite | **294 passed across 20 files** |
| Research-quality subset | **18 passed**, included in the unit total; deterministic fixture guards, not model-accuracy measurement |
| Browser journeys | **29 passed in 33.8 seconds** against the local app |
| TypeScript and ESLint | Passed |
| Production build | Passed on the host after an environment-specific sandbox failure |
| Visual inspection | Four accepted local captures covering dark/light overview, compact estimate inspector and a narrow viewport |

The new readiness unit cases cover blocked independent work, dependency locks, provider-owned decisions, unsupported OAuth, omitted prerequisites, audience exclusions/conflicts, unknown deduplication and honest recorded completion. Three new browser journeys exercise context persistence and unknown navigation, blockers/recovery/omissions, and the legacy effort/compact-inspector path including Escape/focus restoration. Existing journeys still cover sharing, export, personal persistence, research errors and public/private access controls.

## Failures and corrections retained

- The first browser attempt stopped because of environment networking before tests executed; it was not an application test failure.
- The first complete browser suite passed **28/29**. One older export assertion expected the removed generic numeric-label presentation. It was corrected to assert the preserved narrative estimate and its scope; the final complete run passed **29/29**.
- An intermediate build encountered **EPERM** while writing generated `.next` output in the sandbox. The same application code built successfully through the authorized host execution.
- First-batch visual review found heading specificity and long-description wrapping issues. One CSS correction batch fixed them. The narrow check used a **390px viewport**, with **384px page width** and **344px summary width**; it did not reveal horizontal page overflow. Captures remain ignored under `tmp/overview-review/`.

## Evidence and operational limits

No paid research call, source refresh, provider sign-in, OAuth registration, token exchange, review submission or approval was performed in this pass. Existing source retrieval dates and immutable guide documents were not rewritten. The prior actual GitHub public-console preflight stopped at sign-in; see [provider corrections](provider-corrections.md). The new summary is a reading aid based on declared preferences and self-reported progress, not an account probe, policy certification or successful setup test.

These local checks do not establish that the new revision was pushed, deployed, or tested in production. Hosted verification must be recorded separately after an actual deployment. No full accessibility, security or load certification is claimed. The separately prepared submission PDF is a local delivery artifact, excluded from Git and Vercel uploads.
