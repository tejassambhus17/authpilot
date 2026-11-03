# Provider corrections and public-console preflight

Recorded on 3 November 2026. This supplements the earlier audits rather than replacing their failures. The documentation and public-console checks below did not use a paid model call. A separate single live Figma research run and its resulting planning amendment are recorded in [reliability validation](reliability-validation.md). No provider sign-in, app creation, token exchange, or approval occurred.

## Documentation corrections

Follow-up retrieval record: **2026-11-03T16:30:40.000Z**.

| Provider | Earlier issue | Applied correction | Official evidence |
| --- | --- | --- | --- |
| Google | Branding timing was described as unresolved. | Show automated/minutes and manual-fallback/2–3-business-day branches; total scope/assessment wait remains unknown. | [Brand verification](https://developers.google.com/identity/verification/authentication-verification) |
| Slack | Overview had published waits; review tab omitted them. | Include preliminary feedback up to 10 business days and functional review up to 10 weeks for new submissions or 6 weeks for updates, with variable queues and resubmission caveat. Applicable to Marketplace submission, not internal installation/admin consent. | [Marketplace review](https://docs.slack.dev/slack-marketplace/slack-marketplace-review-guide/) |
| Figma | Historical guide proposed refresh-token rotation testing and omitted PKCE. | Refresh-token reuse obtains a replacement access token; the prior access token stops working. Authorization should include recommended S256 PKCE and the corresponding verifier at exchange. | [OAuth apps](https://developers.figma.com/docs/rest-api/oauth-apps/) |

Google and Slack seeds refresh only the affected timing source timestamps. No claim of a complete re-audit of every unchanged source is made.

The token/PKCE amendment applies only to audited snapshot `figma-5c8d411d-77e`, with the expected provider/domain and creation date. It preserves the original stored content. Its former rotation claim remains visible as unknown/unsupported; separately labelled manual documentation amendments and their source appear in the reading/export view. They contain no invented `passage-matched`, retrieval hash, or AI support verdict. Future snapshots are not rewritten. Existing source text is retained as evidence context, not silently replaced.

Checklist annotations separate the associated-team/organization private path from public review and optional Community listing. Scope planning, audience decisions, and reviewer-material preparation can proceed independently of blocked registration/implementation where appropriate. Dependencies are planning instructions, not evidence that a reader completed or was denied a task. The UI's launch-path selection determines applicability; uncertain audience remains inclusive.

A separate **16:55:07 UTC planning correction** covers the subsequently generated, audited snapshot `figma-fe206d20-77d`, created at `2026-11-03T16:48:25.968Z`. QA found that its audience-choice task also implied publication before preparation, with no distinct submit/await-decision tasks. The view now separates audience decision, tests/materials/readiness, developer submission, and the provider decision. Optional Community material preparation precedes submission only when selected. Public-unlisted availability remains an explicit warning outside the optional task. This narrowly scoped checklist amendment uses existing source `s1` and leaves every claim, support assessment, retrieval date, source, and immutable database document unchanged. It is not a new policy finding or an assertion about a guaranteed portal sequence.

## Actual public-console walkthrough

Purpose: check where an unauthenticated developer can reach the GitHub OAuth registration path. This is a **preflight stopped at sign-in**, not an OAuth setup test.

| Action | Observed result | Evidence/time |
| --- | --- | --- |
| Attempt unauthenticated GET of the registration entry in the restricted environment | DNS unavailable; no provider interaction established. | 2026-11-03T16:34:24.6674693Z |
| Repeat the same public GET through the authorized host network; follow redirects | HTTP **200**, final URL is GitHub's login page with a return target to the OAuth registration entry. | 2026-11-03T16:34:41.8475840Z |
| Continue registration or authorize access | **Not attempted.** Requires a developer to sign in, select ownership and scope needs, and create the client. | Human handoff; no credentials available to the research workflow. |

Entry: [GitHub OAuth registration](https://github.com/settings/applications/new). Observed final destination: [GitHub login with registration return target](https://github.com/login?return_to=https%3A%2F%2Fgithub.com%2Fsettings%2Fapplications%2Fnew).

The actual correction in this walkthrough was using permitted public network access after the restricted DNS failure. The observed blocker is unauthenticated sign-in, not an inferred organization restriction. No form was submitted; no credential, account setting, OAuth client, or review request was created. Callback behavior, scopes, token issuance/refresh, tenant permissions, and approval remain unexecuted manual checks.

## Repeatable checks

`tests/provider-corrections.test.ts` checks amendment scope, immutability, idempotence, honest evidence metadata, launch-path separation, concrete seed recovery/dependencies, and timing distinctions. These deterministic checks prevent regression in the recorded corrections; they do not measure future live-model accuracy or certify provider setup.
