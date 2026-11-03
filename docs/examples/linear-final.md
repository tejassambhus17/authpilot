> Final genuine live research snapshot, generated with GPT-5.5 and evidence-grounding safeguards on 3 November 2026. This is model-generated documentation, not a completed OAuth setup. See [the live validation and sampled audit](../live-validation.md).

# Linear OAuth integration guide

Linear supports OAuth 2.0 for third-party applications that access the Linear GraphQL API. The supplied official documentation covers authorization-code OAuth, PKCE, refresh/revocation, app/agent actor authorization with actor=app, OAuth app manifests, workspace third-party app approvals, and Integration Directory listing. Several lifecycle details remain unconfirmed by the research, including OAuth client registration timing, whether switching an OAuth app to publicly installable triggers Linear review, and directory review timing.

- Provider: https://linear.app/
- OAuth support: supported
- Difficulty: Moderate
- Guide ID: linear-2b82f1a2-333
- Created: 2026-11-03T12:42:45.485Z
- Updated: 2026-11-03T12:42:45.485Z
- Origin: researched

## Effort and approval

- **estimate**: Plan for a moderate setup: a workspace admin must create/configure the OAuth app, choose least-privilege scopes, implement the authorization-code flow and token refresh, test in a Linear workspace, and separately handle customer workspace approval settings or directory submission if those lifecycle paths apply. The research did not establish Linear-published timing for registration, public installability review, or directory review. [s1](https://linear.app/developers/oauth-2-0-authentication) [s4](https://linear.app/developers/oauth-app-manifests) [s5](https://linear.app/developers/oauth-actor-authorization) [s6](https://linear.app/developers/agents) [s7](https://linear.app/docs/api-and-webhooks?_rsc=15jym) [s8](https://linear.app/docs/third-party-application-approvals)
- **unknown**: OAuth client registration, public installability, workspace administrator authorization, provider review, commercial distribution, and Integration Directory listing are separate lifecycle paths. The research confirms workspace-admin requirements for creating/managing OAuth apps and for actor=app agent installation, plus optional workspace Third-Party App Approvals and separate Integration Directory submission requirements. The research could not establish a published Linear SLA or approval timing for OAuth client registration, public installability, workspace-admin approval, provider review, commercial distribution, or directory listing. [s1](https://linear.app/developers/oauth-2-0-authentication) [s4](https://linear.app/developers/oauth-app-manifests) [s5](https://linear.app/developers/oauth-actor-authorization) [s6](https://linear.app/developers/agents) [s7](https://linear.app/docs/api-and-webhooks?_rsc=15jym) [s8](https://linear.app/docs/third-party-application-approvals)

## Prerequisites

Prepare a Linear workspace, an admin account, application URLs, redirect callback URLs, and a least-privilege scope plan before creating the OAuth app.

- **source-confirmed**: Linear’s public API is GraphQL, and its developer documentation recommends OAuth 2.0 when building an application for others to use. [s2](https://linear.app/developers/graphql)
- **source-confirmed**: OAuth apps are created and managed from Linear workspace settings under Administration/API, and admin permissions are necessary to view the relevant API page. [s1](https://linear.app/developers/oauth-2-0-authentication) [s7](https://linear.app/docs/api-and-webhooks?_rsc=15jym)
- **source-confirmed**: Linear highly recommends creating a separate workspace for managing an OAuth2 application because each admin user will have access to the application. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: For actor=app agent/app authorization, the installation is workspace-scoped and admin permissions are required to complete installation. [s5](https://linear.app/developers/oauth-actor-authorization) [s6](https://linear.app/developers/agents)
- **unknown**: The research could not establish whether Linear provides a dedicated OAuth sandbox environment; the developer should verify current sandbox/test-workspace options in Linear’s UI or with Linear support.

## Register the OAuth application

A workspace admin creates the OAuth2 application in Linear, configures app metadata and redirect URLs, and chooses whether the app is private or publicly installable when supported by the app type.

- **source-confirmed**: Linear documents creating a new OAuth2 application and configuring redirect callback URLs. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: Linear’s OAuth app manifest documentation identifies a create form at https://linear.app/settings/api/applications/new and says URL parameters can pre-populate the Create OAuth app page. [s4](https://linear.app/developers/oauth-app-manifests)
- **source-confirmed**: Manifest-supported registration fields include distribution, developer name, OAuth client name, client URI, redirect URIs, grant types, optional display metadata, optional icon URL, and optional webhook configuration. [s4](https://linear.app/developers/oauth-app-manifests)
- **source-confirmed**: The manifest field distribution accepts private or public, defaults to private, and controls whether the app is private to one workspace or publicly installable/installable by other workspaces. [s4](https://linear.app/developers/oauth-app-manifests)
- **source-confirmed**: The manifest field oauth.grant_types allows authorization_code and client_credentials, requires at least one unique value, must include authorization_code, and defaults to authorization_code. [s4](https://linear.app/developers/oauth-app-manifests)
- **unknown**: The research could not establish a Linear-published timing or SLA for OAuth client creation, nor whether creation always completes immediately; the developer should check the current app-creation UI and Linear support for any account-specific gating.

## Choose least-privilege scopes

Request only the Linear scopes needed by your GraphQL operations and app type. Use targeted create/write scopes instead of broad write where possible, and apply actor=app-specific scopes only for app/agent installations.

- **source-confirmed**: Linear documents standard OAuth scopes including read, write, issues:create, comments:create, and timeSchedule:write for the authorization URL scope parameter. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: Linear describes read as default read access for the user’s account and always present. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: Linear advises using a more targeted scope if the app only needs to create comments instead of requesting the broader write scope. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: For app/agent authorization using actor=app, Linear documents app:assignable and app:mentionable plus customer and initiative read/write scopes for the corresponding app behavior and data access. [s6](https://linear.app/developers/agents)
- **source-confirmed**: Linear states that integrations using actor=app cannot also request admin scope. [s6](https://linear.app/developers/agents)
- **unknown**: The reviewed official docs did not provide a complete exhaustive OAuth scope catalog for every Linear API capability; the developer should confirm required scopes for the exact GraphQL operations in current Linear docs or the app creation UI.

## Configure redirect URIs

Register one or more redirect callback URLs and ensure the authorization request and token exchange use the same redirect URI.

- **source-confirmed**: Linear requires configuring redirect callback URLs when creating an OAuth2 application. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: The manifest oauth.redirect_uris field is required, must contain at least one URI, can contain at most 32, and values must be unique. [s4](https://linear.app/developers/oauth-app-manifests)
- **source-confirmed**: Linear’s authorization-code token exchange requires redirect_uri to be the same redirect URI used in the authorization step. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: Linear examples include http://localhost:3000/oauth/callback for local development. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **unknown**: The research could not establish all redirect URI validation rules, including whether production redirects must be HTTPS, whether exact string matching is enforced beyond the documented token-exchange same-URI requirement, or whether wildcards/custom URI schemes are allowed; the developer should not assume wildcard support without checking the current UI/docs.

## Handle client credentials and tokens securely

Keep Linear OAuth client secrets, refresh tokens, and access tokens out of this app and store them server-side or in an appropriate secrets manager. Use PKCE where appropriate and never expose client_secret in a public client.

- **source-confirmed**: Linear’s non-PKCE authorization-code token exchange requires code, redirect_uri, client_id, client_secret, and grant_type=authorization_code sent as application/x-www-form-urlencoded to https://api.linear.app/oauth/token. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: For PKCE token exchange, Linear documents client_secret as optional and requires code_verifier. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: A successful token exchange returns an access token and refresh token; Linear states the access token is valid for 24 hours and must be refreshed when it expires. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: For refresh-token requests, Linear supports HTTP Basic authentication with client_id:client_secret or passing client_id and client_secret as parameters; if the access token was generated using PKCE, passing client_id is sufficient. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: Linear documents token revocation via POST https://api.linear.app/oauth/revoke with the token in a form field and optional token_type_hint. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **estimate**: Client secrets and tokens must be handled by the developer’s backend or secure secret storage and must not be placed in this app or shared with AuthPilot. [s1](https://linear.app/developers/oauth-2-0-authentication)

## Test the OAuth flow

The developer should execute end-to-end tests in a Linear workspace using test redirect URLs, least-privilege scopes, token refresh, revocation, and the intended GraphQL operations. No tests were executed by this agent.

- **source-confirmed**: To test authorization-code OAuth, the developer should send a user to https://linear.app/oauth/authorize with client_id, redirect_uri, response_type=code, and a comma-separated scope parameter. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: Linear examples include a state parameter, and its redirect-handling documentation says the returned state must match the originally specified value or the request should not be trusted. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: After approval, Linear redirects back to the application with an authorization code in URL parameters, and the developer should exchange that code at the token endpoint. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: The developer should call the Linear GraphQL API endpoint at https://api.linear.app/graphql with the obtained OAuth access token for the intended operations. [s1](https://linear.app/developers/oauth-2-0-authentication) [s2](https://linear.app/developers/graphql)
- **source-confirmed**: The developer should test refresh-token handling, including Linear’s documented 30-minute grace period for replaying a valid refresh request when the client did not receive the new refresh token. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: For an agent/app-actor flow, the developer should test adding actor=app to the OAuth authorization URL and verify that installation requires an admin in the target workspace. [s5](https://linear.app/developers/oauth-actor-authorization) [s6](https://linear.app/developers/agents)
- **unknown**: No OAuth client was created, no credentials were handled, and no Linear OAuth flow was executed by this agent.

## Review, verification, and administrator approval paths

Do not merge distinct lifecycle paths. Linear documents workspace admin requirements and optional workspace Third-Party App Approvals, and separately documents Integration Directory submission. The research did not establish provider-level OAuth verification timing or public-installability review timing.

- **source-confirmed**: For actor=app agent/app installations, Linear states that admin permissions are required because the app is installed with a workspace scope. [s5](https://linear.app/developers/oauth-actor-authorization) [s6](https://linear.app/developers/agents)
- **source-confirmed**: Linear has a Third-Party App Approvals workspace setting available to workspaces on any paid plan; a workspace owner in an Enterprise workspace or a workspace admin in any other paid workspace can enable it from Administration/Security. [s8](https://linear.app/docs/third-party-application-approvals)
- **source-confirmed**: When Third-Party App Approvals are enabled, a workspace member trying to install a third-party app can request approval and include a reason; workspace owners/admins receive email and in-app notifications, and the requester is notified when the app is approved or denied. [s8](https://linear.app/docs/third-party-application-approvals)
- **source-confirmed**: Linear’s documentation distinguishes Integration Directory listing from OAuth app configuration; directory submission has its own form, asset requirements, and acceptance criteria. [s9](https://linear.app/docs/integration-directory)
- **unknown**: The research could not establish a Linear provider-level app verification or security review requirement for creating an OAuth client, switching distribution=public, or using the documented common OAuth scopes; it also could not establish that no such review exists. The developer should verify in the current app UI or with Linear support.
- **unknown**: The research could not establish a published timing or SLA for workspace-admin Third-Party App Approval decisions; these decisions are controlled by the customer workspace’s admins/owners.
- **unknown**: The research could not establish a published timing or SLA for Linear Integration Directory review.

## Distribution and listing

For OAuth manifests, public means installable by other workspaces, not necessarily listed in the Integration Directory. Directory listing is a separate discovery/commercial-presentation path with its own submission requirements. Agent documentation introduces a possible conflict that should be verified for cross-workspace agent distribution.

- **source-confirmed**: Linear’s OAuth app manifest defines distribution=private or distribution=public, with private as the default; public means publicly installable/installable by other workspaces. [s4](https://linear.app/developers/oauth-app-manifests)
- **unknown**: The supplied official documentation establishes public installability in the OAuth manifest path but does not establish that Integration Directory listing is universally required for non-agent OAuth apps to be installable by other workspaces.
- **source-confirmed**: For agents, Linear’s agent documentation says developers can build agents for internal use or distribution to other organizations and says to submit an agent to Linear’s Integration Directory to make it available to other workspaces. [s6](https://linear.app/developers/agents)
- **unknown**: There is an evidence conflict or ambiguity for cross-workspace agents: OAuth manifest documentation defines public as installable by other workspaces, while agent documentation says making an agent available to other workspaces uses Integration Directory submission. The developer should verify with Linear whether directory submission is mandatory for all cross-workspace agent installs or only for listing/discoverability. [s4](https://linear.app/developers/oauth-app-manifests) [s6](https://linear.app/developers/agents)
- **source-confirmed**: Linear’s Integration Directory features apps/add-ons created by Linear and external applications, and developers can build integrations and submit them to the directory. [s9](https://linear.app/docs/integration-directory)
- **source-confirmed**: For Integration Directory submissions, Linear documents completing a form, sending assets to integrations@linear.app or including a link in the form, and required icon/showcase image specifications when not using Linear’s Figma template. [s9](https://linear.app/docs/integration-directory)
- **source-confirmed**: Linear says it accepts integrations it thinks are useful to the community and built by formal companies, and generally does not accept scripts, low-effort/vibe-coded apps, or hobbyist apps. [s9](https://linear.app/docs/integration-directory)
- **unknown**: The research did not establish separate commercial-distribution approval requirements beyond OAuth distribution settings and Integration Directory listing criteria; the developer should not treat directory listing as a universal commercial-distribution requirement unless Linear confirms it for the exact app type.

## Troubleshooting

Common issues include lacking admin permissions, redirect_uri mismatch, state mismatch, workspace third-party app approvals, actor=app/admin-scope conflicts, and refresh-token handling failures.

- **source-confirmed**: If a non-admin cannot access OAuth app creation or management, confirm they have workspace admin permissions because Linear’s API administration page requires admin permissions. [s7](https://linear.app/docs/api-and-webhooks?_rsc=15jym)
- **source-confirmed**: If an actor=app agent/app installation fails for a non-admin, use a workspace admin account because Linear requires admin permissions for that workspace-scoped installation. [s5](https://linear.app/developers/oauth-actor-authorization) [s6](https://linear.app/developers/agents)
- **source-confirmed**: If installation is blocked in a paid workspace, check whether Third-Party App Approvals are enabled and have the member request approval from the workspace owners/admins. [s8](https://linear.app/docs/third-party-application-approvals)
- **source-confirmed**: If token exchange fails, verify that redirect_uri exactly matches the redirect URI used in the authorization step as required by Linear’s token exchange documentation. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: If state validation fails, do not trust the OAuth callback because Linear says the returned state must match the originally specified value. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: If an actor=app authorization request includes admin scope, remove it because Linear states actor=app integrations cannot also request admin scope. [s6](https://linear.app/developers/agents)
- **source-confirmed**: If a refresh request succeeded but the new refresh token was not received, Linear documents a 30-minute grace period allowing replay of the original valid refresh request. [s1](https://linear.app/developers/oauth-2-0-authentication)

## Action checklist

- [ ] **Choose the Linear app type and audience** (developer; prerequisites) — Decide whether this is a user-authorized OAuth app, an actor=app app/agent, an internal/private app, a publicly installable app, or a directory-listed integration. Keep these lifecycle paths separate.
- [ ] **Create or select a management workspace** (developer; prerequisites) — Use a Linear workspace for managing the OAuth app; consider Linear’s recommendation to use a separate workspace so admins can access the app configuration.
- [ ] **Sign in as a Linear workspace admin** (developer; registration) — Use an account with workspace admin permissions to access Settings > Administration > API and manage OAuth applications.
- [ ] **Create the OAuth2 application** (developer; registration) — Create a new OAuth2 application in Linear and configure the application name, developer information, client URI, and redirect callback URLs.
- [ ] **Set distribution intentionally** (developer; distribution) — Use private for current-workspace-only use or public for other-workspace installability if appropriate. For agents, verify with Linear whether Integration Directory submission is required for your cross-workspace distribution model.
- [ ] **Register redirect URIs** (developer; redirects) — Add at least one unique redirect URI and keep the total within Linear’s documented maximum of 32. Include localhost only for development if appropriate.
- [ ] **Choose least-privilege scopes** (developer; scopes) — Start with read and add only the targeted scopes your operations require, such as comments:create or issues:create. For actor=app agents, add only needed app/customer/initiative scopes and do not request admin scope.
- [ ] **Implement authorization request** (developer; testing) — Redirect users to Linear’s authorization endpoint with client_id, redirect_uri, response_type=code, comma-separated scope, and a state value. Add actor=app only for app/agent installation flows.
- [ ] **Implement callback validation** (developer; testing) — On callback, verify the returned state matches the original state before exchanging the code.
- [ ] **Exchange code for tokens server-side** (developer; credentials) — POST the authorization code to Linear’s token endpoint using application/x-www-form-urlencoded parameters. Keep client_secret server-side; use PKCE where appropriate.
- [ ] **Store credentials and tokens securely** (developer; credentials) — Store client_secret, refresh tokens, and access tokens in backend secret storage. Do not place secrets in this app or provide them to AuthPilot.
- [ ] **Implement refresh and revocation** (developer; credentials) — Refresh access tokens before/when they expire, handle Linear’s refresh-token grace-period behavior, and implement token revocation where needed.
- [ ] **Test GraphQL operations** (developer; testing) — Use the OAuth access token to call Linear’s GraphQL API and verify only the intended read/write operations are possible with the selected scopes.
- [ ] **Test customer workspace approval paths** (developer; review) — If installing into another workspace, verify whether the workspace requires admin installation, Third-Party App Approval, or additional approval for requested scopes.
- [ ] **Submit to Integration Directory only if seeking listing or if Linear confirms it is required** (developer; distribution) — If pursuing a directory listing, complete Linear’s submission form and provide required assets. Do not assume directory listing is required for every public OAuth install unless Linear confirms it for your app type.
- [ ] **Review and approve app requests inside customer workspaces** (provider; review) — Workspace owners/admins review third-party app approval requests when that paid-workspace setting is enabled.
- [ ] **Handle Integration Directory review** (provider; review) — Linear evaluates submitted directory integrations according to its directory criteria. The research did not establish review timing.
- [ ] **Troubleshoot failed installs or token errors** (developer; troubleshooting) — Check admin permissions, third-party approval settings, redirect_uri consistency, state validation, actor=app/admin-scope conflicts, and refresh-token replay behavior.

Checklist boxes are intentionally blank: progress belongs to the current browser, not the shared guide.

## Blockers

- **source-confirmed**: A developer without workspace admin permissions may be unable to create or manage Linear OAuth applications from the Administration/API settings page. [s7](https://linear.app/docs/api-and-webhooks?_rsc=15jym)
- **source-confirmed**: A non-admin user cannot complete an actor=app agent/app installation where Linear requires admin permissions for the workspace-scoped install. [s5](https://linear.app/developers/oauth-actor-authorization) [s6](https://linear.app/developers/agents)
- **source-confirmed**: A paid customer workspace with Third-Party App Approvals enabled may block installation until a workspace owner/admin approves the third-party app request. [s8](https://linear.app/docs/third-party-application-approvals)
- **source-confirmed**: An OAuth callback with a mismatched state value must not be trusted. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: A token exchange can fail if redirect_uri is not the same redirect URI used in the authorization step. [s1](https://linear.app/developers/oauth-2-0-authentication)
- **source-confirmed**: An actor=app integration cannot also request admin scope. [s6](https://linear.app/developers/agents)
- **source-confirmed**: Directory listing may be unavailable for apps Linear considers scripts, low-effort/vibe-coded apps, hobbyist apps, not useful to the community, or not built by formal companies. [s9](https://linear.app/docs/integration-directory)
- **unknown**: The research could not establish whether distribution=public triggers Linear review or what timing applies; verify before promising a launch date.
- **unknown**: For cross-workspace agents, the relationship between public OAuth installability and Integration Directory submission is ambiguous in the supplied docs; verify the current requirement with Linear. [s4](https://linear.app/developers/oauth-app-manifests) [s6](https://linear.app/developers/agents)

## What the agent can do

- Research Linear’s official OAuth, app manifest, agent, approval, and directory documentation.
- Draft an OAuth setup plan and checklist based on supplied official sources.
- Identify documented requirements, unknowns, evidence conflicts, and lifecycle-path distinctions.
- Suggest least-privilege scope-selection strategy from documented scopes.

## Requires a person or provider

- Sign in to Linear as a workspace admin.
- Create or configure the OAuth application in Linear.
- Choose the exact app type, audience, distribution value, redirect URIs, and scopes.
- Store client_secret, access tokens, and refresh tokens in developer-controlled secure storage.
- Run OAuth authorization, callback, token exchange, refresh, revocation, and GraphQL API tests.
- Request or respond to workspace administrator approvals.
- Contact Linear support or integrations@linear.app to resolve unknowns or submit a directory listing.

## What AuthPilot never does

- AuthPilot cannot sign in to Linear.
- AuthPilot cannot register or modify Linear OAuth apps.
- AuthPilot cannot handle, view, store, or transmit client secrets or tokens.
- AuthPilot cannot execute OAuth flows or GraphQL API tests.
- AuthPilot cannot obtain workspace admin approval, Linear provider approval, public installability, commercial approval, or Integration Directory listing.

## Warnings and unknowns

- Provider documentation and UI may change; verify all app settings, scopes, redirect rules, and approval requirements in the current Linear UI before launch.
- Do not conflate Linear OAuth public installability with Integration Directory listing. The supplied docs establish these as separate paths, with ambiguity specifically for cross-workspace agents.
- Do not promise approval or launch timing: the research did not establish published Linear SLAs for OAuth client registration, public installability, workspace-admin approval, or directory review.
- Keep client secrets and tokens server-side; never embed them in a public client, this app, logs, documentation, or support messages.
- Use least-privilege scopes and avoid requesting write/admin-like permissions unless required for the exact Linear operations.
- Research snapshot: citations match returned web-search sources. Review provider identity, official-source selection, and interpretation before acting. No OAuth setup or account test was executed.

## Evidence sources

### s1: OAuth 2.0 authentication

- URL: https://linear.app/developers/oauth-2-0-authentication
- Publisher: Linear
- Retrieved: 2026-11-03T12:42:45.485Z
- Supporting evidence summary: Official Linear OAuth documentation covering authorization endpoint, token endpoint, authorization-code flow parameters, PKCE, state handling, refresh tokens, token revocation, access token lifetime, standard scopes, redirect callback URLs, and OAuth app management guidance.

### s2: GraphQL API

- URL: https://linear.app/developers/graphql
- Publisher: Linear
- Retrieved: 2026-11-03T12:42:45.485Z
- Supporting evidence summary: Official Linear developer documentation identifying the GraphQL API endpoint and stating that OAuth is recommended when building an application for others to use.

### s3: Developers

- URL: https://linear.app/developers
- Publisher: Linear
- Retrieved: 2026-11-03T12:42:45.485Z
- Supporting evidence summary: Official Linear developer portal for API and app development resources.

### s4: OAuth app manifests

- URL: https://linear.app/developers/oauth-app-manifests
- Publisher: Linear
- Retrieved: 2026-11-03T12:42:45.485Z
- Supporting evidence summary: Official Linear documentation for pre-populating OAuth app creation, manifest fields, distribution values, redirect URI constraints, grant types, app metadata, and webhook configuration.

### s5: OAuth actor authorization

- URL: https://linear.app/developers/oauth-actor-authorization
- Publisher: Linear
- Retrieved: 2026-11-03T12:42:45.485Z
- Supporting evidence summary: Official Linear documentation explaining user-actor versus app-actor OAuth authorization and use of actor=app so actions are performed by the app.

### s6: Agents

- URL: https://linear.app/developers/agents
- Publisher: Linear
- Retrieved: 2026-11-03T12:42:45.485Z
- Supporting evidence summary: Official Linear agent documentation describing app authentication built on OAuth2, actor=app installation, admin permission requirement, agent-specific scopes, scope restriction with admin, and Integration Directory language for making agents available to other workspaces.

### s7: API and Webhooks – Linear Docs

- URL: https://linear.app/docs/api-and-webhooks?_rsc=15jym
- Publisher: Linear
- Retrieved: 2026-11-03T12:42:45.485Z
- Supporting evidence summary: Official Linear product documentation indicating API and OAuth application management is under Settings > Administration > API and requires admin permissions.

### s8: Third-Party App Approvals – Linear Docs

- URL: https://linear.app/docs/third-party-application-approvals
- Publisher: Linear
- Retrieved: 2026-11-03T12:42:45.485Z
- Supporting evidence summary: Official Linear documentation for workspace Third-Party App Approvals, including plan availability, who can enable the setting, member approval requests, and owner/admin approval or denial notifications.

### s9: Integration Directory – Linear Docs

- URL: https://linear.app/docs/integration-directory
- Publisher: Linear
- Retrieved: 2026-11-03T12:42:45.485Z
- Supporting evidence summary: Official Linear documentation for the Integration Directory, describing directory purpose, submission form, asset requirements, contact path, and criteria for accepted integrations.

### s10: Changelog – Linear

- URL: https://linear.app/changelog/page/4
- Publisher: Linear
- Retrieved: 2026-11-03T12:42:45.485Z
- Supporting evidence summary: Official Linear changelog page noting that users in workspaces with OAuth app approvals can request approval for additional scopes beyond the initially approved set.

## Evidence methodology

Source-confirmed means documentation-backed, not a successful setup attempt. Evidence excerpts are supporting summaries unless explicitly described as quotations. Agent-tested would require an actual recorded execution; AuthPilot does not execute OAuth setup and never emits that status. Estimates are planning judgments, and unknowns are unresolved. Retrieval dates identify the research snapshot, not the provider's publication date.
