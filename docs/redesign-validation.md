# Reference redesign validation

The supplied four-screen collage is implemented as connected Explore, research, guide, and guide-library experiences in the existing AuthPilot application. The image supplies visual direction only. Existing provider content, evidence semantics, live API integration, and durable guide storage remain authoritative.

## Planned checks

- Explore accepts a name or website, validates input, supports Enter, and opens a prefilled research form without issuing a paid API request on navigation.
- Actual GitHub, Slack, and Google examples open their existing guide URLs and never display whole-guide setup verification.
- The library supports search, useful no-results states, browser-local save/unsave, reopening, and reload persistence.
- Shared guide content opens in a fresh browser context while checklist progress remains personal.
- Checklists retain the existing four states and persisted keys.
- Research consumes actual backend events. Test-only HTTP fixtures cover rate-limit recovery, stream rendering, cancellation, and interrupted responses; they are not evidence that a live search or provider setup succeeded.
- Mobile navigation, keyboard tabs, theme changes, Markdown download, and share feedback remain functional.
- Desktop, tablet, mobile, dark, and light captures are inspected against the supplied reference.

## Results

Verified on **3 November 2026** against a local production build in installed Microsoft Edge.

- **16/16 browser tests passed**, with no skipped cases. The journeys cover directory search and recovery, all three example guides, four-state checklist reload persistence, Explore-to-research routing without an automatic paid request, browser-local bookmarks across routes/reloads, fresh-session shared content, Markdown download, share feedback, theme changes, mobile navigation, and keyboard tabs.
- Test-only HTTP fixtures exercise rate limits and retry, missing configuration, observed-event rendering, cancellation, and an interrupted stream. The configured production preview uses a conditional 503 fixture for the missing-key UI check; this does not establish that its real server was missing a key. No browser fixture is part of production research.
- The implementation owner separately completed TypeScript, lint, **85 unit tests**, and a production build. The browser suite ran against that production preview.
- **One genuine Notion research request** was submitted through Explore → prefilled research screen → Research provider. Notion was absent from the library before the run. The actual event stream advanced from acceptance/search to source discovery and synthesis, then produced persisted guide `notion-626d0e8d-c08` with **six selected official documentation sources**. Before completion, the UI showed 38 observed events and 35 returned source links; these search candidates are distinct from the six citations selected for the saved guide. No simulated stream was used for this run.
- The saved Notion guide survived reload, opened from Saved, returned Markdown with HTTP 200, reported “Guide link copied.”, and opened in a fresh browser context with independent bookmark/checklist state. Follow-up verification made **zero research requests**. The first follow-up harness reloaded before a client navigation completed; an awaited-navigation, read-only follow-up passed without regenerating the guide. An exact elapsed duration was not retained and is not claimed.
- After the final icon/navigation-label build, **all 16 browser tests passed again** against the rebuilt production app. The implementation owner also reran TypeScript, lint, all 85 unit tests, and the production build successfully.
- The final **12-screenshot matrix** was recaptured and every image opened for visual inspection, covering Explore, research, guide, library, and Saved. **17 route/theme/viewport inspections** at desktop 1440×900, mobile 390×844, and tablet **768×1024** found no horizontal page overflow or browser page errors. The captured research-ready screens honestly show the idle prefilled state. The original genuine active Notion screenshot is retained as a **historical capture from the single paid run before the final icon hookup**; it was not recreated or altered.
- Two additional screenshots show the existing Notion guide and library after the official icon hookup. The browser decoded `/provider-icons/notion.ico` successfully in both views: natural dimensions **64×64**, displayed at 35 px in the guide and 29 px in the library. This final recapture issued **zero research POSTs** and recorded no browser page errors.

Ignored local review artifacts live under `.impeccable/review/redesign/`: `capture-metadata.json`, the twelve viewport screenshots, `final-notion-guide.png`, `final-notion-library.png`, historical `desktop-research-active.png`, `live-notion-result.json`, and the saved guide JSON/Markdown. These artifacts contain public guide material and no credentials. The reference PNG is 1536×1024 pixels. `comparison-reference-implementation.png` and its four individual pair images retain the original reference pixels and label the historical active-research state; `comparison-metadata.json` records source dimensions/crops and the renderer's zero network requests.

This validates the implemented journeys and a bounded documentation-research run. It does not claim provider account access, OAuth client creation, token exchange, approval, exhaustive accessibility conformance, or independent certification of every generated statement. The separate documentation audit below states exactly which Notion requirement groups were checked.

## Independent Notion documentation audit

Reviewed on **3 November 2026 at 14:18 UTC** against the public documentation URLs returned for generated guide `notion-626d0e8d-c08`. This is a bounded review of two requirement groups, not certification of the entire guide or an executed OAuth setup.

The web retrieval tool could not open these new Notion documentation paths and returned no results for the narrow follow-up searches. A direct, read-only HTTPS fallback returned **HTTP 200** for all three exact source URLs. Their rendered documentation text contained the relevant statements. This independent content check is separate from the application's mechanical check that generated citations appeared in search results.

| Sampled requirement group | Finding | Official evidence |
| --- | --- | --- |
| Registration audience and installation-scope restrictions | **Corroborated.** The public integration path uses **Any workspace**. The selected-workspace path restricts eligible installations and cannot be listed in Marketplace. Both guides say the audience choice cannot be changed after creation; a different audience requires a new connection. The generated guide preserves these conditions rather than treating all Notion integrations as the same app type. | [Public integration guide](https://developers.notion.com/guides/connections-and-tokens/public-integrations/overview), [Selected-workspace OAuth guide](https://developers.notion.com/guides/connections-and-tokens/oauth-integrations/overview) |
| Public OAuth usage versus Marketplace review and its timing | **Corroborated.** The Marketplace FAQ explicitly makes listing optional and independent from using a public connection through OAuth. Listing submissions are reviewed separately. Its stated expectation is a response by email within **5–10 business days after a listing submission**, not guaranteed publication or approval. The generated guide confines that expectation to listing review and leaves the other approval timing unresolved. | [Marketplace listing guide and FAQ](https://developers.notion.com/guides/connections-and-tokens/public-integrations/marketplace-listing) |

No material error was found in these two sampled groups. Remaining requirements, redirects, capabilities, token behavior, account-specific policies, and commercial terms were not independently certified in this bounded pass. No Notion account was accessed and no connection registration, authorization, token exchange, or approval was performed.
