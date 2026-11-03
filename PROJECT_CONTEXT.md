# AuthPilot project context

AuthPilot helps a developer move from “we need to integrate this provider” to a concrete OAuth registration, testing, and distribution plan. A provider OAuth app is the client registration owned by the integration developer; each end user's authorization and token connection is separate.

The take-home asks for a few varied examples and real-time unfamiliar-provider generation, not a hundred hand-authored entries. GitHub, Slack, and Google cover different distribution and review constraints. The application makes source-confirmed requirements, estimates, unknowns, and unperformed testing explicit.

## Core decisions

- Next.js App Router server routes protect credentials and orchestrate real research.
- OpenAI Responses hosted web search discovers current documentation, followed by schema-constrained guide synthesis. No production mock generation is provided.
- SQLite through libSQL gives a zero-service local start; Turso supplies durable shared storage on Vercel.
- Generated guides have persistent URLs. No accounts are introduced for this focused slice; Saved bookmarks and checklist progress are browser-local and independent for each reader.
- Markdown export makes the guide portable. Source links, retrieval dates, evidence status, blockers, and human handoffs travel with it.
- Provider documentation can be stale or contradictory. A cited document is evidence, not a guarantee that the provider will approve an app.
- New research retrieves a bounded set of cited pages, asks a separate AI assessment to evaluate claim support, and matches proposed passages against fetched text. Generated confirmation requires a matched provider-domain passage and supported assessment. This is stronger provenance, not independent semantic certification; the evidence inspector exposes the distinction.
- Blocked and dependency-locked tasks are not immediately actionable. Unsupported or unclear OAuth cannot produce executable registration/configuration recommendations. Older snapshots conservatively use checklist order and related-documentation labels when direct metadata is absent.
- The guide overview derives a readiness summary from declared launch preferences, recorded evidence and browser-local progress. It exposes actionable work, personal blockers, remaining provider-owned steps and deduplicated snapshot-wide unknowns. It does not verify account access, infer review has started, or certify launch readiness.
- Effort displays recorded structured ranges when present. Older snapshots retain their narrative estimates without generic numeric fallback ranges; unsupported OAuth effort is hidden in the reading view and export. Source-free estimates use an assumptions-focused inspector, while requirement evidence retains the full passage/source view.

## Main workflows

1. Start on Explore (`/`), open one of the three real examples, or enter a provider name/website and continue to the prefilled research screen (`/research?q=...`). Navigation alone never starts a paid request.
2. Start research explicitly, follow actual lifecycle events and returned documentation links, and receive a validated, persisted guide at `/guides/<id>`. Search candidates remain distinct from the citations selected for the final guide.
3. Search and filter the Guides library (`/guides`), save/unsave a guide, and reopen personal bookmarks from Saved (`/saved`). Counts and categories derive from stored content; there is no account, shared-with-me feature, or fabricated guide activity.
4. Read the guide's Overview, Setup steps, Scopes, Approval & review, Common issues, and Sources tabs. Track Not started, In progress, Blocked, Completed, and Not applicable states in this browser. Select the launch path and retain personal blocker reasons/owners without changing shared content. Required omitted prerequisites remain unsatisfied.
5. Copy a public share URL or export Markdown. A fresh reader sees the same durable content with independent checklist/bookmark state.
6. Inspect How it works (`/methodology`) to understand confidence and the agent's limits.

## Interface and verification

The owner authorized Vercel deployment on 4 November 2026 (Asia/Calcutta). The public site is https://authpilot-navy.vercel.app, using remote Turso storage and a pinned Node 24 package engine. The owner subsequently approved token-free research for the interview demo; the per-network and deployment-wide rate limits remain active. Six public research snapshots were copied without mutation; personal browser state was not migrated. The first hosted search reached its output cap; search now requests a compact evidence memo with 12,000-token headroom for tool/reasoning output. Production results and exact limits are recorded separately in `docs/production-validation.md`; prior local-only records below remain historical.

The research-hardening follow-up adds audience/API/scope/permission context, server-authored snapshot assumptions, separate registration/implementation estimates, explicit curated dependencies/recovery, conservative applicability filtering, transient stage retries, request references, and canonicalized search candidates. Source-confirmed policy and approval waiting remain distinct from planning judgments. Input spelling rejects private-network providers before paid work; document retrieval retains its independent DNS/public-address checks. Provider-specific corrections and the actual GitHub sign-in preflight are recorded in `docs/provider-corrections.md`.

The latest local overview pass passed **294 unit tests across 20 files**, **29 browser journeys in 33.8 seconds**, TypeScript/lint/build, and the **18-case quality subset**. It added readiness/path/blocker/omission coverage, compact estimate inspection and keyboard focus after section navigation. No paid research or OAuth setup was performed in that pass; current local checks do not establish a new deployed result. See `docs/overview-validation.md`.

The preceding reliability pass recorded **282 unit tests** and **24 browser journeys**. One real Figma URL run succeeded; review found and corrected publication/preparation ordering in a dated read view, preserving the original snapshot. The generic prompt correction was not paid-regenerated. See `docs/reliability-validation.md` for those historical results, observer limits and manual work.

The earlier desktop refinement standardized buttons, typography and spacing; long effort/approval facts use full-width reading rows, source passages appear earlier in the inspector, and normalized library categories retain original stored/searchable text. Known provider favicons are sourced from official sites. That pass recorded **195 unit tests**, **20 browser journeys**, TypeScript/lint/build and twelve desktop visual captures; see `docs/desktop-polish.md`. The research/evidence/storage backend was not changed in that visual pass.

The supplied four-screen reference guides the redesigned charcoal/violet identity, centered Explore form, observed-event research timeline, tabbed guide, and library rows. Dark mode is the default; light mode and the reader's theme choice persist. Responsive navigation, native checklist controls, keyboard tabs, reduced motion, loading states, and useful errors remain part of the working product. Whole-guide “Verified” or “Setup verified” claims are not used because this application does not execute OAuth setup.

Before the final engineering pass, the reference redesign passed TypeScript, lint, a production build, **85 unit tests**, and **16 browser journeys**. Current final-pass results, failures, corrections, and production limits are recorded in `docs/final-validation.md`. Browser fixtures cover transport failures only inside tests. A genuine Notion research run on 3 November 2026 produced six official citations, survived reload, reopened from Saved, shared into a fresh session, and exported Markdown. No second request was needed for follow-up verification. Two sampled Notion requirement groups were independently checked against official documentation; this is not certification of the entire output or an executed setup. See `docs/redesign-validation.md` for the evidence and screenshot matrix.

## Deliberate scope limits

No provider sign-in, credential collection, token exchange, review submission, billing, user accounts, collaborative progress, scheduled refresh, or guaranteed approval timing. Paid live research requires the operator's API key. Deployment requires external Vercel and Turso configuration. The repository keeps the seeded documentation and generated-agent path separate so it remains useful without credentials.

## Reference files

`PRODUCT.md` records product truth, `DESIGN.md` records the interface system, `src/lib/schema.ts` defines contracts, `docs/provider-validation.md` records provider evidence, and `docs/testing.md` records verification and manual checks.

`docs/live-validation.md` records genuine unfamiliar-provider generation and an independent sampled claim audit. That audit caught a public-OAuth-distribution/Directory-listing conflation. Preserve this distinction in generation prompts and guide reviews; structural citation validation is separate from semantic verification. `docs/redesign-validation.md` records the redesign journeys, genuine Notion validation, bounded documentation audit, and responsive visual review. Linear and Notion validation runs remain generated local data; GitHub, Slack, and Google are the preloaded providers in a fresh checkout.
