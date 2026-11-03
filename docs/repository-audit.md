# Repository hygiene and credential audit

Performed on **4 November 2026 (Asia/Calcutta)** before publishing the public-demo and README update.

## What was checked

- All tracked files and the staged submission changes, including the new README assets.
- Full reachable Git history across local and remote refs using **Gitleaks 8.30.1**, downloaded from its official release and checked against the published SHA-256 checksum.
- Exact matches for currently configured OpenAI, Turso and Vercel OIDC credential values in tracked files and historical Git blobs. Values were never printed; base64-encoded forms were checked too.
- Sensitive file names in history, including local environment files, private-key files, database directories, Vercel metadata and local runtimes.
- Ignore rules for `.env.local`, local SQLite data, `.vercel/`, `.runtime/`, temporary security reports and internal review artifacts.
- README local links/anchors, image signatures, and manually reviewed screenshots containing public application content.

**Result:** no leaks detected by the full-history or staged Gitleaks scans; no configured credential values found in tracked files or historical blobs; no sensitive local environment/database/private-key/runtime files found in tracked history. `.env.example` contains placeholders only. Secret values and raw audit tooling remain in ignored local locations.

These checks are bounded evidence, not a formal guarantee that every possible secret pattern, historical credential or indirect disclosure has been discovered. No history rewriting or force push was needed.

## Cleanup

| Removed from Git | Reason |
| --- | --- |
| `.impeccable/design.json` | Generated local design-tool metadata; the human-readable design system remains in `DESIGN.md`. A local ignored copy is retained. |
| `design-qa.md` | Internal chronological review log duplicating the maintained validation reports and referring to ignored local captures. A local ignored copy is retained. |
| `agent.md` | Duplicate entry-point alias; `AGENTS.md` remains the canonical repository instruction file. |

Application code, tests, lockfile, provider assets/provenance, setup templates, product/design context and validation reports remain. Historical failed-provider examples are intentionally retained with errata because the validation reports use them as evidence of corrections. Local credentials needed to operate the app were not deleted; they remain excluded from Git and uploads.

`.gitignore` and `.vercelignore` now exclude the entire local design-tool directory and internal root review log. Scanner binaries and redacted reports are under ignored `.runtime/` and `tmp/` paths.

## Reproduce the secret scans

With the official Gitleaks CLI installed:

```sh
gitleaks git . --log-opts="--all" --redact=100 --no-banner
gitleaks git . --pre-commit --staged --redact=100 --no-banner
git ls-files
git check-ignore .env.local data/authpilot.db .vercel/project.json
```

Keep detailed reports outside tracked source and redact scanner output. New credentials should be stored only in ignored local configuration and the deployment's server-side secret store.

## Public demo configuration

The owner explicitly approved token-free research for interview access. Only `RESEARCH_ACCESS_TOKEN` was removed from production and local configuration. OpenAI and database credentials remain server-only. Per-network and deployment-wide research rate limits remain unchanged. The optional token UI is hidden for public deployments and still works when an operator configures a private gate; both cases have browser tests.
