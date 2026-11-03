# Genuine live research verification

The **final GPT-5.5 run succeeded in 129 seconds**, selected **10 official Linear sources**, persisted after reload, and returned a successful Markdown export. A fresh, independent three-group source audit found no material error in the sampled public-installability/Directory distinction, published Directory submission process versus unknown timing, and paid-workspace administrator approval guidance. This is a bounded claim audit, not certification of every generated sentence or a provider setup test.

The retained [final local guide](http://127.0.0.1:3100/guides/linear-2b82f1a2-333) has an [unaltered final Markdown example](examples/linear-final.md). Earlier snapshots below are preserved with errata to show what the evidence review caught and how the application changed.

| Actual run | Observed workflow | Evidence lesson |
| --- | --- | --- |
| First, GPT-4.1 | 39 seconds; 5 official sources; persisted reload and HTTP 200 export. | Public OAuth distribution was incorrectly conflated with Directory listing; unsupported registration immediacy was also flagged. [Raw snapshot with errata](examples/linear.md). |
| Second, GPT-4.1 with stronger grounding instructions | 33 seconds; 5 official sources; persisted reload and HTTP 200 export. | The mandatory-listing assertion was removed, but the output incorrectly inferred no published process and marked explicit unknowns as source-confirmed. [Raw snapshot with errata](examples/linear-revised.md). |
| Final, GPT-5.5 with grounding instructions and uncertainty-label guard | 129 seconds; 10 official sources; persisted reload and HTTP 200 export. | The sampled lifecycle distinctions and approval guidance passed the bounded official-source audit below. Unknown timing remained unknown. [Final snapshot](examples/linear-final.md). |

These are three observed request durations, not latency or approval promises. No request was mocked. The final build uses GPT-5.5 with low reasoning effort; a deterministic evidence guard additionally downgrades explicit uncertainty from a confirmed label to unknown, retaining citations as context and recording a warning. Unit cases verify that guard; it is not a substitute for semantic entailment review.

## First-run workflow evidence

On **3 November 2026**, AuthPilot was tested with **Linear**, a provider absent from the three preloaded guides. The test submitted `Linear` through the real research form in the local production build. It used the configured server-side OpenAI account, actual hosted web search, strict structured synthesis, evidence validation, and SQLite persistence. No API interception, fixture response, or production demo generator was used.

The UI-to-verified result took **39 seconds in this one observed run**. This is a measurement, not a performance or approval promise.

**Evidence review found a material interpretation error:** the generated guide conflated public OAuth installation with Integration Directory listing. The raw export preserves that original result for audit; follow the correction below before using its distribution guidance. A valid citation does not guarantee that a claim is entailed by the cited page.

## Observed result

| Check | Result |
| --- | --- |
| Real search | The web-search lifecycle event was observed; five official `linear.app` documentation sources were returned. |
| Guide generation | All nine required sections passed the guide contract; the output contained 14 actionable checklist steps. |
| Evidence integrity | Citation URLs matched returned search sources; retrieval dates were supplied by the server; unsupported agent-tested claims were disallowed. |
| Progress | Eleven actual journal entries covered acceptance, the search event, five discovered sources, synthesis, validation, save, and completion. |
| Persistent URL | `/guides/linear-a3349e30-fdb` opened successfully and remained available after a full reload. |
| Markdown | The export endpoint returned HTTP 200 and included the generated Linear guide. |

At capture time, the first guide was available at `/guides/linear-a3349e30-fdb` in the local database. After the final guide passed its bounded audit, the two owned, unpublished QA snapshots (`linear-a3349e30-fdb` and `linear-5536b69e-057`) were archived as JSON under ignored `data/archive/` and retired from the local directory because of their known errors. Those historical local URLs are no longer advertised as working guides. The [first Markdown export](examples/linear.md) and [second Markdown export](examples/linear-revised.md), each with prominent errata above unchanged generated content, preserve what the audit found.

Only the final generated record remains in the current local directory. Its URL and database are local, not a hosted deployment and not part of a clone. The [final Markdown example](examples/linear-final.md) preserves the public snapshot in the submission without hardcoding Linear into the generation path. No reader-owned or published guide was modified by this QA cleanup.

## Returned official documentation

- [OAuth 2.0 authentication](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)
- [OAuth application manifests](https://linear.app/developers/oauth-app-manifests?utm_source=openai)
- [Integration Directory](https://linear.app/docs/integration-directory?utm_source=openai)
- [OAuth actor authorization](https://linear.app/developers/oauth-actor-authorization?utm_source=openai)
- [Agent integrations](https://linear.app/developers/agents?utm_source=openai)

Source attribution and schema checks establish provenance and structural integrity. They do not independently establish that every model interpretation is correct. The generated evidence summaries remain model interpretations and should be checked against the linked official pages before implementation.

## Boundaries of this verification

No Linear account was accessed. No OAuth app was registered, credentials collected, token exchanged, integration executed, or approval requested. The run verifies the real research-to-saved-guide workflow. It does not claim successful provider setup or certification of approval requirements.

Local review artifacts include `live-research.png`, `live-guide-evidence.png`, and `live-research-result.json` under `.impeccable/review/`. They contain the public research journal and source URLs; no server API key was displayed or copied into those artifacts.

## Independent two-claim source audit

Reviewed again on **3 November 2026 at 12:21 UTC** through live retrieval of the official pages. This is documentation review, not a Linear account or OAuth test.

| Generated claim sampled | Finding | Source and correction |
| --- | --- | --- |
| Redirect registration accepts 1–32 absolute HTTP(S) URIs, and the exchange must use the same redirect URI. | **Confirmed, with citation precision.** | The [manifest specification](https://linear.app/developers/oauth-app-manifests) requires 1–32 unique absolute HTTP(S) redirect URIs. The same redirect URI during code exchange is stated separately in the [OAuth authorization procedure](https://linear.app/developers/oauth-2-0-authentication), rather than in the manifest page alone. |
| Public apps require Integration Directory submission and approval. | **Correction required.** The cited sources do not establish that prerequisite for all publicly installable OAuth apps. | The [manifest specification](https://linear.app/developers/oauth-app-manifests) defines `distribution=public` as installable by other workspaces and `private` as the default. [Directory submission](https://linear.app/docs/integration-directory) is a separate listing process with a form, assets, and discretionary acceptance. Correct guidance: enable the distribution appropriate to the intended workspaces; submit and meet the directory criteria **if seeking a directory listing**. Any additional provider approval prerequisite is **unknown**, not established by these sources. |

The export's statement that private registration is immediate was not established by these sampled public sources either; treat account-specific availability and turnaround as unverified. The absence of a stated review timeline should remain an unknown planning input rather than a guaranteed timeline.

This finding demonstrates the distinction between reference validation and semantic verification. Source URL validation can reject invented citations but cannot prove that the generated sentence follows from the source. Human review remains necessary for consequential provider requirements; future work could add an independent entailment pass with direct claim-level excerpts.

## Final live snapshot: bounded evidence audit

The final genuine live run used GPT-5.5 and selected ten official sources. Its preserved output is [linear-final.md](examples/linear-final.md), guide ID `linear-2b82f1a2-333`. The following three groups were independently checked against live official documentation on **3 November 2026 at 12:47 UTC**. This audit covers these groups only; it does not certify every generated claim or demonstrate a completed OAuth setup.

| Sampled claim group | Finding | Supporting documentation |
| --- | --- | --- |
| Public OAuth installability, directory listing, and agent-specific uncertainty | **Original overclaim fixed.** The final guide separates the lifecycle paths and preserves ambiguity specifically for cross-workspace agents. | The [manifest](https://linear.app/developers/oauth-app-manifests) defines public distribution as installable by other workspaces. The [agent guide](https://linear.app/developers/agents) directs developers to submit agents to the directory to make them available to other workspaces. The output reports both statements and asks the developer to confirm whether the agent-specific language is mandatory for their distribution model. It does not infer a universal listing prerequisite. |
| Known directory submission process versus unknown review timing | **Supported in the sampled text.** The final output documents the process and acceptance criteria instead of treating all review information as unknown. | The [Integration Directory page](https://linear.app/docs/integration-directory) documents a form, assets, and discretionary acceptance based on community usefulness and company eligibility. It does not publish a review turnaround. The final guide preserves the process while leaving timing unknown. |
| Customer workspace Third-Party App Approvals | **Supported in the sampled text.** The final output treats workspace approval as a conditional customer policy, separate from provider review. | [Third-Party App Approvals](https://linear.app/docs/third-party-application-approvals) is available on paid plans; Enterprise owners or admins in other paid workspaces enable it. Members request approval and receive the decision. The final guide captures these boundaries and does not promise a decision time. |

No material error was identified in these three sampled groups. Registration immediacy and unspecified review timing are now left unknown. This finding is deliberately narrower than full-guide verification. Other claims, scope choices, and account-specific behavior still need developer review and execution with the actual integration.
