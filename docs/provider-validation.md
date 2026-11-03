# Provider evidence review

Reviewed on **3 November 2026** using live retrieval of official provider documentation. This is a documentation review, not a completed OAuth registration, token exchange, or approval. No provider credentials, paid accounts, or production permissions were used.

The attached assignment asks for a few varied providers and a real generation flow, not all 100 library entries. GitHub demonstrates user authorization with organization policy; Slack demonstrates installation and commercial distribution review; Google demonstrates scope-dependent verification. They expose meaningfully different launch blockers.

## Method

1. Read the official registration, authorization, scope, and distribution documentation for each provider.
2. Compare common setup assumptions with the current text; retain links and short supporting excerpts in the seeded guide.
3. Distinguish source-confirmed requirements from our hands-on effort estimates and app-specific unknowns.
4. Give the developer an explicit test and approval checklist. These are instructions to execute, never a claim that AuthPilot executed them.

Retrieved pages can change. Retrieval dates describe when documentation was reviewed, not when an account was tested or a provider policy became effective. Source-confirmed means supported by the cited documentation; it is not independent provider certification.

## GitHub

| Claim checked | Finding | Evidence |
| --- | --- | --- |
| OAuth registration versus GitHub Apps | Confirmed: these are distinct app types. GitHub recommends considering GitHub Apps for granular repository access and independent app identity. | [Creating an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) |
| Callback count | Corrected a stale assumption: current registration supports up to **10 callback URLs**, rather than one. | [Registration](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) |
| Access-token lifecycle | Corrected a stale assumption: registration enables expiring user tokens by default. The authorization guide documents refresh-token support and eight-hour access tokens. | [Authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) |
| CSRF and PKCE | Confirmed: current authorization docs recommend unpredictable state and S256 PKCE. A mismatched state must abort the flow. | [Web application flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) |
| Organization access | Confirmed: restricted organizations need owner approval. Personal authorization does not guarantee organization access. | [Approving OAuth apps](https://docs.github.com/en/organizations/managing-oauth-access-to-your-organizations-data/approving-oauth-apps-for-your-organization) |
| Approval delay | Not verified: no universal organization-owner turnaround. We do not translate a successful personal authorization into a public distribution approval. | [Organization approval](https://docs.github.com/en/organizations/managing-oauth-access-to-your-organizations-data/approving-oauth-apps-for-your-organization) |

No GitHub OAuth app was created. Callback behavior, private repository access, and refresh were not executed. The guide's registration effort is an author estimate assuming an existing callback implementation.

## Slack

| Claim checked | Finding | Evidence |
| --- | --- | --- |
| OAuth installation | Confirmed: bot permissions use `scope`; user permissions use `user_scope`. Sign in with Slack scopes require a separate flow. | [Installing with OAuth](https://docs.slack.dev/authentication/installing-with-oauth/) |
| Redirect requirement | Confirmed: HTTPS is required. If sent when authorizing, the same redirect URI must be sent in the code exchange. | [OAuth redirects](https://docs.slack.dev/authentication/installing-with-oauth/) |
| Distribution | Corrected a dangerous shortcut: unlisted distribution is suitable for pilots, not a way around commercial Marketplace requirements. | [App lifecycle and distribution](https://docs.slack.dev/app-management/distribution/), [Terms update](https://docs.slack.dev/changelog/2025/05/29/tos-updates) |
| Review timing | Confirmed as published guidance, not a guarantee: preliminary feedback up to **10 business days**, functional review up to **10 weeks** for new submissions or **6 weeks** for updates. Resubmission can restart a queue. | [Marketplace review](https://docs.slack.dev/slack-marketplace/slack-marketplace-review-guide/) |
| Eligibility | The live November 2, 2026 changelog updates low-usage screening to fewer than 10 active workspaces **and** fewer than 20 monthly active users, with a 30-day resubmission block. September guidance also requires at least 10 active installations throughout review. Check the submission console for current eligibility. | [Current changelog](https://docs.slack.dev/changelog/), [Submission requirements](https://docs.slack.dev/slack-marketplace/slack-marketplace-app-guidelines-and-requirements/) |
| Product fit | Confirmed: Marketplace excludes, among other use cases, LLM training with Slack data and MCP-only products lacking meaningful functionality in Slack. An agent integration can be technically valid yet unsuitable for listing. | [Marketplace requirements](https://docs.slack.dev/slack-marketplace/slack-marketplace-app-guidelines-and-requirements/) |

No workspace installation or Marketplace submission was attempted. We have not tested the app's scopes against a workspace administrator's policy. A working `auth.test` response is a recommended developer test, not an observed result. This method checks identity; it does not prove all requested business features work. See [auth.test](https://docs.slack.dev/reference/methods/auth.test/).

## Google

| Claim checked | Finding | Evidence |
| --- | --- | --- |
| Cloud setup | Confirmed: configure Branding, Audience, and Data Access, then create credentials for the relevant application type. | [Configure consent and scopes](https://developers.google.com/workspace/guides/configure-oauth-consent), [OAuth overview](https://developers.google.com/identity/protocols/oauth2) |
| Redirect matching | Confirmed: scheme, case, and trailing slash must match an authorized URI exactly. Localhost is exempt from the production HTTPS rule. | [Web server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server) |
| Testing | Corrected a blanket claim: external testing generally uses an allowlist capped at 100 testers, but basic identity-only `openid`, `email`, `profile` requests have an exception. Internal apps are a separate configuration. | [OAuth app state](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview) |
| Restricted scopes | Confirmed: broader review applies; server access to restricted data can require a third-party security assessment unless an exception applies. | [Restricted-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification) |
| Review submission | Confirmed: prepare scope justification, publicly accessible app and privacy pages, verified domains, and a demonstration video showing requested permissions in use. | [Sensitive-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification) |
| Timing conflict | Not resolved: the brand-verification page summary says typically 2–3 business days, while the sensitive-scope submission procedure describes an automated branding evaluation usually taking minutes. Neither is an app-specific commitment or scope-approval SLA. The guide intentionally labels total approval delay unknown. | [Brand verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification), [Sensitive-scope procedure](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification) |
| Admin controls | Confirmed: Google Workspace administrators can block a verified app. Verification is not universal tenant authorization. | [Administrative overrides](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview) |

No Cloud project, OAuth client, consent, token refresh, assessment, or verification submission was performed. Required scope classification and assessment applicability depend on the developer's actual product. The hands-on estimate excludes assessment, implementation, legal-policy authoring, and provider wait.

## What AuthPilot actually automates

The research agent discovers documentation, calls real web retrieval, structures findings, validates source references and output shape, and saves a shareable guide. It does not sign in to provider accounts, create OAuth apps, hold client secrets, consent to permissions, perform token exchanges, submit a review, or promise approval. Every seed and generated guide must preserve this boundary.

## Revalidation

Before launching, revisit the linked official sources and the provider console, confirm the exact app type, scopes, audience, redirect URLs, and distribution model, then execute the guide's tests with a dedicated test account. Provider approval remains the provider's decision. Unknowns are part of the deliverable, not gaps to fill with plausible claims.
