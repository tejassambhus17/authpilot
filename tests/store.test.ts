import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { createClient, type Client } from "@libsql/client";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { seedGuides } from "@/lib/seed-guides";
import { createGuideStore } from "@/lib/server/store";
import { guideToMarkdown } from "@/lib/server/markdown";

const clients: Client[] = [];
const directories: string[] = [];
afterEach(async () => {
  clients.splice(0).forEach(client => client.close());
  for (const directory of directories.splice(0)) await rm(directory, {recursive: true, force: true, maxRetries: 3, retryDelay: 100});
});

function memoryStore() {
  const client = createClient({url: "file::memory:"});
  clients.push(client);
  return createGuideStore(client);
}

// An isolated process releases libSQL's native Windows file handles before cleanup.
// This exercises the actual TypeScript store and contracts, not a replacement store.
const persistentProbe = String.raw`
  const fs = require("node:fs");
  const path = require("node:path");
  const Module = require("node:module");
  const ts = require("typescript");
  const resolveOriginal = Module._resolveFilename;
  Module._resolveFilename = function(request, parent, ...rest) {
    if (request === "server-only") request = path.join(process.cwd(), "tests/server-only.ts");
    else if (request.startsWith("@/")) request = path.join(process.cwd(), "src", request.slice(2));
    return resolveOriginal.call(this, request, parent, ...rest);
  };
  require.extensions[".ts"] = function(module, filename) {
    const source = fs.readFileSync(filename, "utf8");
    module._compile(ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true}}).outputText, filename);
  };
  (async () => {
    const {createClient} = require("@libsql/client");
    const {createGuideStore} = require(path.join(process.cwd(), "src/lib/server/store.ts"));
    const payload = JSON.parse(fs.readFileSync(0, "utf8"));
    const client = createClient({url: process.env.AUTHPILOT_TEST_DATABASE});
    const store = createGuideStore(client);
    if (payload.action === "save") await store.saveGuide(payload.guide);
    const guide = await store.getGuide(payload.guide.id);
    let overwriteRejected = false;
    if (payload.action === "reopen") {
      try { await store.saveGuide({...payload.guide, provider: "Overwritten"}); }
      catch { overwriteRejected = true; }
    }
    process.stdout.write(JSON.stringify({guide, overwriteRejected}));
    client.close();
  })().catch(error => { process.stderr.write(String(error)); process.exitCode = 1; });
`;

describe("guide persistence", () => {
  it("roundtrips a guide through SQLite, including source evidence", async () => {
    const store = memoryStore();
    const guide = {...seedGuides[0], id: "research-roundtrip", origin: "researched" as const};
    await store.saveGuide(guide);
    expect(await store.getGuide(guide.id)).toEqual(guide);
    expect(await store.getGuides()).toEqual([guide]);
    expect(await store.getGuide("does-not-exist")).toBeNull();
  });

  it("persists across database connections and never silently overwrites a snapshot", async () => {
    const directory = await mkdtemp(join(tmpdir(), "authpilot-store-"));
    directories.push(directory);
    const databaseUrl = `file:${join(directory, "test.db").replaceAll("\\", "/")}`;
    const guide = {...seedGuides[0], id: "persistent-guide", origin: "researched" as const};
    const probe = (action: "save" | "reopen") => {
      const result = spawnSync(process.execPath, ["-e", persistentProbe], {
        cwd: process.cwd(), env: {...process.env, AUTHPILOT_TEST_DATABASE: databaseUrl},
        input: JSON.stringify({action, guide}), encoding: "utf8", timeout: 15_000, windowsHide: true,
      });
      if (result.error) throw result.error;
      expect(result.status, result.stderr).toBe(0);
      return JSON.parse(result.stdout) as {guide: typeof guide; overwriteRejected: boolean};
    };
    expect(probe("save").guide).toEqual(guide);
    const reopened = probe("reopen");
    expect(reopened.guide).toEqual(guide);
    expect(reopened.overwriteRejected).toBe(true);
  });

  it("rejects invalid evidence before writing", async () => {
    const store = memoryStore();
    const guide = structuredClone({...seedGuides[0], id: "invalid"});
    guide.sections[0].claims[0].status = "source-confirmed";
    guide.sections[0].claims[0].sourceIds = ["missing-source"];
    await expect(store.saveGuide(guide)).rejects.toThrow("missing source");
    expect(await store.getGuides()).toEqual([]);
  });

  it("atomically enforces a persistent rate limit and resets after expiry", async () => {
    const store = memoryStore();
    const concurrent = await Promise.all(Array.from({length: 8}, () => store.consumeRateLimit("client", 5, 1000, 100)));
    expect(concurrent.filter(Boolean)).toHaveLength(5);
    expect(await store.consumeRateLimit("client", 5, 1000, 500)).toBe(false);
    expect(await store.consumeRateLimit("client", 5, 1000, 1100)).toBe(true);
    expect(await store.consumeRateLimit("other-client", 5, 1000, 500)).toBe(true);
  });

  it("exports complete evidence and automation boundaries without shared checklist progress", () => {
    const markdown = guideToMarkdown(seedGuides[0]);
    expect(markdown).toContain(seedGuides[0].provider);
    expect(markdown).toContain(seedGuides[0].sources[0].url);
    expect(markdown).toContain("## What the agent can do");
    expect(markdown).toContain("- [ ]");
    expect(markdown).toContain("progress belongs to the current browser");
  });
});
