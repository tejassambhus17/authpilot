# Final engineering and product validation

Verified locally on **3 November 2026** on the existing `main` branch. No branch, worktree, pull request, push, or deployment was created during this pass. Production-mode local verification is distinct from testing a hosted Vercel deployment.

## Implemented

- Accessible “Why this requirement?” inspector: exact claim, recorded applicability, matched source statements, clearly labeled AI interpretation, documentation links, research/page retrieval dates, domain-association information, and verification limits. Legacy summaries are never converted into quotations.
- Actual bounded HTTPS documentation retrieval, a separate strict-schema AI support assessment, and deterministic passage/authority/support checks. Missing or conflicting support makes generated assertions unknown. Model-supplied verification stamps are overwritten; exact text presence is not semantic certification.
- Blocker-aware next actions with dependencies, recovery guidance, direct step citations, and honest related-documentation fallback. Unknown/unsupported OAuth cannot recommend executable registration/configuration tasks. Personal checklist status is not altered by the guard.
- Backward-compatible stored schemas, strict new model-output schemas, checklist dependency/source validation, immutable persistence, expanded Markdown evidence, and conservative read-time handling of older or inconsistent evidence records.
- Repeatable research-quality benchmark, safe failure diagnostics, sanitized deployment configuration checks, remote database deadlines, a 300-second function budget with a 270-second application deadline, updated README/demo, and current project/design context.

## Automated results

| Executed check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm test` | **192 tests across 12 files passed** |
| `npm run test:quality` | **18 cases passed**; included in the unit total |
| Evidence integration suite | **8 tests passed**; included in the unit total |
| Public-document retrieval guard suite | **46 tests passed**; included in the unit total |
| `npm run build` | Passed, Next.js 16.4.4 / Webpack / Node 24.22.1 |
| `npm run test:e2e` | **19/19 passed** on the final local production build in installed Edge |
| `npm run check:deployment` | Local configuration ready; connectivity deliberately not asserted |
| `npm run check:deployment -- --vercel` | Expected failure: remote Turso URL/token pair absent |
| Compiled client credential scan | **39 client JS/JSON/CSS/map files scanned; zero exact matches** for the one configured server credential. Values were never printed. |

The browser journeys include existing examples, Explore routing without an automatic paid request, search and empty states, saved-guide persistence, checklist persistence, fresh-session sharing, Markdown download, themes, keyboard tabs, error/retry/cancellation/interrupted streams, evidence-dialog focus restoration, mobile dialog containment, and blocked-step recovery navigation. HTTP/transport fixtures are test-only and do not establish a live research success.

## Actual failures and corrections

1. **Benchmark baseline:** five supplied adversarial claims all failed their safety expectations against revision `4a80b0a`; URL provenance alone left them confirmed. The final 18-case guard suite passes. Its support verdicts are fixtures, not proof that a live model independently catches every semantic error. See [research quality](research-quality.md).
2. **First Dropbox attempt:** one genuine UI request failed after nine seconds during search, with no sources or saved guide. The exact upstream cause was not captured and is not inferred. Input remained available for retry. Fixed-vocabulary diagnostics and specific connection/configuration errors were added without logging request data, raw exceptions, headers, or credentials.
3. **Dropbox evidence pilot:** the bounded retry completed, but only one of six pages was readable. Four old documentation URLs redirected to the new `docs.dropboxapi.com` domain, which the authority guard did not yet recognize. The relationship was independently established from [Dropbox's official migration announcement](https://dropbox.tech/developers/new-dropbox-api-documentation). A specific documented domain family and original-provider redirect anchoring corrected the rejection while preserving DNS pinning and private-address checks. A separate read-only recheck retrieved five of six pages; the remaining Paper page terminated incompletely. No stored guide was silently rewritten.
4. **Timestamp erratum:** the original Dropbox pilot used the earlier search timestamp for claim checks, before page retrieval and assessment. The final code records the actual post-assessment time separately; regression tests cover chronology. Older inconsistent records are explicitly shown unknown/unverified at read time while preserving raw database bytes. Original pilot artifacts remain available for audit.
5. **Additional regressions:** a Windows libSQL path containing `#` was interpreted as a URL fragment; file-URL encoding now round-trips correctly. Retrieval review also corrected response cleanup, truncated/oversized-body rejection, abort-listener cleanup, and malformed-HTML scanning. Mocked DNS/HTTPS tests exercise these failure paths.

## Genuine unfamiliar-provider runs

These were real UI requests using the configured server-side API key. No production research fixture or invented progress was used.

| Run | Observed result |
| --- | --- |
| Dropbox, first attempt | Failed after **9 seconds**; no guide saved; cause not established |
| Dropbox retry, pilot before final corrections | **147 seconds**; guide `dropbox-699e6f08-d38`; six selected sources, one page retrieved, four claims originally passed support/passages, 12 matched passages, 26 unknown claims. Reload and Markdown HTTP 200 passed. The pilot's timestamp limitation and current safety view are described above. |
| Asana, final corrected build | **173 seconds**; guide `asana-1b7a658a-eb3`; ten selected sources, eight pages retrieved within the eight-page cap, 28 claims passed both checks, 60 matched passages, seven unknown claims. Reload and Markdown HTTP 200 passed; zero browser page errors. |

These are observations from this local machine and account, not latency promises or model-accuracy measurements. The original generated JSON, Markdown, observed-event records, and screenshots are ignored local artifacts under `.impeccable/review/final/`; credentials are not included. Generated guides remain local database results, not extra preloaded examples in a fresh checkout.

The Dropbox follow-up separately verified save → reload → Saved → reopen, blocked-checklist reload, share feedback, and a fresh browser reading the same guide with independent progress. It issued zero new research POSTs. Bounded independent checks corroborated OAuth/OIDC/flow selection and callback success/error behavior; a further official-page check kept the development linkage window separate from an approval SLA. This is not full-guide certification.

The final Asana follow-up also passed save/reload/Saved/reopen, blocked-checklist reload, share feedback, a fresh browser with independent unsaved/not-started state, and Markdown HTTP 200. It issued **zero additional research POSTs** and recorded **zero browser errors**. The server records the actual post-assessment check at **15:29:02 UTC**, after the relevant source fetch at **15:28:03 UTC**; inspection found **zero chronology violations**. Exact results are retained in `live-asana-followup.json` and `matched-capture-metadata.json` under the ignored review directory.

A bounded independent Asana source audit corroborated two consequential groups: internal/testing and token-access exemptions with unresolved broader sharing/review wording kept conditional, and the published initial-response target distinguished from registration or final-approval timing. No material error was found in those sampled groups. The full guide, provider console, app-specific applicability, and actual approval were not certified. Exact official sources and findings are in [research quality](research-quality.md).

## Visual and interaction review

The existing charcoal/violet design, tokens, themes, navigation, and six guide tabs were preserved. A targeted batch opened desktop/mobile legacy evidence inspectors and blocker panels at 1440×900 and 390×844. Two final screenshots opened the genuine Asana matched-passage inspector at the same desktop/mobile widths. All **six images** were opened and inspected. Metadata recorded no page/dialog horizontal overflow, no browser errors, and no research POSTs. Missing passages and related-documentation fallback were visibly explicit. The matched-source captures show source statements, AI support assessment, actual dates, and semantic-verification limits. The independent visual review found no material regression; capture artifacts and internal review logs remain local and ignored.

## Not executed and remaining uncertainty

- No push, Vercel deployment, hosted URL verification, remote Turso connectivity/write, deployed cold-start persistence, deployed function-duration enforcement, or deployed logging/bundle inspection was executed. The local compiled-client scan above is distinct from a deployed inspection. The hosted configuration check correctly reports missing remote storage. Follow [deployment readiness](deployment-readiness.md) after owner confirmation.
- The local environment has no shared research spending token. Hosted reviewers should receive an owner-configured gate or an explicitly accepted public research budget.
- New generated support judgments remain probabilistic. Domain association is not independent publisher certification. Selected-page limits, access failures, contradictory documentation, and changing provider policies can leave requirements unknown. Eight-page retrieval does not mean every citation was independently fetched.
- No OAuth provider sign-in, app registration, credentials, authorization, token exchange, marketplace submission, or approval was executed. Checklists record the reader's state, not an agent-tested setup.
- Research is request-bound, costs money, and is not resumable. A failed attempt may require a new paid request. The first Dropbox failure is retained rather than presented as a clean first-attempt success.
