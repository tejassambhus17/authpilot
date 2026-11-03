# AuthPilot project context

AuthPilot helps a developer move from “we need to integrate this provider” to a concrete OAuth registration, testing, and distribution plan. A provider OAuth app is the client registration owned by the integration developer; each end user's authorization and token connection is separate.

The take-home asks for a few varied examples and real-time unfamiliar-provider generation, not a hundred hand-authored entries. GitHub, Slack, and Google cover different distribution and review constraints. The application makes source-confirmed requirements, estimates, unknowns, and unperformed testing explicit.

## Core decisions

- Next.js App Router server routes protect credentials and orchestrate real research.
- OpenAI Responses hosted web search discovers current documentation, followed by schema-constrained guide synthesis. No production mock generation is provided.
- SQLite through libSQL gives a zero-service local start; Turso supplies durable shared storage on Vercel.
- Generated guides have persistent URLs. No accounts are introduced for this focused slice; checklist progress is browser-local.
- Markdown export makes the guide portable. Source links, retrieval dates, evidence status, blockers, and human handoffs travel with it.
- Provider documentation can be stale or contradictory. A cited document is evidence, not a guarantee that the provider will approve an app.

## Main workflows

1. Search the directory, open a guide, read registration and distribution requirements, and track setup status.
2. Submit a new provider name or website, follow actual research events, and receive a validated, persisted guide.
3. Copy a share URL or export Markdown.
4. Inspect the methodology to understand confidence and the agent's limits.

## Deliberate scope limits

No provider sign-in, credential collection, token exchange, review submission, billing, user accounts, collaborative progress, scheduled refresh, or guaranteed approval timing. Paid live research requires the operator's API key. Deployment requires external Vercel and Turso configuration. The repository keeps the seeded documentation and generated-agent path separate so it remains useful without credentials.

## Reference files

`PRODUCT.md` records product truth, `DESIGN.md` records the interface system, `src/lib/schema.ts` defines contracts, `docs/provider-validation.md` records provider evidence, and `docs/testing.md` records verification and manual checks.
