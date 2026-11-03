import type { NextConfig } from "next";
import { assessDeploymentEnvironment } from "./src/lib/server/deployment-config";
if (!assessDeploymentEnvironment(process.env).serverSecretsSafe)
  throw new Error(
    "Server credentials must not use NEXT_PUBLIC_ environment-variable names. Remove the public credential variables before building or starting AuthPilot.",
  );
const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@libsql/client"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
