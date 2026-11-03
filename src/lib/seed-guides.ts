import {
  guideSchema,
  validateGuideEvidence,
  type Claim,
  type Guide,
  type SectionId,
  type Source,
} from "./schema";

// These are documentation-reviewed guides. No provider account or OAuth flow was executed.
const reviewedAt = "2026-11-03T11:44:54.000Z";
const confirmed = (text: string, ...sourceIds: string[]): Claim => ({
  text,
  status: "source-confirmed",
  sourceIds,
});
const estimate = (text: string): Claim => ({
  text,
  status: "estimate",
  sourceIds: [],
});
const unknown = (text: string, ...sourceIds: string[]): Claim => ({
  text,
  status: "unknown",
  sourceIds,
});
const source = (
  id: string,
  title: string,
  url: string,
  publisher: string,
  excerpt: string,
): Source => ({ id, title, url, publisher, excerpt, retrievedAt: reviewedAt });
const section = (
  id: SectionId,
  title: string,
  summary: string,
  ...claims: Claim[]
) => ({ id, title, summary, claims });
const step = (
  id: string,
  title: string,
  description: string,
  sectionId: SectionId,
  actor: "developer" | "agent" | "provider" = "developer",
) => ({ id, title, description, sectionId, actor });
const automation = {
  canDo: [
    "Find official documentation and summarize supported requirements.",
    "Organize sources, flag unknowns, and prepare a shareable setup checklist.",
    "Suggest tests and review materials for the developer to execute.",
  ],
  requiresHuman: [
    "Sign in to the provider and create the OAuth app.",
    "Choose scopes and redirect URLs that match the product.",
    "Store credentials securely, implement callbacks, and run account-based tests.",
    "Provide legal policies, consent to permissions, and submit any provider review.",
  ],
  neverDoes: [
    "Collect or store provider client secrets or user access tokens.",
    "Claim an OAuth app was registered, tested, or approved without evidence.",
    "Approve permissions or bypass provider and organization policies.",
  ],
};

const github: Guide = {
  id: "github",
  provider: "GitHub",
  website: "https://github.com",
  category: "Developer tools",
  description:
    "Connect a user's GitHub account. Registration is direct; organization policies and the choice between an OAuth App and GitHub App deserve attention before you build.",
  oauthSupport: "supported",
  difficulty: "Straightforward",
  origin: "curated",
  createdAt: reviewedAt,
  updatedAt: reviewedAt,
  effort: estimate(
    "20–40 minutes for registration and a first test, assuming a working callback. AuthPilot estimate; implementation and organization review excluded.",
  ),
  approval: unknown(
    "Organization approval depends on each owner. No universal turnaround was established; Marketplace listing is a separate path.",
    "gh-org",
  ),
  sources: [
    source(
      "gh-create",
      "Creating an OAuth app",
      "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app",
      "GitHub Docs",
      "You can enter up to 10 callback URLs.",
    ),
    source(
      "gh-auth",
      "Authorizing OAuth apps",
      "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps",
      "GitHub Docs",
      "If the states don't match, then a third party created the request, and you should abort the process.",
    ),
    source(
      "gh-scopes",
      "Scopes for OAuth apps",
      "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps",
      "GitHub Docs",
      "They do not grant any additional permission beyond that which the user already has.",
    ),
    source(
      "gh-org",
      "Approving OAuth apps for your organization",
      "https://docs.github.com/en/organizations/managing-oauth-access-to-your-organizations-data/approving-oauth-apps-for-your-organization",
      "GitHub Docs",
      "Organization owners can approve or deny the request.",
    ),
    source(
      "gh-user",
      "Get the authenticated user",
      "https://docs.github.com/en/rest/users/users#get-the-authenticated-user",
      "GitHub Docs",
      "Tokens without these scopes receive the public user response.",
    ),
    source(
      "gh-user-auth",
      "Authorizing OAuth apps: organization access",
      "https://docs.github.com/en/apps/oauth-apps/using-oauth-apps/authorizing-oauth-apps",
      "GitHub Docs",
      "You must verify your email address before you can authorize an OAuth app.",
    ),
  ],
  sections: [
    section(
      "prerequisites",
      "Before you start",
      "Choose the app model before creating credentials.",
      confirmed(
        "Use a personal account or an organization where you have administrative access. Keep the app's public details free of internal information.",
        "gh-create",
      ),
      confirmed(
        "GitHub recommends considering a GitHub App for granular repository permissions and an app identity that can operate independently of a user.",
        "gh-create",
      ),
    ),
    section(
      "registration",
      "Register your OAuth app",
      "Open GitHub Settings → Developer settings → OAuth apps → New OAuth App.",
      confirmed(
        "Provide the application name, homepage, and authorization callback URL, then register. The current form supports up to 10 callback URLs.",
        "gh-create",
      ),
      confirmed(
        "Expiring user access tokens are enabled by default. Ensure your integration supports refresh before relying on this setting.",
        "gh-create",
      ),
    ),
    section(
      "scopes",
      "Choose the least access",
      "Map each product feature to the permissions it needs.",
      confirmed(
        "Request minimal OAuth scopes. Scopes limit a token's access; they do not extend the user's own permissions. Avoid broad repo access for a basic sign-in feature.",
        "gh-scopes",
      ),
      confirmed(
        "The authenticated-user endpoint can return a public profile without read:user; private profile fields need read:user or broader user permission.",
        "gh-user",
      ),
    ),
    section(
      "redirects",
      "Configure the callback",
      "Use the exact callback your application actually handles.",
      confirmed(
        "Check the configured callback and redirect matching behavior. Use unpredictable state and S256 PKCE; abort when the returned state differs.",
        "gh-auth",
      ),
      estimate(
        "Keep development and production callbacks explicit. Example only: https://your-app.example/api/auth/callback/github. Replace it with your application's route.",
      ),
    ),
    section(
      "credentials",
      "Keep credentials on the server",
      "Your app registration identifies your integration; users authorize their own connections later.",
      confirmed(
        "The authorization-code exchange uses the app's client ID and client secret. Expiring access tokens are documented with an eight-hour lifetime and refresh support.",
        "gh-auth",
      ),
      estimate(
        "Store the client secret in server environment variables or a secret manager. Never paste credentials into AuthPilot or expose them in browser code.",
      ),
    ),
    section(
      "testing",
      "Verify a real connection",
      "Run these tests yourself with a dedicated account.",
      confirmed(
        "After authorization, call GET https://api.github.com/user with the access token and inspect the returned identity and scope-dependent fields.",
        "gh-user",
      ),
      estimate(
        "Test consent denial, invalid state, refresh, and revocation. Then test organization access separately. These are proposed checks; AuthPilot has not run them.",
      ),
    ),
    section(
      "review",
      "Understand approval boundaries",
      "Personal consent and organization approval solve different problems.",
      confirmed(
        "An organization with OAuth access restrictions requires owner approval before your integration can access its protected resources.",
        "gh-org",
      ),
      unknown(
        "The owner's decision time and your organization's policy are unknown. Ask the owner early and keep a personal-account test path available.",
        "gh-org",
      ),
    ),
    section(
      "distribution",
      "Plan user and organization access",
      "Each user connects through your app's authorization flow.",
      confirmed(
        "A user's personal authorization does not override organization restrictions. SAML-protected organizations may require an active SAML session during authorization.",
        "gh-user-auth",
      ),
      unknown(
        "This guide does not establish eligibility or approval for a GitHub Marketplace listing. Research that separate distribution route if required.",
      ),
    ),
    section(
      "troubleshooting",
      "Unblock the common failures",
      "Start with identity, callback configuration, then organization policy.",
      confirmed(
        "If organization data is missing, check OAuth app approval and the user's active SAML session. Verify the user's email before authorization.",
        "gh-user-auth",
      ),
      estimate(
        "For callback or token errors, compare the deployed route and app configuration, reject reused codes, and inspect server logs with tokens and secrets redacted.",
      ),
    ),
  ],
  checklist: [
    step(
      "gh-model",
      "Choose OAuth App or GitHub App",
      "Confirm whether user-wide OAuth scopes fit the product or a granular GitHub App is more appropriate.",
      "prerequisites",
    ),
    step(
      "gh-register",
      "Register the OAuth app",
      "Sign in at github.com/settings/developers and enter the public app information.",
      "registration",
    ),
    step(
      "gh-scope",
      "Document the minimum scopes",
      "Map every requested scope to a real feature; avoid broad repository access for sign-in.",
      "scopes",
    ),
    step(
      "gh-callback",
      "Register and implement the callback",
      "Configure explicit URLs, state validation, and PKCE in your integration.",
      "redirects",
    ),
    step(
      "gh-secret",
      "Store the client secret securely",
      "Set server-side credentials and verify the refresh-token lifecycle.",
      "credentials",
    ),
    step(
      "gh-test",
      "Test authorization and identity",
      "Connect a test account, inspect GET /user, then test denial, refresh, and revocation.",
      "testing",
    ),
    step(
      "gh-request",
      "Request organization approval if needed",
      "Ask an organization owner to review the OAuth app's access request.",
      "review",
    ),
    step(
      "gh-owner",
      "Confirm the organization's decision",
      "The organization owner must decide whether the requested access is permitted; AuthPilot cannot approve it.",
      "review",
    ),
  ],
  blockers: [
    confirmed(
      "Organization-owner approval can block access even after personal authorization succeeds.",
      "gh-org",
    ),
    unknown(
      "Repository access needs and Marketplace requirements depend on your distribution model.",
    ),
  ],
  automation,
  warnings: [
    "Documentation reviewed; no app registration, token exchange, or organization approval was attempted.",
    "Current GitHub callback and expiring-token behavior differs from older tutorials.",
  ],
};

const slack: Guide = {
  id: "slack",
  provider: "Slack",
  website: "https://slack.com",
  category: "Communication",
  description:
    "Install a Slack app into a workspace, then plan the route from an internal pilot to commercial distribution. Marketplace eligibility can be the longest part of the journey.",
  oauthSupport: "supported",
  difficulty: "Involved",
  origin: "curated",
  createdAt: reviewedAt,
  updatedAt: reviewedAt,
  effort: estimate(
    "45–90 minutes for app configuration and one workspace test, assuming an existing OAuth handler. Review preparation and product implementation excluded.",
  ),
  approval: confirmed(
    "Slack publishes up to 10 business days for preliminary feedback, then up to 10 weeks for new-app functional review. Variable guidance, not a guarantee.",
    "sl-review",
  ),
  sources: [
    source(
      "sl-oauth",
      "Installing via OAuth authorization code flow",
      "https://docs.slack.dev/authentication/installing-with-oauth/",
      "Slack Developer Docs",
      "The redirect_uri must use HTTPS.",
    ),
    source(
      "sl-distribution",
      "App lifecycle and distribution",
      "https://docs.slack.dev/app-management/distribution/",
      "Slack Developer Docs",
      "Apps intended for commercial distribution should be submitted and approved for listing in the Slack Marketplace.",
    ),
    source(
      "sl-review",
      "Slack Marketplace review process",
      "https://docs.slack.dev/slack-marketplace/slack-marketplace-review-guide/",
      "Slack Developer Docs",
      "Our review turnaround time can vary depending on volume.",
    ),
    source(
      "sl-guidelines",
      "Marketplace submission requirements",
      "https://docs.slack.dev/slack-marketplace/slack-marketplace-app-guidelines-and-requirements/",
      "Slack Developer Docs",
      "Not every app may be the right fit for the Slack Marketplace.",
    ),
    source(
      "sl-changelog",
      "Current Slack platform changes",
      "https://docs.slack.dev/changelog/",
      "Slack Developer Docs",
      "Your app needs to stay at 10 or more installed workspaces throughout the entire duration of the review.",
    ),
    source(
      "sl-terms",
      "API Terms of Service updates",
      "https://docs.slack.dev/changelog/2025/05/29/tos-updates",
      "Slack Developer Docs",
      "The Slack Marketplace is the only appropriate channel for commercially distributing apps built with Slack APIs.",
    ),
    source(
      "sl-test",
      "auth.test method",
      "https://docs.slack.dev/reference/methods/auth.test/",
      "Slack Developer Docs",
      "You can also use this method to test whether Slack API authentication is functional.",
    ),
    source(
      "sl-quickstart",
      "Creating a Slack app",
      "https://docs.slack.dev/quickstart/",
      "Slack Developer Docs",
      "If you don't have a Slack workspace already, we recommend also setting up a developer sandbox.",
    ),
  ],
  sections: [
    section(
      "prerequisites",
      "Choose your workspace and audience",
      "Start in a development workspace where you can install apps.",
      confirmed(
        "A developer sandbox is recommended if you do not have a suitable workspace. Authenticate as a developer with permission to create and install the app.",
        "sl-quickstart",
      ),
      confirmed(
        "A new app starts in its associated workspace. Additional workspaces require an OAuth installation flow.",
        "sl-distribution",
      ),
    ),
    section(
      "registration",
      "Create the Slack app",
      "Use Slack app management or the documented Slack CLI workflow.",
      confirmed(
        "Create an app for the development workspace. Slack's quickstart supports Slack CLI with Bolt for JavaScript or Python.",
        "sl-quickstart",
      ),
      confirmed(
        "Find the client ID in App Management. Configure OAuth & Permissions before building the installation link.",
        "sl-oauth",
      ),
    ),
    section(
      "scopes",
      "Separate bot and user access",
      "Choose permissions from the actual product behavior.",
      confirmed(
        "Use scope for bot permissions and user_scope for user permissions. Sign in with Slack scopes must be requested in a separate OAuth flow.",
        "sl-oauth",
      ),
      confirmed(
        "Marketplace reviewers evaluate whether requested scopes fit the app's functionality. Excessive data access and some product types are unsuitable.",
        "sl-guidelines",
      ),
    ),
    section(
      "redirects",
      "Register an HTTPS callback",
      "Use one consistent URI throughout installation.",
      confirmed(
        "Register an HTTPS redirect under OAuth & Permissions. If redirect_uri is sent in the authorization request, send the same value in the token exchange.",
        "sl-oauth",
      ),
      estimate(
        "For local development, use a controlled HTTPS tunnel. Example only: https://your-app.example/api/auth/callback/slack. Never send a real secret through an untrusted tunnel.",
      ),
    ),
    section(
      "credentials",
      "Store each installation safely",
      "A workspace token belongs to a particular installation.",
      confirmed(
        "Exchange the temporary authorization code with your app's client secret at oauth.v2.access. Slack returns installation access information.",
        "sl-oauth",
      ),
      estimate(
        "Keep client secrets and tokens server-side, bind installations to the correct workspace/user, and redact credentials in logs. AuthPilot never requests these values.",
      ),
    ),
    section(
      "testing",
      "Test installation and identity",
      "Verify the real workspace, then the product feature.",
      confirmed(
        "Call POST https://slack.com/api/auth.test with the obtained token and inspect ok, team_id, and identity. This confirms authentication, not every business permission.",
        "sl-test",
      ),
      estimate(
        "Also test denied consent, state validation, reinstall, missing permissions, and uninstall. No workspace installation or API call has been executed by AuthPilot.",
      ),
    ),
    section(
      "review",
      "Prepare for Marketplace review",
      "Evaluate eligibility before promising a launch date.",
      confirmed(
        "Provide a working product, installation access for reviewers, and a demonstration of OAuth and end-to-end behavior. Preliminary and functional reviews are separate stages.",
        "sl-review",
      ),
      confirmed(
        "Current guidance requires 10 active workspace installations throughout review. The November 2 update defines low usage using fewer than 10 active workspaces and fewer than 20 monthly active users; inspect your submission console.",
        "sl-changelog",
      ),
      unknown(
        "Your submission's eligibility, feedback cycles, and actual queue time remain unknown. Published times can change.",
        "sl-review",
      ),
    ),
    section(
      "distribution",
      "Distinguish pilots from commercial launch",
      "Public distribution is a capability, not a review exemption.",
      confirmed(
        "Enable unlisted distribution through Manage Distribution after its checklist is complete. This suits development and early pilots.",
        "sl-distribution",
      ),
      confirmed(
        "Commercial distribution belongs in the Slack Marketplace. An unlisted app or templated custom app does not bypass these terms.",
        "sl-terms",
      ),
    ),
    section(
      "troubleshooting",
      "Resolve installation and review blockers",
      "First identify which approval is missing.",
      confirmed(
        "For bad_redirect_uri, compare the authorization and exchange URI. Do not combine Sign in with Slack scopes with ordinary app scopes.",
        "sl-oauth",
      ),
      confirmed(
        "Marketplace product-fit restrictions include Slack-data LLM training and MCP-only products without meaningful functionality inside Slack.",
        "sl-guidelines",
      ),
      unknown(
        "A workspace administrator can impose additional controls; your actual workspace policy has not been inspected.",
      ),
    ),
  ],
  checklist: [
    step(
      "sl-workspace",
      "Choose a development workspace",
      "Confirm you can create and install apps, or create a developer sandbox.",
      "prerequisites",
    ),
    step(
      "sl-register",
      "Create the Slack app",
      "Open api.slack.com/apps or use Slack's documented CLI setup.",
      "registration",
    ),
    step(
      "sl-scope",
      "Choose bot and user scopes",
      "Map scopes to features and keep Sign in with Slack in its own flow.",
      "scopes",
    ),
    step(
      "sl-redirect",
      "Configure the HTTPS callback",
      "Register the redirect and use the same URI when exchanging the code.",
      "redirects",
    ),
    step(
      "sl-test",
      "Install and verify a test workspace",
      "Run auth.test with the installation token and test the actual app feature.",
      "testing",
    ),
    step(
      "sl-pilot",
      "Enable pilot distribution",
      "Complete Manage Distribution; collect feedback and confirm commercial listing obligations.",
      "distribution",
    ),
    step(
      "sl-materials",
      "Check eligibility and prepare review",
      "Verify current usage requirements, provide privacy/support materials, and record the OAuth demo.",
      "review",
    ),
    step(
      "sl-submit",
      "Submit and address reviewer feedback",
      "The developer submits; Slack decides approval. Track review status in app settings.",
      "review",
    ),
    step(
      "sl-approval",
      "Receive Slack's decision",
      "Review and queue times depend on Slack; no approval is guaranteed.",
      "review",
      "provider",
    ),
  ],
  blockers: [
    confirmed(
      "Commercial launch requires the Marketplace distribution path; a successful workspace test is not listing approval.",
      "sl-terms",
    ),
    confirmed(
      "Insufficient active installations, unsuitable use cases, or unjustified scopes can prevent review.",
      "sl-guidelines",
      "sl-changelog",
    ),
  ],
  automation,
  warnings: [
    "Documentation reviewed; no workspace was installed and no Marketplace review was submitted.",
    "Slack eligibility changed in 2026. Recheck the live submission console before planning your launch.",
  ],
};

const google: Guide = {
  id: "google",
  provider: "Google",
  website: "https://developers.google.com",
  category: "Productivity",
  description:
    "Configure a Google OAuth client and consent experience. Basic sign-in, internal tools, and apps accessing sensitive user data follow different verification paths.",
  oauthSupport: "supported",
  difficulty: "Moderate",
  origin: "curated",
  createdAt: reviewedAt,
  updatedAt: reviewedAt,
  effort: estimate(
    "45–90 minutes for consent and client configuration with a working callback. Verification materials, implementation, legal work, and assessment excluded.",
  ),
  approval: unknown(
    "Scope review and any security assessment depend on the app. Official branding timing descriptions differ; no reliable total approval delay is established.",
    "go-brand",
    "go-sensitive",
  ),
  sources: [
    source(
      "go-config",
      "Configure consent and choose scopes",
      "https://developers.google.com/workspace/guides/configure-oauth-consent",
      "Google for Developers",
      "All apps using OAuth 2.0 require a consent screen configuration.",
    ),
    source(
      "go-oauth",
      "Using OAuth 2.0 to access Google APIs",
      "https://developers.google.com/identity/protocols/oauth2",
      "Google for Developers",
      "You must create an OAuth client appropriate for the platform on which your app will run.",
    ),
    source(
      "go-web",
      "OAuth 2.0 for web server applications",
      "https://developers.google.com/identity/protocols/oauth2/web-server",
      "Google for Developers",
      "The value must exactly match one of the authorized redirect URIs for the OAuth 2.0 client.",
    ),
    source(
      "go-state",
      "OAuth app state overview",
      "https://developers.google.com/identity/protocols/oauth2/production-readiness/overview",
      "Google for Developers",
      "Google Workspace administrators can always Block any OAuth app.",
    ),
    source(
      "go-sensitive",
      "Sensitive-scope verification",
      "https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification",
      "Google for Developers",
      "Prepare a detailed justification for each requested sensitive scope.",
    ),
    source(
      "go-restricted",
      "Restricted-scope verification",
      "https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification",
      "Google for Developers",
      "If you store or transmit restricted scope data on servers, then you need to complete a security assessment.",
    ),
    source(
      "go-brand",
      "Submit for brand verification",
      "https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification",
      "Google for Developers",
      "The brand verification process typically takes 2-3 business days after submission.",
    ),
  ],
  sections: [
    section(
      "prerequisites",
      "Define the audience and data",
      "Decide whether you need sign-in, API access, or both.",
      confirmed(
        "Choose a Google Cloud project and the OAuth client type that matches your application. Web-server and native clients have different configuration requirements.",
        "go-oauth",
      ),
      confirmed(
        "Configure Branding, Audience, and Data Access. Internal apps serve the organization; an external testing app is a different audience configuration.",
        "go-config",
        "go-state",
      ),
    ),
    section(
      "registration",
      "Configure the consent experience",
      "Open Google Cloud → Google Auth Platform for your project.",
      confirmed(
        "Enter the app's branding, contact information, audience, and required scopes. Create the OAuth client for your platform after configuring consent.",
        "go-config",
        "go-oauth",
      ),
      unknown(
        "The IAM permissions and organization policies of your project have not been inspected. Ask a project administrator if the console prevents configuration.",
      ),
    ),
    section(
      "scopes",
      "Classify every permission",
      "Review scope classification in the console for the actual API.",
      confirmed(
        "Sensitive and restricted scopes can require verification unless an exception applies. Request the narrowest scope compatible with the feature.",
        "go-sensitive",
        "go-restricted",
      ),
      confirmed(
        "Basic identity-only openid, email, and profile have an exception to the external testing allowlist requirement. Do not apply that exception to broader data access.",
        "go-state",
      ),
    ),
    section(
      "redirects",
      "Match the registered URL exactly",
      "Treat development and production URLs as explicit configuration.",
      confirmed(
        "The scheme, case, and trailing slash must match an authorized redirect URI. Production callbacks use HTTPS; localhost has an exception.",
        "go-web",
      ),
      estimate(
        "Example only: https://your-app.example/api/auth/callback/google. Replace it with your handler and verify state before exchanging a code.",
      ),
    ),
    section(
      "credentials",
      "Create and protect the client",
      "Keep the web-server client's secret outside the browser.",
      confirmed(
        "Obtain the client ID and credentials for the selected application type. A web-server application uses a secret; not all client types do.",
        "go-oauth",
      ),
      confirmed(
        "Request access_type=offline when refresh is needed; a refresh token is normally returned on the first qualifying authorization.",
        "go-web",
      ),
      estimate(
        "Store credentials in server environment variables. Never upload client credentials or access tokens to AuthPilot.",
      ),
    ),
    section(
      "testing",
      "Verify audience and token behavior",
      "Use a dedicated test user and check actual granted access.",
      confirmed(
        "External testing generally allows up to 100 listed testers. Refresh tokens expire in seven days unless only basic identity scopes are requested; identity-only access also has an allowlist exception.",
        "go-state",
        "go-oauth",
      ),
      estimate(
        "Run consent, denial, invalid state, exact callback, API permission, refresh, and revocation tests. No consent or token exchange has been executed for this guide.",
      ),
    ),
    section(
      "review",
      "Prepare evidence for verification",
      "Separate branding review from approval for data access.",
      confirmed(
        "For sensitive scopes, prepare justification, domain ownership, a public homepage and privacy policy, and a demonstration of the consent flow and each scope's feature.",
        "go-sensitive",
      ),
      confirmed(
        "Restricted data accessed through a server can add a security assessment requirement unless an exception applies. Confirm permitted use before building around the scope.",
        "go-restricted",
      ),
      unknown(
        "Google describes branding evaluation as automated in one procedure and typically 2–3 business days on its brand page. Neither establishes total scope-review time.",
        "go-sensitive",
        "go-brand",
      ),
    ),
    section(
      "distribution",
      "Publish for the right audience",
      "Production status and verification are distinct.",
      confirmed(
        "Public apps requesting sensitive or restricted scopes require the appropriate verification. Publishing alone does not remove unverified-app warnings and applicable caps.",
        "go-state",
      ),
      confirmed(
        "Workspace administrators retain authority to block even verified apps. Internal access and domain trust do not automatically extend to external customers.",
        "go-state",
      ),
    ),
    section(
      "troubleshooting",
      "Separate configuration from policy errors",
      "Use the error and project configuration to locate the blocker.",
      confirmed(
        "For redirect_uri_mismatch, compare the full authorized URL including scheme and trailing slash. Check offline access settings when investigating missing refresh tokens.",
        "go-web",
      ),
      estimate(
        "For access denial, verify the selected account, audience, test-user membership, declared scopes, and organization controls. Redact secrets and tokens in diagnostic logs.",
      ),
    ),
  ],
  checklist: [
    step(
      "go-audience",
      "Choose project, audience, and app type",
      "Confirm internal versus external users and the actual Google APIs needed.",
      "prerequisites",
    ),
    step(
      "go-consent",
      "Configure Branding and Data Access",
      "Enter accurate contacts and app links; declare the least-privilege scopes.",
      "registration",
    ),
    step(
      "go-client",
      "Create the OAuth client",
      "Use a web application client for a web-server integration and keep credentials server-side.",
      "credentials",
    ),
    step(
      "go-callback",
      "Register exact redirect URLs",
      "Ensure your application sends the same URL, including its scheme and trailing slash.",
      "redirects",
    ),
    step(
      "go-test",
      "Run a test-user authorization",
      "Check consent, identity, API access, refresh, denial, and revocation with an appropriate test account.",
      "testing",
    ),
    step(
      "go-assess",
      "Check verification and assessment needs",
      "Inspect scope classification and applicable exceptions before setting a launch date.",
      "review",
    ),
    step(
      "go-materials",
      "Prepare and submit review evidence",
      "Verify domains, publish policies, justify scopes, and record the requested demonstration.",
      "review",
    ),
    step(
      "go-review",
      "Respond to Google's review",
      "Google decides approval and may request changes or a security assessment.",
      "review",
      "provider",
    ),
    step(
      "go-publish",
      "Publish and test a customer tenant",
      "Check production consent and an external Workspace's admin policy.",
      "distribution",
    ),
  ],
  blockers: [
    confirmed(
      "Restricted-scope use can add a security assessment and eligibility requirements.",
      "go-restricted",
    ),
    confirmed(
      "A verified app may still be blocked by a customer's Workspace administrator.",
      "go-state",
    ),
    unknown(
      "Exact review duration and scope classification depend on the implementation.",
    ),
  ],
  automation,
  warnings: [
    "Documentation reviewed; no Cloud project, OAuth client, token exchange, or verification submission was created.",
    "Basic sign-in and sensitive Google API access have different requirements. Choose scopes before estimating the launch path.",
  ],
};

export const seedGuides: Guide[] = [github, slack, google].map((guide) => {
  const parsed = guideSchema.parse(guide);
  validateGuideEvidence(parsed);
  return parsed;
});
