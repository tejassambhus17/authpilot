# Research-quality benchmark

This compact regression benchmark checks the production evidence guard against
five consequential OAuth guidance errors. It uses **authored synthetic provider
fixtures**, not real provider policies, captured documentation, or paid model
outputs. Fixtures live only under `tests/fixtures/`; production research has no
fixture mode.

Run it from the repository root:

```sh
npm run test:quality
```

The equivalent underlying command is
`npm test -- tests/research-quality.test.ts`.

## Acceptance criteria

| Case                        | Adversarial interpretation                                                                                      | Required outcome                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Optional listing            | A candidate makes optional Marketplace listing mandatory for all public OAuth installations.                    | Do not confirm the inferred approval requirement. Preserve the uncertainty and source context. |
| Administrator consent       | A candidate treats a workspace administrator's permission as provider app review.                               | Keep these approval actors separate; do not confirm the inferred provider-review prerequisite. |
| Missing timing              | A documented review process is turned into a guaranteed five-day approval SLA.                                  | Mark the unsupported timing unknown.                                                           |
| Unsupported OAuth           | A candidate tells the developer to register an OAuth client despite the guide identifying OAuth as unsupported. | Do not confirm an executable OAuth registration path.                                          |
| Contradictory documentation | Two passages disagree about review, while a candidate states that review is never required.                     | Retain the conflict and mark the requirement unknown.                                          |

## Observed baseline

On **3 November 2026**, before the final evidence-grounding changes,
`npm test -- tests/research-quality.test.ts` ran against the existing
`validateResearchedGuide` implementation:

Baseline repository revision: `4a80b0a` (the reference redesign, on `main`).

- **Five tests ran; all five failed their safety expectations.**
- Each adversarial claim remained `source-confirmed`; each test expected
  `unknown`.
- The source URLs were present in the retrieved-source list. The existing URL
  provenance and uncertainty-wording checks therefore accepted them.
- These failures establish a concrete regression target. They do not show that
  a live model produced all five errors; the candidate claims were supplied by
  the test.

The original genuine Linear runs separately exposed an actual optional-listing
interpretation error and an unsupported immediacy claim. Those original outputs,
corrections, and later bounded source audits remain in
[the live validation record](live-validation.md).

## Final observed result

On **3 November 2026**, `npm run test:quality` executed against the final
`validateResearchedGuide` → `applyEvidenceReview` path: **18 tests passed**.

| Group                                    | Actual result                                                                                                                             | What the result establishes                                                                                                                                                                                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Five original missing-review regressions | 5 passed; all five unsafe candidate claims became unknown.                                                                                | A retrieved citation URL and source summary cannot confer confirmed status without claim-level support checks.                                                                                                                                                                  |
| Five reviewed adversarial scenarios      | 5 passed; the supplied contradictory or insufficient assessments kept the claims unknown while retaining matched passages and conditions. | The deterministic guard applies negative review verdicts and preserves contextual evidence rather than presenting the rejected interpretation as confirmed.                                                                                                                     |
| Scoped positive control                  | 1 passed; scoped optional-listing guidance remained source-confirmed with a matched provider-domain passage and a supported assessment.   | The guard can retain supported guidance rather than indiscriminately marking every claim unknown.                                                                                                                                                                               |
| Additional evidence controls             | 7 passed.                                                                                                                                 | Invented quotations, failed retrieval, unverified publisher authority, forged verification metadata, duplicate review claim IDs, source-ID/URL authority collisions, and unsupported OAuth registration despite a mistakenly supportive assessment were handled conservatively. |

The production correction combines source URL provenance with bounded page
retrieval, passage matching, domain association, a separate AI support assessment,
and a deterministic safety gate. Candidate-authored verification stamps are
overwritten. A source-confirmed claim without sufficient matched and assessed
support is downgraded to unknown. Unsupported OAuth registration cannot become
confirmed simply because an assessment says it is supported.

**The review verdicts in this benchmark are fixture inputs.** The tests do not
demonstrate that a live LLM independently identified all five semantic errors.
They demonstrate that the production safety gate handles these recorded inputs
correctly. The separate production assessment remains probabilistic and can
misinterpret a passage; manual semantic audits remain necessary.

The companion integration suite also passed **eight tests** on 3 November 2026,
including the later timestamp regression:

```sh
npm test -- tests/research-evidence.test.ts
```

It exercises the installed SDK's strict review parsing with a test-only HTTP
transport, the retrieval → review → save sequence, safe degradation after a
reviewer failure, rejection of an invented review source, and cancellation
during retrieval or review without saving. These are functional integration
checks with injected fixtures, not paid model or web-retrieval evaluations. The
final focused run of both files passed all **26 tests**.

## Browser verification of the evidence experience

On **3 November 2026**, all **19 Playwright journeys passed** against the local
production build in installed Microsoft Edge. The three new journeys checked:

- Opening a legacy claim inspector, source and retrieval-date visibility,
  explicit summary-versus-quotation limits, Escape dismissal, and restored
  keyboard focus.
- Marking a prerequisite blocked, reloading its persisted status, showing
  recovery instead of an immediately actionable task, following its recovery
  guidance, and restoring actionability after changing the status.
- A mobile inspector that fits the viewport and retains a 44-pixel close target.

Four targeted desktop/mobile screenshots were opened and inspected for the
legacy inspector and blocked-task recovery panel. Their metadata recorded no
horizontal page or dialog overflow, browser page errors, or research POSTs during
capture. Artifacts remain local and ignored under `.impeccable/review/final/`.
The browser suite uses test-only HTTP fixtures for error/retry/stream cases;
these functional checks do not claim that a new paid provider research run or
OAuth setup was performed.

## Genuine Dropbox pilot: bounded independent audit

The implementation owner separately executed real Dropbox research and retained
guide `dropbox-699e6f08-d38`. Its successful attempt took 147 seconds and selected
six citations. The evidence reader obtained one readable page out of six;
four claims received passage-matched status and 26 claims remained unknown.
An earlier nine-second attempt failed; its upstream cause was not captured.
Neither the failure nor the limited retrieval coverage should be hidden.

On **3 November 2026**, a separate read-only audit fetched the exact
[retained Dropbox reference URL](https://www.dropbox.com/developers/paper-api-alpha?utm_source=openai)
after the web tool could not open it. Direct HTTPS returned HTTP 200. Extracted
text matched the saved source SHA-256
`5698f5cdb6f1baf6107c624b512144f0437f9899e134b43e26a8fdd97795cb3c`.

| Sampled group                              | Independent finding                                                                                                                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client flow and identity distinction       | Corroborated: the page distinguishes API authorization from identity-provider authentication, directs identity use to OpenID Connect, recommends code flow for server apps and PKCE for public clients, and describes implicit flow as legacy. |
| Callback success and denial/error behavior | Corroborated: authorization returns through the redirect URI; code/PKCE responses contain a code and any supplied state. Denial/error responses contain error details and any supplied state.                                                  |

These two technical groups were supported by the independently read page.
Production approval, administrator policies, distribution limits, scope
requirements, and approval timing were not certified by that one-page check.
Missing or inaccessible pages do not establish that a review requirement or
timeline is absent. No provider account, OAuth registration, token exchange, or
approval was tested.

A later read-only redirect check independently obtained the retained developer
guide at its new
[Dropbox API documentation URL](https://docs.dropboxapi.com/dropbox-api/docs/developer-resources/developer-guide).
That page supports a **conditional production-status review path**, distinct
from initial client registration. It describes development limits, the review
threshold and a two-week window after reaching 50 linked users, plus component
exceptions. That window is a deadline before new-user linking is frozen; it is
**not a promised approval turnaround**. The original pilot's unresolved approval
timing was therefore appropriate. This additional sampled check does not
establish an app-specific approval decision or certify the entire guide.

The stored guide then passed browser-local save/reload/reopen, checklist
reload persistence, share feedback, fresh-session content reading with
independent personal state, and Markdown HTTP 200. That follow-up issued no
research POSTs and recorded no browser page errors.

**Pilot timestamp erratum:** its claim/evidence `checkedAt` values used the search
timestamp, which preceded page retrieval and review. Source retrieval timestamps
were correct. The research pipeline now records a separate post-review check
time, covered by an integration regression. A read-time safety view also demotes
claims whose check timestamp precedes their source fetch. The original immutable
pilot was not overwritten; its original four matched labels and claim check
timestamp are historical data, not current verification proof.

## Final Asana run and independent source check

After the timestamp and documented-domain corrections, the frozen final build
completed one real Asana request for `asana-1b7a658a-eb3` in **173 seconds**. It
selected ten citation sources, retrieved **eight pages** within the eight-page
evidence limit, retained **60 matched passages** across **28 assessed claims**,
and left **seven claims unknown**. These are observed run counts, not an
accuracy score or latency commitment.

The saved guide passed reload, Markdown HTTP 200, browser-local save/reopen and
checklist persistence, sharing feedback, and reading in a fresh session with
independent personal state. Follow-up and capture made **zero research POSTs**
and recorded no browser errors. The final browser suite passed all **19 journeys
again** against this frozen build.

Desktop and mobile inspector captures were opened and inspected. They show the
actual internal/testing approval claim, checked source passages, distinct AI
assessments, and documentation links. Metadata verifies the final claim check at
15:29:02 UTC followed its source fetch at 15:28:03 UTC; no page or dialog
horizontal overflow was found. The captures are
`desktop-matched-inspector.png` and `mobile-matched-inspector.png` under the
ignored local review directory.

Two consequential groups were independently checked on **3 November 2026**
against the current official documentation, separately from the generated
assessment:

| Group                                                | Finding and boundary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Sources                                                                                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Registration/token use, external sharing, and review | Corroborated with an unresolved qualification. Review is not needed merely to obtain a token or build an internal/testing integration. The sharing page describes Any workspace authorization and separate Directory submission; the publishing page also calls for submission for availability beyond the developer's organization/development environment. The guide appropriately preserves that unresolved relationship rather than claiming external use universally requires no review or Directory listing. Actual console applicability was not tested. | [Share your app](https://developers.asana.com/docs/share-your-app), [Publish your app](https://developers.asana.com/docs/publish-your-app) |
| Published response timing versus approval            | Corroborated. The published target is an initial response to an app submission within one week, with variability and longer app-component security/QA review. The guide confines that target to submissions and leaves registration/final approval timing unknown rather than promising approval within a week.                                                                                                                                                                                                                                                 | [Review timelines](https://developers.asana.com/docs/publish-your-app#review-timelines)                                                    |

No material error was identified in these sampled groups. This is not an audit
of every claim, an app-specific policy determination, or an executed OAuth setup.
Model interpretations, uninspected requirements, source changes, and provider
decisions remain outside that bounded result.

## Scope of the result

Passing these tests demonstrates the behavior of the evidence safety gate on
these bounded inputs. It does not establish a model accuracy percentage, prove
that every source supports every generated claim, or certify provider policy.
Exact passage matching establishes textual provenance, not semantic entailment.
AI support assessments remain AI interpretations and must be labelled as such.

## Separate live semantic audit

The deterministic suite does not call the model. To assess a real generation:

1. Choose a provider absent from the current library and run the real research
   workflow using the operator's configured API account.
2. Retain the generated guide ID and its unmodified export. Inspect each
   consequential approval, distribution, and timing claim alongside its original
   page, not just the model's evidence summary or support verdict.
3. Record the applicable app type, audience, permissions, approval actor, and
   lifecycle path. Check whether the cited passage establishes the full claim
   under those conditions. A published response estimate is not a guaranteed
   approval date.
4. Record each sampled claim as supported, contradicted, or unresolved. Preserve
   conflicts and failed retrievals. Report sampled results and corrections,
   without extrapolating to an overall model accuracy percentage.
5. Verify reload, export, and fresh-session sharing separately. Those functional
   checks do not certify the generated provider policies.

This protocol is a manual follow-up, not an additional claim that a new paid run
or independent policy audit has been executed by this benchmark.

No test in this benchmark signs in, registers an OAuth client, exchanges tokens,
submits a review, obtains approval, or makes a paid research call. The application
tests independently cover persistence, transport failures, and user journeys.
