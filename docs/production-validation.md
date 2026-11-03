# Production deployment — 4 November 2026

Dates in this report use Asia/Calcutta; retained event files use UTC. The owner explicitly authorized deployment, signed in to Vercel/Turso, approved the database credential, and approved transferring the existing OpenAI key and a new research gate into Vercel production secrets. No Git push was performed.

Public URL: [authpilot-navy.vercel.app](https://authpilot-navy.vercel.app).

## Infrastructure and credentials

- Vercel project: `auth-pilot/authpilot`; final deployment `dpl_JBH6AscsuFvxNpWGHyAdLHVV7o83`, source commit `ccaf749`.
- Final deployment metadata reports **READY, Node 24.x, iad1**. The broad previous engine range selected Node 26 even after a project-setting change; `package.json` and root lockfile metadata now pin `24.x`.
- Turso database: `authpilot`, free plan, Virginia. A real authenticated `SELECT 1` verified connectivity. Six public research snapshots were inserted without overwriting existing records, then read back byte-for-byte. The three curated guides remain in source.
- The approved database token has a **90-day lifetime**. Rotate it before expiry and update both local configuration and Vercel production secrets, then redeploy. No paid plan or custom domain was purchased.
- OpenAI, Turso and research-access tokens remain server-only. `.vercelignore` excludes local `.env` files, databases, runtimes, review artifacts and generated builds. Secrets were transferred through CLI stdin rather than command arguments or chat. The generated `RESEARCH_ACCESS_TOKEN` is in ignored `.env.local`; provide only that value privately to reviewers who need live research.
- Automatic approval review initially rejected the bundled secret transfer because the prior approval named only Turso. After the owner explicitly authorized the other two secrets, configuration succeeded. No secret transfer occurred in the rejected command.
- Automatic GitHub linking failed. Direct CLI deployment succeeded; GitHub-triggered deployments are not configured. Local commits were preserved on `main`, without pushing.

## Executed public checks

Anonymous HTTP requests to the stable public alias returned **200** for the homepage, health, guide library, GitHub guide and Markdown export without a Vercel login. Health reports hosted/remote persistence, configured server key, required research token, and research readiness, with no issues or warnings. Its `connectivityVerified: false` deliberately remains a configuration-only statement; independent database/research checks below establish the separately tested connections.

The final Node 24 deployment returned ten guides after the successful Figma run: three curated and seven researched. A missing research token returns **401**. Authorized loopback-provider input returns **400** before paid research. Browser checks confirmed hosted library search, save/share feedback, checklist persistence after reload, and the evidence inspector. Temporary browser test progress/bookmarks were restored; no OAuth setup completion was asserted. The copied guide-link control showed success. The actual export content was independently checked over HTTP.

## Hosted live outcomes

The first real Figma URL request, `AP-29534c21-382`, failed honestly with `RESEARCH_OUTPUT_LIMIT` after approximately **82 seconds**, during search. No guide was saved. The event record is retained. [Official OpenAI documentation](https://developers.openai.com/api/docs/guides/token-counting) confirms output caps include non-visible/tool/reasoning output, requiring headroom beyond the visible report.

The correction increases search headroom from **7,000 to 12,000 tokens** and explicitly requests a compact evidence memo under 1,400 words, leaving full guide/checklist construction to synthesis. Output-limit failures still are not automatically retried. A proposed tool-call-cap parameter was removed when the installed SDK's TypeScript contract rejected it; no unsupported parameter ships. An installed-SDK request test checks the concise-stage instruction and output cap.

After redeployment, one controlled Figma retry, `AP-abb38443-c3f`, succeeded. Search completed at **38 seconds**, synthesis and page retrieval at **95–96**, and save/completion at **147**. Read/export follow-up finished at approximately **150 seconds**. Guide: [figma-cf4a44c7-cce](https://authpilot-navy.vercel.app/guides/figma-cf4a44c7-cce). All five selected documentation pages returned readable text; the pipeline labelled 26 of 32 claims source-confirmed, five unknown and one estimate. These are automated evidence results, not independent certification of every claim.

The generated plan explicitly separates public-review submission and the provider decision. Token reuse/access-token replacement is retained. PKCE details remain unknown in this particular retrieval rather than fabricated; the older manually audited Figma amendment is not silently applied to new snapshots. Optional-listing phrasing and other generated planning judgments still merit human review.

That paid Figma request began on the intermediate Node 26 deployment. The final Node 24 redeployment preserved its remote-backed guide and returned the library/export successfully after the runtime change.

On the **final Node 24 deployment**, an unfamiliar-provider Discord request (`AP-f30711db-541`) completed and saved at approximately **120 seconds**, with page/export follow-up finishing at **122 seconds**. Guide: [discord-82f02cc3-085](https://authpilot-navy.vercel.app/guides/discord-82f02cc3-085). Five official sources were selected; one returned readable text and four returned HTTP 403. The pipeline retained 30 claims: ten source-confirmed, nineteen unknown and one estimate. These unavailable documents remain visibly unverified; no access restriction was bypassed. Scope/review/PKCE details that could not be established remain unknown. This demonstrates working generation and conservative degradation, not a complete provider-policy audit.

The new Discord share URL also opened in an independent in-app browser without Vercel sign-in, with an unsaved bookmark and Not started personal checklist. The final library contains eleven guides, including both new hosted results. The real paid calls in this deployment pass total **three**: the retained output-limit failure, successful Figma retry and successful unfamiliar-provider Discord run. No provider OAuth setup was executed by these checks.

## Verification and limits

After the search-output fix, **282 unit tests across 19 files**, TypeScript, lint, the **18-case quality subset**, and the local production build passed. Both subsequent Vercel production builds reached READY. The earlier 24 browser journeys remain the local end-to-end suite result; they were not rerun wholesale against the public site. Hosted HTTP, browser and real-agent smoke checks are listed individually above.

The route declares a 300-second platform budget and a 270-second application deadline. The completed long-running request demonstrates execution beyond typical short timeouts; this pass did not intentionally exhaust the entire deadline or independently certify every dashboard/platform limit. No provider account sign-in, client registration, OAuth credential exchange or provider approval was performed. Future model output and provider policies remain uncertain. No full penetration test, load test, physical-device test, or complete accessibility certification is claimed.

Local ignored evidence is under `.impeccable/review/deployment/`, including initial failure events, successful research events, generated guide/export and the hosted screenshot. No credential values are in this report or committed artifacts.
