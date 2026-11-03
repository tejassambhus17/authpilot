# Working on AuthPilot

AuthPilot is a focused OAuth integration navigator, built for a 6–8-hour take-home scope. Read `PRODUCT.md`, `DESIGN.md`, `PROJECT_CONTEXT.md`, and `README.md` before changing product behavior.

## Engineering boundaries

- Keep UI, source retrieval, orchestration, validation, and persistence separate.
- Use strict Zod contracts in `src/lib/schema.ts` for provider output and inputs.
- Keep API keys, client secrets, and research access tokens on the server. Never log or commit credentials; `.env.example` contains placeholders only.
- Live generation must use actual search/retrieval. Test fixtures belong only in tests.
- Progress must describe observed lifecycle events. Do not animate invented research steps.
- Do not claim provider setup was tested. This build researches public documentation; it does not sign in, register OAuth clients, exchange tokens, or obtain approval.
- Cite requirements, label estimates, and leave missing or conflicting facts unknown. Validate references before saving.
- New generated confirmation requires server-matched source text and a separate support assessment. A quotation match is provenance, not semantic certification. Model-authored verification fields are untrusted; overwrite them. Preserve exact check/fetch dates and distinguish summaries from source statements.
- Blocked and dependency-locked steps must not be immediately actionable. Unsupported or unclear OAuth must not recommend executable registration/configuration. Keep step-specific versus related documentation explicit; do not invent blocker reasons.
- Keep public OAuth distribution, optional directory listing, and workspace/admin approval separate. Call a listing or approval mandatory only when official evidence explicitly establishes that prerequisite for the intended use case. A retrieved URL alone does not prove a generated claim follows from it.
- Guide URLs are public share links. Checklist status belongs to the current browser and does not alter another reader's progress.
- Preserve accessible names, native keyboard behavior, dark/light tokens, reduced motion, and responsive layouts.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` for substantive changes. Run `npm run test:e2e` when changing a user journey. Do not expand tests for cosmetic-only edits unless a real regression risk warrants it.

Keep README limitations and `docs/provider-validation.md` accurate. Record the actual source retrieval date when refreshing provider guidance. Preserve Git history and keep generated databases, `.next`, secrets, and test artifacts out of commits.

Run `npm run test:quality` for evidence changes. Its fixture support verdicts test the deterministic guard, not live model accuracy. Keep original failures, corrections, and actual live checks separate. `check:deployment` validates configuration only; production connectivity, persistence, function duration, and hosted behavior require an authorized deployment and actual smoke tests.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
