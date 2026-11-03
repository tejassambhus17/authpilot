import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workspace = path.resolve(import.meta.dirname, "..");
const launcher = path.join(workspace, "scripts", "run-with-node.mjs");

function launch(args: string[], binary = process.execPath) {
  return spawnSync(process.execPath, [launcher, ...args], {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, AUTHPILOT_NODE_BINARY: binary },
    windowsHide: true,
  });
}

describe("project runtime launcher", () => {
  it("loads the real PostCSS plugin and gives child tools the same Node runtime", () => {
    const result = launch([
      "-e",
      "require('@tailwindcss/postcss'); " +
        "const {execFileSync}=require('node:child_process'); " +
        "console.log(JSON.stringify({parent:process.version,child:execFileSync('node',['--version'],{encoding:'utf8'}).trim()}));",
    ]);
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      parent: process.version,
      child: process.version,
    });
  });

  it("preserves tool arguments and failure exit codes", () => {
    const argument = "a path with spaces; literal $(text)";
    const result = launch([
      "-e",
      "console.log(process.argv[1]); process.exit(17);",
      argument,
    ]);
    expect(result.status).toBe(17);
    expect(result.stdout.trim()).toBe(argument);
  });

  it("reports an invalid runtime override before attempting the tool", () => {
    const result = launch(["--version"], path.join(workspace, "missing-node"));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("AUTHPILOT_NODE_BINARY");
    expect(result.stderr).toContain("Node.js 22.12+");
    expect(result.stderr).not.toContain("ERR_REQUIRE_ESM");
  });
});
