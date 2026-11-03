# Deployment readiness

**4 November 2026 update:** the owner authorized deployment. The public production URL is [authpilot-navy.vercel.app](https://authpilot-navy.vercel.app), with remote Turso storage and server-only production secrets. Current checks and retained failures are in [production validation](production-validation.md). The 3 November pre-deployment assessment below is preserved as history and no longer describes the current credential/deployment state.

Checked locally on **3 November 2026**. This pass did not push, create a Vercel project, deploy, contact a remote database, or verify a hosted URL. Those actions require the owner's confirmation. Local configuration checks are not production smoke tests.

## Reproduce the configuration check

```sh
npm run check:deployment
npm run check:deployment -- --vercel
```

The first command assesses the current environment. The second applies Vercel's durable-storage requirements to the same environment. Both load the production `.env` hierarchy through Next's environment loader and print only booleans, fixed issue codes, and a storage mode. They never print keys, tokens, database URLs, or application input, and make no network requests. A nonzero exit means research configuration is incomplete or unsafe; curated guides can still be read without paid research configuration.

Recorded local results:

| Check                                                    | Actual result                                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Server OpenAI key presence                               | Present; no value printed. This check does not validate account/model access.                     |
| Local persistence                                        | Configured; existing SQLite database retained.                                                    |
| Vercel durable-storage configuration                     | **Not ready:** remote database URL/token pair is absent.                                          |
| Known server credentials in public environment variables | None found by the configuration guard.                                                            |
| Research spending gate                                   | Not configured locally; checker emits a warning. Strongly recommended before a public deployment. |
| Remote Turso connectivity or authorization               | **Not executed.**                                                                                 |
| Actual Vercel function runtime, duration, or persistence | **Not executed.**                                                                                 |
| Hosted public share link                                 | **Not verified in this pass.**                                                                    |

## Configuration and security behavior

- `OPENAI_API_KEY`, `TURSO_AUTH_TOKEN`, and `RESEARCH_ACCESS_TOKEN` stay on the server. Known credential names prefixed with `NEXT_PUBLIC_` cause a startup/build error; the research handler also fails closed for that configuration. `.env.example` contains empty placeholders only.
- `/api/health` reports configuration readiness with `Cache-Control: no-store`. `connectivityVerified: false` explicitly prevents treating presence/syntax checks as an API or database connection test. It returns no environment values.
- Vercel requires **both** `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. The URL must use `libsql://` or `https://` with a public hostname and no embedded credentials, query, fragment, or application path. A partial/malformed pair disables live research instead of falling back to ephemeral serverless files. Existing curated guides remain available.
- Local development uses SQLite when the remote pair is absent. Research snapshots remain immutable. File URL encoding supports Windows paths containing spaces or `#`; an actual cross-process persistence regression exercises such a path.
- Remote database HTTP calls have a **15-second per-request deadline**, preserving existing cancellation. This is a bound, not proof of remote connectivity.
- Research accepts bounded JSON input, applies strict contracts, rejects cross-origin browser requests, compares the optional access token using constant-time hashes, and retains persistent atomic spending budgets: five requests per client/network/hour and thirty per deployment/hour. Raw IPs are not stored in the rate-limit key.
- The shared research token is a spending gate, not accounts or per-user authorization. Guide URLs are public; bookmarks and checklist state belong to each browser. Never submit private provider credentials.
- Standard response headers include `nosniff`, a strict-origin referrer policy, and frame denial. Server errors return safe recovery messages rather than raw upstream errors.

## Function execution budget

The research route uses Node.js and exports **`maxDuration = 300`**. Its application budget is **270 seconds from handler entry**, including database admission and the bounded research/evidence workflow. A regression test simulates 50 seconds of admission and verifies only 220 seconds remain. Expired admission is rejected before paid work; the research abort timer uses the remaining budget. Platform/network behavior still needs a deployed smoke test. Streaming does not make an in-request job resumable, and intermediaries can interrupt a connection. A new submission starts a new request; one bounded transient retry inside a stage shares the original deadline and never retries a save.

The installed Next.js documentation confirms that the route's `maxDuration` is carried into deployment build output. Current [Vercel duration documentation](https://vercel.com/docs/functions/configuring-functions/duration) lists a 300-second Hobby maximum with Fluid Compute; [function limits](https://vercel.com/docs/functions/limitations) describe runtime and payload limits. These pages were checked on 3 November 2026. The actual project must enable a suitable runtime/compute configuration and allow the requested duration. No dashboard configuration is implied by this repository setting.

## Manual checks after an authorized deployment

1. Select the Next.js framework preset and Node.js 24. Set server-only environment variables for the intended Preview/Production targets. Do not copy local file-backed storage to serverless production.
2. Configure a Turso database and its auth token. Set a long random `RESEARCH_ACCESS_TOKEN` for intended reviewers, or consciously accept the bounded public research budget. Share that token privately, separately from the repository and public guide URLs.
3. Confirm the generated research function uses Node.js, permits 300 seconds, and the deployment can reach OpenAI, official documentation, and Turso. Verify `/api/health`; remember that a true readiness flag does not prove connectivity.
4. Submit an unfamiliar provider using the real agent. Open its evidence inspector, examine approval/timing unknowns, and confirm the guide is saved only after validation.
5. Reload the generated URL, open it in a separate browser session, export Markdown, and verify independent checklist/bookmark state. Revisit the URL after a redeploy/cold start to establish remote durability.
6. Exercise access-token rejection, invalid input, cancellation, and a safe controlled error. Confirm no keys or private raw errors appear in response bodies, client bundles, or logs.
7. Record the actual hosted URL, build/deployment identity, test date, observed results, and any failures in the submission README. A local production build passing is not sufficient evidence for this checklist.

Only the local configuration and automated tests described above have been executed here. Provider sign-in, OAuth app registration, token exchange, and approval remain outside this application and this verification.
