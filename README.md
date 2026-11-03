# AuthPilot

An OAuth integration navigator for developers and agent builders. Search GitHub, Slack, and Google guides, track setup steps, and research an unfamiliar provider using a real web-search agent. Guides expose requirements, effort estimates, approval blockers, source evidence, and the actions that need a human.

Built as a focused working slice of the APM Integrations take-home. A provider OAuth app is the developer's client registration; it is separate from each end user's connection. AuthPilot helps with that registration and distribution path.

## Run locally

Use Node.js **22.12 or newer** (Node 24 recommended) and npm. The application and verification tools share this supported baseline.

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

Open [localhost:3000](http://localhost:3000). The three curated guides, directory search, local checklist tracking, themes, share links, and Markdown export work without an API key. Research explains missing configuration instead of returning a fake guide.

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

- **A usable guide beats a broad catalog.** Three initial providers demonstrate distinct problems: GitHub permissions and organization restrictions, Slack Marketplace distribution and review, and Google consent audiences and scope verification.
- **Evidence is part of the interface.** Requirements show source-confirmed, estimate, or unknown status with clickable sources and retrieval dates. Agent-tested exists in the evidence vocabulary, but this build rejects that label because it never performs OAuth setup.
- **Real research, honest progress.** An unfamiliar provider goes through real hosted web search, constrained synthesis, evidence checks, and durable save. Progress events follow observed API and orchestration events; there are no artificial activity timers.
- **Human handoffs are explicit.** The agent can investigate and organize documentation. The developer signs in, decides scopes, configures redirects, protects credentials, tests their integration, and handles provider approval.
- **Share content; keep progress personal.** Guide URLs are public and persistent. Checklists use the current browser's local storage, so opening a shared guide does not change another developer's setup state.

## Architecture

Next.js App Router, TypeScript, Tailwind CSS, accessible primitives, strict Zod contracts, OpenAI Responses, and libSQL.

```text
Directory / research form / guide reader
               │
       POST /api/research (NDJSON)
               │
     Input validation + spending controls
               │
     OpenAI hosted web_search → actual sources
               │
     Structured synthesis → Zod + evidence checks
               │
     libSQL persistence → /guides/<id>
```

`src/lib/schema.ts` owns shared contracts. `src/lib/server/` separates retrieval/orchestration and storage from the UI. `src/lib/seed-guides.ts` contains curated, source-checked examples. App Router handlers expose research and Markdown export. SQLite is used locally; Turso's HTTP-compatible libSQL path works on Vercel. Checklists remain local to the reader.

Research rejects malformed output, invented source references, and claims of successful setup testing. Unknown or unsupported OAuth providers produce explicit uncertainty rather than invented registration instructions. The server handles unavailable configuration and upstream failures without returning API keys or raw internal errors.

Before saving, an evidence guard downgrades source-confirmed claims that explicitly describe uncertainty to `unknown`, preserving their citations as context and recording a warning. This prevents an unresolved fact from carrying a confirmed badge; it does not replace semantic review of the linked documentation.

## Evidence and validation

Read [the provider validation report](docs/provider-validation.md) for confirmed requirements, corrections to common stale guidance, source links, and unverified setup attempts. All three examples were investigated against official provider documentation. They were **not** registered, authorized, tested with tokens, or approved in a provider console.

The live agent is instructed to prioritize official provider documentation. Schema validation verifies structural and citation integrity; it does not prove that every model interpretation is correct. Source conflicts, unknown facts, and approval uncertainty must remain visible. Seeded guides are snapshots, not automatically refreshed documentation.

## Verify

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run check` runs the first four commands. Unit tests cover validation, evidence integrity, research failure handling, and persistence. The browser journey covers provider search, a usable guide, checklist status and reload persistence, Markdown export, theme changes, and an empty state. See [testing notes](docs/testing.md).

**Verified:** 80 unit tests and all 8 browser journeys passed. A final genuine **Linear** run with GPT-5.5 selected **10 official sources**, persisted after reload, and exported Markdown. An independent bounded source audit confirmed the sampled lifecycle and approval distinctions. Earlier model errors and corrective work remain visible in [the live validation record](docs/live-validation.md), with an [unaltered final example](docs/examples/linear-final.md).

You need your own server-side OpenAI key to use live research. Automated transport and HTTP fixtures test failures and orchestration without providing a production mock mode. No provider OAuth app was registered or approved during verification.

## Deploy to Vercel

1. Push this repository to your Git host and import it into Vercel as a Next.js project. Select Node.js 24 (or a supported Node 22 release).
2. Create a Turso database and set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel. Local filesystem writes are not durable serverless persistence.
3. Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` and `RESEARCH_ACCESS_TOKEN` as server-only environment variables.
4. Deploy using the default `npm run build` command. Use a runtime/function duration plan that can support the research request.
5. Open `/api/health`, verify readiness, then test an unfamiliar provider and reload its generated guide URL.

No external deployment was created by this repository-only build. A working hosted submission link requires the operator's Vercel and database setup.

## Trade-offs and limits

- No user accounts, collaborative checklist state, billing, scheduled refresh, or background job queue.
- Guide URLs are public; do not submit confidential information. Research is documentation work, not a credential-handling service.
- An in-request research stream can be interrupted by network loss or a deployment timeout; retrying starts a new request. There is no resumable job system.
- Live research incurs OpenAI tool/model costs and is subject to account access, rate limits, source accessibility, and model reliability. A shared access token is a small spending gate, not full multi-tenant authorization.
- Persistent spending controls limit research to five requests per client/network per hour and thirty requests per deployment per hour. Local development shares one client bucket. These are application limits, separate from upstream provider rate limits.
- An official citation is not proof that an app will be accepted. Provider policy, organization administration, scopes, app behavior, and reviewer judgment affect approval.
- No provider sign-in, OAuth app creation, secret collection, token exchange, security assessment, or approval submission was automated. Hands-on effort is an estimate unless explicitly documented otherwise.

Repository guidance: [AGENTS.md](AGENTS.md), [project context](PROJECT_CONTEXT.md), [product](PRODUCT.md), and [design system](DESIGN.md).
