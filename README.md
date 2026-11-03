# AuthPilot

**Hosted URL:** not deployed; push and deployment await the owner's confirmation. A local preview is not a hosted submission.

[Demonstration script](#demonstration-script) · [Reliability follow-up](docs/reliability-validation.md) · [Final validation](docs/final-validation.md) · [Research-quality benchmark](docs/research-quality.md) · [Deployment readiness](docs/deployment-readiness.md)

An OAuth integration navigator for developers and agent builders. Explore GitHub, Slack, and Google guides, save useful guides, track setup steps, and research an unfamiliar provider using a real web-search agent. Guides expose requirements, effort estimates, approval blockers, source evidence, and the actions that need a human.

Built as a focused working slice of the APM Integrations take-home. A provider OAuth app is the developer's client registration; it is separate from each end user's connection. AuthPilot helps with that registration and distribution path.

## Run locally

Use Node.js **24** and npm. The package engine pins the hosted runtime to the major version used by local verification. The launcher retains its 22.12+ compatibility check for older development environments.

`npm run runtime` shows the Node version used by AuthPilot. The npm scripts select a supported runtime independently of an older Node used to start npm: `AUTHPILOT_NODE_BINARY` takes precedence, followed by the current supported Node, then an ignored project-local `.runtime/node.exe` on Windows (`.runtime/node` elsewhere). The launcher does not download software or change the system Node installation. Fresh checkouts should install Node 24 or explicitly select an existing supported executable.

If CSS compilation reports `ERR_REQUIRE_ESM` for `magic-string`, an older Node process is loading the Tailwind PostCSS plugin. Stop that dev server, check `npm run runtime`, and restart with `npm run dev`. Changing the font stylesheet or editing `node_modules` will not fix the runtime mismatch.

```sh
npm install
```

Copy `.env.example` to `.env.local`. On PowerShell:

```powershell
Copy-Item .env.example .env.local
```

On macOS/Linux:

```sh
cp .env.example .env.local
```

Add `OPENAI_API_KEY` for live research, then:

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000). The three curated guides, library search, browser-local Saved guides and checklist tracking, dark/light themes, share links, and Markdown export work without an API key. Research explains missing configuration instead of returning a fake guide.

If port 3000 is occupied, use `npm run dev -- --port 3100` and open the URL printed by Next.js. Automated browser tests use port 3100.

## Environment

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server-only OpenAI key for real live research. Required only for generation. |
| `OPENAI_MODEL` | Responses model supporting hosted web search and structured outputs. Defaults to `gpt-5.5`; GPT-5 models use low reasoning effort for this bounded workflow. |
| `TURSO_DATABASE_URL` | Remote libSQL database URL. Optional locally; required on Vercel for durable generated guides. |
| `TURSO_AUTH_TOKEN` | Server-only token for the remote database. |
| `RESEARCH_ACCESS_TOKEN` | Optional shared spending gate. When configured, users enter it in the research form. |
| `NEXT_TELEMETRY_DISABLED` | Optional `1` disables Next.js telemetry and user-level telemetry configuration writes. |

No variable holding credentials should be prefixed `NEXT_PUBLIC_`. Never paste OAuth client secrets into research input. `.env.local` and the local database are ignored by Git.

## Product decisions

- **One connected workspace.** Explore (`/`) leads to a prefilled research form (`/research?q=...`), Guides (`/guides`) is the searchable library, Saved (`/saved`) shows this browser's bookmarks, and How it works (`/methodology`) explains the evidence model. Entering a provider on Explore does not start a paid request; research starts with the explicit research-form action.
- **Reference-led, usable design.** The charcoal/violet interface defaults to dark mode and supports a persisted light theme, responsive navigation, accessible tabs, reduced motion, loading states, and recoverable errors. Guide tabs organize Overview, Setup steps, Scopes, Approval & review, Common issues, and Sources. Library counts and categories derive from real content.
- **A usable guide beats a broad catalog.** Three initial providers demonstrate distinct problems: GitHub permissions and organization restrictions, Slack Marketplace distribution and review, and Google consent audiences and scope verification.
- **Plan for the launch path.** Research asks about audience, intended APIs/scopes, account permissions, and optional listing. Original request assumptions travel with the public research snapshot; changing a reader's browser-local preferences does not research missing requirements. Explicitly conditional steps are filtered conservatively, with a separate Not applicable state. Optional listing cannot waive mandatory review.
- **Separate work from waiting.** Registration and implementation have labelled planning ranges and inspectable assumptions. Older supported guides use a clearly identified generic baseline. Provider review timing stays separate, source-conditioned, and unknown when evidence is missing; a planning range is never an approval promise.
- **Evidence is part of the interface.** Requirements show source-confirmed, estimate, or unknown status with clickable sources and retrieval dates. Agent-tested exists in the evidence vocabulary, but this build rejects that label because it never performs OAuth setup.
- **Inspect the reasoning.** “Why this requirement?” exposes the exact claim, applicable conditions, supporting passages, AI interpretation, documentation links, retrieval information, and verification status. A matched passage establishes text presence; the separate AI support assessment can still be wrong. Retained summaries are never presented as source quotations.
- **Blockers change the next action.** Blocked and dependency-locked tasks are excluded from immediately actionable recommendations. All curated steps now record dependencies, recovery instructions, responsible roles, and direct documentation. Personal blocker reasons/owners remain in this browser. Older snapshots without metadata retain conservative checklist order. Manually omitting a required prerequisite cannot unlock dependent work.
- **Real research, honest progress.** An unfamiliar provider goes through real hosted web search, constrained synthesis, evidence checks, and durable save. A transient search, generation, or assessment failure gets at most one observed retry within the shared 270-second request budget. Credential, quota, refusal, validation, and save failures are not automatically retried. Request references connect safe diagnostics to user-visible failures; elapsed time measures the actual request, with no invented activity.
- **Human handoffs are explicit.** The agent can investigate and organize documentation. The developer signs in, decides scopes, configures redirects, protects credentials, tests their integration, and handles provider approval.
- **Share content; keep progress personal.** Guide URLs are public and persistent. Saved bookmarks, five checklist states, launch preferences, and blocker notes use the current browser's local storage, so opening a shared guide does not change another developer's setup state. The original research context is public guide content, distinct from a reader's local changes. Saved is a personal convenience without an account or collaboration service.

## Architecture

Next.js App Router, TypeScript, Tailwind CSS, accessible primitives, strict Zod contracts, OpenAI Responses, and libSQL.

```text
Explore / provider library / research form / guide reader
               │
       POST /api/research (NDJSON)
               │
     Input validation + spending controls
               │
     OpenAI hosted web_search → actual sources
               │
     Structured synthesis → Zod + citation provenance
               │
     Bounded HTTPS page retrieval → separate AI support assessment
               │
     Exact passage + provider-domain + support guard
               │
     libSQL persistence → /guides/<id>
```

`src/lib/schema.ts` owns shared contracts. `src/lib/server/` separates retrieval/orchestration and storage from the UI. `src/lib/seed-guides.ts` contains curated, source-checked examples. App Router handlers expose research and Markdown export. SQLite is used locally; Turso's HTTP-compatible libSQL path works on Vercel. Bookmarks and checklists remain local to the reader.

Research rejects malformed output, invented source references, and claims of successful setup testing. Unknown or unsupported OAuth providers produce explicit uncertainty rather than invented registration instructions. The server handles unavailable configuration and upstream failures without returning API keys or raw internal errors.

Before saving, new generated source-confirmed claims require both a server-matched passage from a retrieved provider-domain document and a separate AI assessment of support. Missing, conflicting, or insufficient evidence is marked `unknown`. Model-authored verification stamps are overwritten. Domain association is a heuristic, not independent proof of publisher ownership; an AI support assessment is not factual certification. Curated guides retain their recorded manual audits. Older researched consequential claims without claim-level checks are conservatively shown as unknown at read time without overwriting their immutable database snapshots.

`source-documents.ts` retrieves at most eight selected sources, four concurrently, with ten-second page deadlines and two-MB response limits. It checks and pins public IPv4 DNS addresses into TLS connections, rejects private/reserved hosts and unsafe redirects, and fails closed on inaccessible, oversized, truncated, or unsupported content. Full page text is not stored in guides; matched passages and retrieval metadata are retained.

## Evidence and validation

Read [the provider validation report](docs/provider-validation.md) for confirmed requirements, corrections to common stale guidance, source links, and unverified setup attempts. All three examples were investigated against official provider documentation. They were **not** registered, authorized, tested with tokens, or approved in a provider console.

The live agent is instructed to prioritize official provider documentation. Schema validation verifies structural and citation integrity; it does not prove that every model interpretation is correct. Source conflicts, unknown facts, and approval uncertainty must remain visible. Seeded guides are snapshots, not automatically refreshed documentation.

[Provider corrections](docs/provider-corrections.md) record the subsequent Google branding branches, Slack review durations, Figma token/PKCE amendment, and an actual unauthenticated GitHub registration preflight stopped at sign-in. The historical Figma amendment is dated and scoped to the audited snapshot; it preserves the immutable database record and carries no invented server verification stamp. New generation receives generic token-lifecycle and conditional-approval guidance rather than a hardcoded provider result.

## Verify

```sh
npm run typecheck
npm run lint
npm test
npm run test:quality
npm run build
npx playwright install chromium
npm run test:e2e
npm run check:deployment
npm run check:deployment -- --vercel
```

`npm run check` runs the first four commands. Unit tests cover validation, evidence integrity, research failure handling, and persistence. The browser suite covers library search and recovery, example guides, research routing, checklist reload persistence, save/unsave across navigation and reload, fresh-session sharing, Markdown export, themes, keyboard tabs, mobile navigation, retry, cancellation, and interrupted streams. See [testing notes](docs/testing.md) and [redesign validation](docs/redesign-validation.md).

**Earlier verification, before this final pass:** 85 unit tests and all 16 browser journeys passed, alongside TypeScript, lint, and a production build. A genuine **Linear** run with GPT-5.5 selected **10 official sources**, persisted after reload, and exported Markdown. On 3 November 2026, one genuine **Notion** run through the redesigned UI produced a persisted guide with **six official sources**; reload, Saved, sharing, fresh-session access, and Markdown HTTP 200 were checked without a second research request. Bounded independent audits corroborated the sampled lifecycle and approval distinctions, including optional Notion Marketplace listing versus public OAuth usage. Earlier model errors and corrective work remain visible in [the live validation record](docs/live-validation.md), with an [unaltered Linear example](docs/examples/linear-final.md); the [redesign report](docs/redesign-validation.md) records the Notion audit, real progress observations, and responsive screenshots. Generated validation guides are local research results, not additional preloaded examples in a fresh checkout.

The subsequent reliability and launch-planning pass passed **282 unit tests across 19 files**, **24 browser journeys**, TypeScript, lint, and a production build. The **18-case** quality benchmark also passed and is included in that unit total. One real Figma URL run completed and persisted within approximately 185 seconds. Manual review caught and corrected a plan-ordering issue without overwriting the snapshot or making another paid request. [Reliability validation](docs/reliability-validation.md) records the actual results, observer limits, corrections and unexecuted checks.

The earlier desktop refinement passed **195 unit tests** and **20 browser journeys**. Twelve desktop dark/light captures confirmed the button, spacing, typography, category and evidence-reading refinements; see [desktop polish](docs/desktop-polish.md). The preceding engineering pass passed **192 unit tests** and **19 browser journeys**; its actual live outcomes, failures, and corrections remain recorded in [final validation](docs/final-validation.md). The [research-quality benchmark](docs/research-quality.md) records five actual baseline safety failures, their corrections, and repeatable adversarial/control cases. Synthetic passages and fixture review verdicts test deterministic guard behavior; they do **not** measure live model semantic accuracy.

`check:deployment` returns sanitized configuration booleans and fixed issue codes without API or database calls. `--vercel` checks the hosted requirements and fails when remote storage is absent. Presence/syntax is separate from connectivity and deployed verification.

You need your own server-side OpenAI key to use live research. Automated transport and HTTP fixtures test failures and orchestration without providing a production mock mode. No provider OAuth app was registered or approved during verification.

## Demonstration script

Allow **2–3 minutes of narration**; a real research request may take longer. Keep its progress visible while exploring an existing guide in a second tab.

1. **0:00–0:25:** Explain developer-owned OAuth app registration versus each end user's connection. Open an example and show effort, approval uncertainty, and conditions.
2. **0:25–0:45:** Enter a provider absent from the library, select the intended audience/APIs and explicitly start research. Show actual events, returned sources and request reference. Never substitute a saved snapshot for a live result.
3. **0:45–1:30:** In a second tab, inspect a clearly identified existing guide. Show registration/implementation estimates separately from waiting. Open “Why this requirement?” and distinguish source text, AI interpretation, and unknowns. Mark a task Blocked, record its reason/owner and show independent work; demonstrate an explicit path exclusion or Not applicable without waiving a required dependency.
4. **1:30–2:10:** Save/reopen the guide, reload checklist progress, export Markdown, and open the share URL in a fresh/private browser with independent progress.
5. **2:10–3:00:** Return to the real request. Open its guide if complete; otherwise show its honest current state and explain that durations vary. Finish with one documented correction, benchmark results, and the developer/provider handoff.

## Deploy to Vercel

1. Push this repository to your Git host and import it into Vercel as a Next.js project. Select Node.js 24 (or a supported Node 22 release).
2. Create a Turso database and set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel. Local filesystem writes are not durable serverless persistence.
3. Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` and `RESEARCH_ACCESS_TOKEN` as server-only environment variables.
4. After owner confirmation, deploy using `npm run build`. Verify the actual project/plan permits the route's `maxDuration = 300`; the application deadline is 270 seconds and remote database requests have a 15-second deadline. A source declaration does not establish deployed settings. See [Vercel duration documentation](https://vercel.com/docs/functions/configuring-functions/duration).
5. Run the configuration checker in the intended environment. Open `/api/health`, then verify real model access, remote database connectivity, cold-start persistence, unfamiliar-provider research, and a fresh-session share. Health reports configuration only, with `connectivityVerified: false`.
6. Add the actual hosted URL at the top of this README only after it exists and has been tested. Follow [deployment readiness](docs/deployment-readiness.md) and retain any unexecuted checks.

No external deployment was created by this repository-only build. A working hosted submission link requires the operator's Vercel and database setup.

## Trade-offs and limits

- No user accounts, collaborative checklist state, billing, scheduled refresh, or background job queue.
- Guide URLs are public; do not submit confidential information. Research is documentation work, not a credential-handling service.
- An in-request research stream can be interrupted by network loss or a deployment timeout; retrying starts a new request. There is no resumable job system.
- Live research incurs OpenAI tool/model costs and is subject to account access, rate limits, source accessibility, and model reliability. A shared access token is a small spending gate, not full multi-tenant authorization.
- A bounded stage retry can incur another upstream tool/model charge. It does not resume an abandoned request or establish the cause of the earlier Figma search failure. Known upstream wait instructions longer than five seconds are left to explicit user retry rather than ignored.
- Persistent spending controls limit research to five requests per client/network per hour and thirty requests per deployment per hour. Local development shares one client bucket. These are application limits, separate from upstream provider rate limits.
- An official citation is not proof that an app will be accepted. Provider policy, organization administration, scopes, app behavior, and reviewer judgment affect approval.
- The separate support assessment adds latency and another model judgment. Exact passage matching does not establish entailment or independently certify publisher identity. JavaScript-only, blocked, IPv6-only, contradictory, or out-of-window documents may remain unverified; unsupported approval and timing assertions remain unknown.
- Generated numeric effort ranges, applicability, and dependencies are planning judgments. Deterministic filtering honors recorded metadata; it does not independently prove that a model classified every requirement correctly. A different launch path or scope set can require new research.
- No provider sign-in, OAuth app creation, secret collection, token exchange, security assessment, or approval submission was automated. Hands-on effort is an estimate unless explicitly documented otherwise.

Repository guidance: [AGENTS.md](AGENTS.md), [project context](PROJECT_CONTEXT.md), [product](PRODUCT.md), and [design system](DESIGN.md).
