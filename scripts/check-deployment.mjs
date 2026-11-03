// Deliberately makes no network calls and prints no environment values.
import { createRequire } from "node:module";
import { assessDeploymentEnvironment } from "../src/lib/server/deployment-config.ts";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const expectedHosted = process.argv.includes("--vercel");
const status = assessDeploymentEnvironment({
  ...process.env,
  ...(expectedHosted ? { VERCEL: "1" } : {}),
});
console.log(
  JSON.stringify(
    {
      ...status,
      target: expectedHosted ? "vercel-configuration" : "current-environment",
      researchTimeoutSeconds: 270,
      requiredFunctionDurationSeconds: 300,
      note: "Presence and syntax checks only. API/model access, remote database connectivity, function settings, and deployed persistence require manual verification after an authorized deployment.",
    },
    null,
    2,
  ),
);
if (!status.researchReady) process.exitCode = 1;
