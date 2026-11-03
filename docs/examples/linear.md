> **Known correction from independent review:** this first generated snapshot overstates the relationship between public OAuth distribution and Linear Directory listing. A public OAuth app can be installed by other workspaces; submitting for a Directory listing is a separate path. Do not use this snapshot's Directory language as a mandatory public-distribution requirement. See [the live validation audit](../live-validation.md). The original generated body below is preserved as evidence, not endorsed as fully correct.
>
> Example captured from a genuine live AuthPilot research run on 3 November 2026. This is a generated documentation snapshot, not a preloaded provider or a verified OAuth setup.

# Linear OAuth integration guide

Project management and issue-tracking platform. Linear provides developer APIs and supports extensible OAuth 2.0 authentication for both user and app actor integrations.

- Provider: https://linear.app/
- OAuth support: supported
- Difficulty: Moderate
- Guide ID: linear-a3349e30-fdb
- Created: 2026-11-03T12:18:30.446Z
- Updated: 2026-11-03T12:18:30.446Z
- Origin: researched

## Effort and approval

- **estimate**: Expect moderate effort: Linear offers comprehensive documentation and a developer console for OAuth registration, but you must prepare manifests, choose correct scopes, and manage credential security and any review for public distribution. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai) [s2](https://linear.app/developers/oauth-app-manifests?utm_source=openai)
- **source-confirmed**: App registration is immediate for private/internal use. Public distribution—in Linear’s Integration Directory—requires submission, asset upload, and review. No documented approval timeline. [s3](https://linear.app/docs/integration-directory?utm_source=openai)

## Prerequisites

You must have admin access to a Linear workspace. Prepare your app name, homepage URL, developer/company name (2–80 chars), and at least one absolute redirect URI (HTTPs is recommended).

- **source-confirmed**: Admin access to a Linear workspace is required to register OAuth2 apps. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)
- **source-confirmed**: You need a unique app name, app homepage URL, and developer/company name (2–80 chars). [s2](https://linear.app/developers/oauth-app-manifests?utm_source=openai)

## Registration

Register via Settings → API in Linear workspace. Fill required fields: app name, homepage, redirect URIs, developer name. Optionally, use or export a manifest. Choose private (default) or public distribution.

- **source-confirmed**: App registration occurs in the Linear workspace settings under API. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)
- **source-confirmed**: You can use a manifest to register app settings in JSON format or via pre-defined URLs. [s2](https://linear.app/developers/oauth-app-manifests?utm_source=openai)

## Scopes

Least-privilege recommended. Basic: 'read', 'write'. Granular: 'issues:create', 'comments:create', 'timeSchedule:write'. Full admin: 'admin' (not allowed for app actor). Agent/actor scopes exist for bots and agents. Use only those needed.

- **source-confirmed**: Scopes supported: read, write, issues:create, comments:create, timeSchedule:write, admin (admin not with app actor). [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)
- **source-confirmed**: Agent-specific granular scopes exist (e.g., app:assignable, app:mentionable) for custom bot integrations. [s5](https://linear.app/developers/agents?utm_source=openai)
- **estimate**: Least-privilege access is recommended. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)

## Redirect URIs

Each OAuth app requires 1–32 absolute HTTP(s) redirect URIs. Must match exactly on exchange. Wildcard use is not documented (unknown).

- **source-confirmed**: 1–32 absolute redirect URIs required; must match exactly. [s2](https://linear.app/developers/oauth-app-manifests?utm_source=openai)
- **unknown**: Support for wildcard URIs is undocumented (unknown).

## Credentials

Linear issues client ID and client secret upon app creation. Store secrets securely—never expose. Secrets can be rotated in the developer console; rotation invalidates client credential tokens but not user tokens. Webhook signing secret is separate.

- **source-confirmed**: Client ID and secret are generated and must be kept secure. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)
- **source-confirmed**: Secret rotation invalidates client credential tokens; user tokens persist until refresh. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)

## Testing

Manually test via the following: register app, initiate user flow, obtain and exchange code, call API (such as `viewer` query in GraphQL). Test all redirect URIs and token refresh scenarios.

- **source-confirmed**: Authorization and token exchange flow should be tested, including access/refresh and actor modes. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai) [s4](https://linear.app/developers/oauth-actor-authorization?utm_source=openai)

## Review

For public distribution, submit app via Linear’s Integration Directory, including assets and a filled form. Eligibility: useful to the community and created by formal entities. No formal review timeline specified.

- **source-confirmed**: Submission and review required for public (directory-listed) integrations; assets and form required. [s3](https://linear.app/docs/integration-directory?utm_source=openai)
- **source-confirmed**: No stated SLA or timeline for directory review. [s3](https://linear.app/docs/integration-directory?utm_source=openai)

## Distribution

By default, apps are private (workspace-only install). For public distribution/integration listing, set distribution=public and submit to Linear’s Integration Directory for review. Displayed to other workspaces if approved.

- **source-confirmed**: Distribution is private by default; public apps require directory submission and approval. [s2](https://linear.app/developers/oauth-app-manifests?utm_source=openai) [s3](https://linear.app/docs/integration-directory?utm_source=openai)

## Troubleshooting

Common issues: token refresh errors (30 min retry window), invalidated tokens after secret rotation, state mismatch, or redirect mismatch. Test using recommended parameters and verify all URIs and flows. Consult docs for up-to-date error handling.

- **source-confirmed**: A 30-minute grace period allows retry if token refresh fails. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)
- **source-confirmed**: Secret rotation invalidates client credentials tokens immediately. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)

## Action checklist

- [ ] **Verify Workspace Admin Access** (developer; prerequisites) — Ensure you have admin access to a Linear workspace to register apps.
- [ ] **Prepare App Info** (developer; prerequisites) — Collect app name, homepage URL, developer/organization info, and at least one HTTPS redirect URI.
- [ ] **Register OAuth App in Linear Console** (developer; registration) — Go to Settings → API, create a new OAuth2 application, and provide required fields.
- [ ] **(Optional) Use or Export Manifest** (developer; registration) — Optionally create or use a manifest JSON for reproducible registration/configuration.
- [ ] **Select Required Scopes** (developer; scopes) — Choose the minimum scopes needed for your integration.
- [ ] **Enter Redirect URIs** (developer; redirects) — Provide 1–32 absolute HTTP(s) callback URLs (wildcards support unknown).
- [ ] **Securely Store Credentials** (developer; credentials) — Download and store client ID and secret securely (never expose).
- [ ] **Configure Secret Rotation Policy** (developer; credentials) — Plan and test rotation; understand token behaviors on rotation.
- [ ] **Perform OAuth Flow Tests** (developer; testing) — Test authorization code and refresh flows, ensuring correct redirect and actor behaviors.
- [ ] **Test API Access** (developer; testing) — Use obtained access token to call the API (e.g., GraphQL 'viewer' query) and validate permissions.
- [ ] **Apply for Directory Listing (if public)** (developer; review) — Fill out submission form, upload assets, and request review for integration directory.
- [ ] **Set Distribution to Public (if desired)** (developer; distribution) — Configure app as public during registration or manifest setup.
- [ ] **Handle Token Refresh Issues** (developer; troubleshooting) — Account for 30-minute grace period during refresh and token invalidation upon secret rotation.
- [ ] **Verify Redirect URI and State** (developer; troubleshooting) — Ensure correct URI matching and state parameter use to avoid errors and CSRF.

Checklist boxes are intentionally blank: progress belongs to the current browser, not the shared guide.

## Blockers

- **unknown**: Support for wildcard redirect URIs is unknown; Linear documentation does not specify.
- **source-confirmed**: No published Service Level Agreement (SLA) or timeline for public app/integration review. [s3](https://linear.app/docs/integration-directory?utm_source=openai)

## What the agent can do

- Summarize and interpret Linear OAuth documentation
- Draft step-by-step OAuth app setup instructions
- Highlight unknowns for developer follow-up

## Requires a person or provider

- Sign into Linear and register the OAuth app
- Create, download, and secure credentials
- Select scopes appropriate to the app’s requirements
- Perform manual OAuth flow tests (authorization, token exchange)
- Handle production review submissions and consent to terms

## What AuthPilot never does

- Sign into provider or register OAuth apps
- Obtain or view credential secrets
- Interact with real user accounts, apps, or production data

## Warnings and unknowns

- The Linear OAuth process requires manual admin action in a Linear workspace.
- For public distribution, review approval is discretionary and timing is not guaranteed.
- Credentials must always be kept server-side and out of code repositories.
- Redirect URI wildcard support is unknown; always use exact matches until verified.
- Research snapshot: citations match returned web-search sources. Review provider identity, official-source selection, and interpretation before acting. No OAuth setup or account test was executed.

## Evidence sources

### s1: OAuth 2.0 authentication – Linear Developers

- URL: https://linear.app/developers/oauth-2-0-authentication?utm_source=openai
- Publisher: Linear
- Retrieved: 2026-11-03T12:18:30.446Z
- Supporting evidence summary: Details all supported OAuth grant types, endpoints, PKCE support, scope structure, and typical app registration procedures including authorization parameters. Explains credential rotation impacts on tokens and token expiration, and provides troubleshooting info.

### s2: OAuth application manifests – Linear Developers

- URL: https://linear.app/developers/oauth-app-manifests?utm_source=openai
- Publisher: Linear
- Retrieved: 2026-11-03T12:18:30.446Z
- Supporting evidence summary: Describes the manifest format, required registration fields, redirect URI rules, distribution options (public/private), and optional webhook config. Manifest can be reused or exported for reproducible app setups.

### s3: Integration Directory – Linear Docs

- URL: https://linear.app/docs/integration-directory?utm_source=openai
- Publisher: Linear
- Retrieved: 2026-11-03T12:18:30.446Z
- Supporting evidence summary: Explains requirements and workflow for submitting an integration to the Linear Directory, including required assets, style guidelines, and review eligibility. No commitment to turnaround time for review provided.

### s4: OAuth actor authorization – Linear Developers

- URL: https://linear.app/developers/oauth-actor-authorization?utm_source=openai
- Publisher: Linear
- Retrieved: 2026-11-03T12:18:30.446Z
- Supporting evidence summary: Covers 'actor' parameter, which controls whether actions are performed as the user or as the app/agent. Explains constraints: e.g., 'admin' scope is not allowed with app actors, and custom persona for bot actions is supported.

### s5: Getting Started – Linear Developers

- URL: https://linear.app/developers/agents?utm_source=openai
- Publisher: Linear
- Retrieved: 2026-11-03T12:18:30.446Z
- Supporting evidence summary: Lists example agent-type integrations and their special granular scopes (app:assignable, app:mentionable, customer:read/write) for use with the agent actor mode.

## Evidence methodology

Source-confirmed means documentation-backed, not a successful setup attempt. Evidence excerpts are supporting summaries unless explicitly described as quotations. Agent-tested would require an actual recorded execution; AuthPilot does not execute OAuth setup and never emits that status. Estimates are planning judgments, and unknowns are unresolved. Retrieval dates identify the research snapshot, not the provider's publication date.
