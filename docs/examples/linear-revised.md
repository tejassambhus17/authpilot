> **Known errors in this second generated snapshot:** the guide incorrectly says no Directory review process is published, although official documentation describes submission. It also marks several explicit unknowns as source-confirmed. These statements and labels are not endorsed. The body is retained unchanged as evidence of model limitations; see [the live validation audit](../live-validation.md).
>
> Second genuine live research snapshot, generated after evidence-based prompt corrections on 3 November 2026. This is model-generated documentation, not a completed OAuth setup.

# Linear OAuth integration guide

Linear provides a developer platform for issue tracking and supports OAuth 2.0 application integrations.

- Provider: https://linear.app/
- OAuth support: supported
- Difficulty: Moderate
- Guide ID: linear-5536b69e-057
- Created: 2026-11-03T12:31:26.171Z
- Updated: 2026-11-03T12:31:26.171Z
- Origin: researched

## Effort and approval

- **estimate**: Registering an app requires configuring a manifest, specifying metadata, redirect URIs and scopes. Public distribution or directory listing may require additional, undocumented steps. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai) [s3](https://linear.app/developers/oauth-app-manifests?utm_source=openai) [s4](https://linear.app/docs/integration-directory?utm_source=openai)
- **unknown**: No published review process or approval timing for registration or directory listing. Unclear if public distribution requires directory approval. [s3](https://linear.app/developers/oauth-app-manifests?utm_source=openai) [s4](https://linear.app/docs/integration-directory?utm_source=openai)

## Prerequisites

You need a Linear workspace with admin privileges to register an OAuth app.

- **source-confirmed**: App registration is done from the API settings of a workspace; admin privileges are required. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)

## App Registration

Register the app in Linear under Settings → API → Applications, or use a JSON manifest to automate config.

- **source-confirmed**: Apps can be registered via UI or manifest upload, supporting custom metadata, redirect URIs, and grant types. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai) [s3](https://linear.app/developers/oauth-app-manifests?utm_source=openai)

## Scopes

Scopes available: read, write, issues:create, comments:create, timeSchedule:write, admin; use least privilege.

- **source-confirmed**: Choose from documented scopes, including agent and app-specific ones if using actor mode. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai) [s2](https://linear.app/developers/oauth-actor-authorization?utm_source=openai) [s5](https://linear.app/developers/agents?utm_source=openai)

## Redirect URIs

1-32 absolute URLs must be specified as valid redirects during registration.

- **source-confirmed**: All redirect URIs must be registered up front; each must be unique and absolute. [s3](https://linear.app/developers/oauth-app-manifests?utm_source=openai)

## Credentials

Client ID and secret generated at registration. PKCE supported. Manage credentials via workspace settings.

- **source-confirmed**: Keep secrets server-side; rotate or revoke them from app settings. PKCE does not require client secret for token exchange. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai)

## Testing

Test the OAuth flow (authorization, token exchange, refresh, revoke) with your redirect URIs and chosen scopes.

- **estimate**: Developers should go through the full authorization code flow, verify PKCE if used, confirm token handling, and try actor=app mode if using agent scenarios. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai) [s2](https://linear.app/developers/oauth-actor-authorization?utm_source=openai) [s5](https://linear.app/developers/agents?utm_source=openai)

## Review

No review or SLA for registration, public distribution, or listing is published. Requirements for production or listing remain undocumented.

- **source-confirmed**: No explicit review or approval timeline published for either app registration or public/directory listing. Manual verification with Linear advised. [s3](https://linear.app/developers/oauth-app-manifests?utm_source=openai) [s4](https://linear.app/docs/integration-directory?utm_source=openai)

## Distribution

Apps can be private or public. Public apps may (optionally) be submitted to Linear’s Integration Directory, but distribution pathway requirements are unclear.

- **source-confirmed**: Public apps are marked distribution=public; directory listing is possible but not guaranteed. It is unknown whether listing is mandatory for public installation. [s3](https://linear.app/developers/oauth-app-manifests?utm_source=openai) [s4](https://linear.app/docs/integration-directory?utm_source=openai)

## Troubleshooting

Rotate secrets or update manifest as needed. Monitor for undocumented issues such as rate limits. Token and scope updates may force re-authorization.

- **source-confirmed**: You can rotate credentials and update app settings without re-registration, but may need user re-authorization for token/scope changes. No published guidance on rate limits or error diagnosis. [s1](https://linear.app/developers/oauth-2-0-authentication?utm_source=openai) [s3](https://linear.app/developers/oauth-app-manifests?utm_source=openai)

## Action checklist

- [ ] **Obtain workspace admin access.** (developer; prerequisites) — You must have admin privileges in the Linear workspace to register an app.
- [ ] **Start app registration.** (developer; registration) — Register the OAuth app via the UI or by submitting a manifest in the workspace’s API Applications admin.
- [ ] **Define required scopes.** (developer; scopes) — Select the minimal set of scopes based on your integration’s needs.
- [ ] **List redirect URIs.** (developer; redirects) — Specify all absolute, unique OAuth callback URLs used by your app.
- [ ] **Copy client credentials.** (developer; credentials) — Securely store the client ID and secret generated during registration. Never expose secrets publicly.
- [ ] **Test authentication flow.** (developer; testing) — Run a full OAuth authorization and token flow, testing your chosen scopes and redirect URIs.
- [ ] **Check for review requirements.** (developer; review) — Contact Linear support to confirm if public distribution or directory listing requires additional review or approval.
- [ ] **Set distribution mode.** (developer; distribution) — Set your app to public if you wish to distribute it beyond your workspace. Apply or inquire about directory submission if desired.
- [ ] **Rotate client secret if needed.** (developer; troubleshooting) — If you suspect your secret is compromised or need to rotate it, update from app settings.

Checklist boxes are intentionally blank: progress belongs to the current browser, not the shared guide.

## Blockers

- **source-confirmed**: It is unknown whether directory listing is mandatory for public OAuth installs; developer must verify with Linear support. [s3](https://linear.app/developers/oauth-app-manifests?utm_source=openai) [s4](https://linear.app/docs/integration-directory?utm_source=openai)
- **source-confirmed**: No documented review/approval process for registration or public listing; the developer should verify possible hidden requirements for production or commercial apps. [s3](https://linear.app/developers/oauth-app-manifests?utm_source=openai) [s4](https://linear.app/docs/integration-directory?utm_source=openai)

## What the agent can do

- Research documentation
- Draft manifest and scope recommendations
- Summarize registration and distribution requirements

## Requires a person or provider

- Sign into Linear
- Submit app registration/manifest
- Choose and confirm required scopes
- Securely store and manage credentials
- Test OAuth and production flows
- Contact provider for review/approval queries

## What AuthPilot never does

- Handle or view credentials
- Sign into provider accounts
- Register or approve apps
- Test real OAuth flows

## Warnings and unknowns

- Linear documentation does not specify whether public app distribution requires directory listing—developer must confirm with Linear support.
- No published guidance on approval SLAs or review steps; prepare for potential manual review especially for public or commercial use cases.
- No documented rate limits or token quotas—monitor usage and handle possible API restrictions.
- Directory listing acceptance is discretionary and not guaranteed; plan for alternative distribution if declined.
- Research snapshot: citations match returned web-search sources. Review provider identity, official-source selection, and interpretation before acting. No OAuth setup or account test was executed.

## Evidence sources

### s1: OAuth 2.0 authentication – Linear Developers

- URL: https://linear.app/developers/oauth-2-0-authentication?utm_source=openai
- Publisher: Linear
- Retrieved: 2026-11-03T12:31:26.171Z
- Supporting evidence summary: Covers authorization code and client credentials flows, PKCE support, token and refresh processes, and secret rotation for apps.

### s2: OAuth actor authorization – Linear Developers

- URL: https://linear.app/developers/oauth-actor-authorization?utm_source=openai
- Publisher: Linear
- Retrieved: 2026-11-03T12:31:26.171Z
- Supporting evidence summary: Explains actor modes ('as user' vs 'as app'), consent flows, and relevant scopes when acting as an app.

### s3: OAuth application manifests – Linear Developers

- URL: https://linear.app/developers/oauth-app-manifests?utm_source=openai
- Publisher: Linear
- Retrieved: 2026-11-03T12:31:26.171Z
- Supporting evidence summary: Documents app manifest schema, registration parameters, required metadata, allowed grant types, and distribution settings.

### s4: Integration Directory – Linear Docs

- URL: https://linear.app/docs/integration-directory?utm_source=openai
- Publisher: Linear
- Retrieved: 2026-11-03T12:31:26.171Z
- Supporting evidence summary: Describes the process for submitting apps to Linear's integration directory and notes submission is discretionary and not guaranteed.

### s5: Getting Started – Linear Developers

- URL: https://linear.app/developers/agents?utm_source=openai
- Publisher: Linear
- Retrieved: 2026-11-03T12:31:26.171Z
- Supporting evidence summary: Guides developers on agent and app-specific OAuth flows and scopes, including restrictions for 'actor=app' mode.

## Evidence methodology

Source-confirmed means documentation-backed, not a successful setup attempt. Evidence excerpts are supporting summaries unless explicitly described as quotations. Agent-tested would require an actual recorded execution; AuthPilot does not execute OAuth setup and never emits that status. Estimates are planning judgments, and unknowns are unresolved. Retrieval dates identify the research snapshot, not the provider's publication date.
