// Shared by server configuration and the local readiness CLI. Return only
// booleans and fixed issue codes: never return a credential or database URL.
export type DeploymentEnvironment = Record<string, string | undefined>;

export const RESEARCH_TIMEOUT_MS = 270_000;

function present(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function validRemoteDatabaseUrl(value: string | undefined): boolean {
  if (!value || value !== value.trim()) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    return (
      ["libsql:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.hash &&
      !url.search &&
      (url.pathname === "" || url.pathname === "/") &&
      host.includes(".") &&
      !host.includes(":") &&
      !/^\d+\.\d+\.\d+\.\d+$/.test(host) &&
      !["localhost", "local", "internal", "localdomain"].some(
        (suffix) => host === suffix || host.endsWith(`.${suffix}`),
      )
    );
  } catch {
    return false;
  }
}

export function assessDeploymentEnvironment(env: DeploymentEnvironment) {
  const hosted = Boolean(env.VERCEL);
  const apiKeyConfigured = present(env.OPENAI_API_KEY);
  const databaseUrlPresent = present(env.TURSO_DATABASE_URL);
  const databaseTokenPresent = present(env.TURSO_AUTH_TOKEN);
  const remoteDatabaseConfigured =
    databaseUrlPresent &&
    databaseTokenPresent &&
    validRemoteDatabaseUrl(env.TURSO_DATABASE_URL);
  const publicSecretConfigured = Object.entries(env).some(
    ([name, value]) =>
      /^NEXT_PUBLIC_(?:OPENAI_API_KEY|TURSO_AUTH_TOKEN|RESEARCH_ACCESS_TOKEN|.*CLIENT_SECRET)$/i.test(
        name,
      ) && present(value),
  );
  const persistenceConfigured =
    remoteDatabaseConfigured ||
    (!hosted && !databaseUrlPresent && !databaseTokenPresent);
  const issues: string[] = [];
  if (!apiKeyConfigured) issues.push("API_KEY_MISSING");
  if (!persistenceConfigured) issues.push("DATABASE_NOT_CONFIGURED");
  if (publicSecretConfigured) issues.push("PUBLIC_SECRET_CONFIGURED");
  const accessTokenRequired = present(env.RESEARCH_ACCESS_TOKEN);
  return {
    hosted,
    apiKeyConfigured,
    persistenceConfigured,
    persistenceMode: remoteDatabaseConfigured
      ? ("remote" as const)
      : persistenceConfigured
        ? ("local" as const)
        : ("unconfigured" as const),
    serverSecretsSafe: !publicSecretConfigured,
    accessTokenRequired,
    researchReady:
      apiKeyConfigured && persistenceConfigured && !publicSecretConfigured,
    // Syntax/presence checks cannot establish remote connectivity or model access.
    connectivityVerified: false as const,
    issues,
    warnings: !accessTokenRequired
      ? ["RESEARCH_SPENDING_GATE_NOT_CONFIGURED"]
      : [],
  };
}
