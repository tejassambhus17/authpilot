// npm itself may run on an older system Node. Launch the actual tool on a
// supported runtime, including the Node subprocesses created by that tool.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = fileURLToPath(new URL("..", import.meta.url));
const localRuntime = path.join(
  workspace,
  ".runtime",
  process.platform === "win32" ? "node.exe" : "node",
);

function supported(version) {
  const [major, minor] = version.replace(/^v/, "").split(".").map(Number);
  return major > 22 || (major === 22 && minor >= 12);
}

function fail(message) {
  console.error(
    `AuthPilot: ${message}\n` +
      "Use Node.js 22.12+ (Node 24 recommended), or set " +
      "AUTHPILOT_NODE_BINARY to a supported Node executable. " +
      "Run npm run runtime to check the selected version.",
  );
  process.exit(1);
}

const override = process.env.AUTHPILOT_NODE_BINARY;
let executable = process.execPath;
if (override) executable = path.resolve(workspace, override);
else if (!supported(process.versions.node)) {
  if (!existsSync(localRuntime))
    fail(`this shell uses unsupported Node ${process.versions.node}.`);
  executable = localRuntime;
}

if (executable !== process.execPath) {
  const probe = spawnSync(executable, ["--version"], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (probe.error || probe.status !== 0 || !supported(probe.stdout.trim()))
    fail("the selected Node executable is unavailable or unsupported.");
}

const args = process.argv.slice(2);
if (!args.length) fail("a tool or Node argument is required.");

const child = spawnSync(executable, args, {
  cwd: workspace,
  stdio: "inherit",
  windowsHide: true,
  env: {
    ...process.env,
    PATH: `${path.dirname(executable)}${path.delimiter}${process.env.PATH || ""}`,
    NODE: executable,
    npm_node_execpath: executable,
  },
});

if (child.error) fail("the requested tool could not be started.");
process.exit(child.status ?? (child.signal === "SIGINT" ? 130 : 1));
