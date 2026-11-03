import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assessDeploymentEnvironment,
  validRemoteDatabaseUrl,
  RESEARCH_TIMEOUT_MS,
} from "@/lib/server/deployment-config";
import { GET } from "@/app/api/health/route";
import {
  databaseConfigured,
  databaseFetch,
  getGuides,
  getStore,
} from "@/lib/server/store";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("deployment readiness", () => {
  it("keeps local seeded reading available without paid configuration", () => {
    const result = assessDeploymentEnvironment({});
    expect(result.persistenceConfigured).toBe(true);
    expect(result.persistenceMode).toBe("local");
    expect(result.researchReady).toBe(false);
    expect(result.issues).toEqual(["API_KEY_MISSING"]);
  });

  it("does not treat file-backed or absent storage as durable on Vercel", () => {
    for (const url of [
      undefined,
      "file:./data/authpilot.db",
      "http://database.example",
    ]) {
      const result = assessDeploymentEnvironment({
        VERCEL: "1",
        OPENAI_API_KEY: "test-key",
        TURSO_DATABASE_URL: url,
        TURSO_AUTH_TOKEN: "test-token",
      });
      expect(result.researchReady).toBe(false);
      expect(result.persistenceMode).toBe("unconfigured");
      expect(result.issues).toContain("DATABASE_NOT_CONFIGURED");
    }
  });

  it.each([
    "https://user:private@database.example",
    "https://database.example?authToken=private",
    "https://database.example#private",
    "https://localhost",
    "https://127.0.0.1",
    "https://[::1]",
    "libsql://database.internal",
    "not-a-url",
    " https://database.example",
  ])("rejects unsafe/malformed remote storage configuration %s", (url) => {
    expect(validRemoteDatabaseUrl(url)).toBe(false);
  });

  it("requires a complete remote pair and never claims it connected", () => {
    expect(
      assessDeploymentEnvironment({
        TURSO_DATABASE_URL: "libsql://example.turso.io",
      }).persistenceConfigured,
    ).toBe(false);
    expect(
      assessDeploymentEnvironment({ TURSO_AUTH_TOKEN: "test-token" })
        .persistenceConfigured,
    ).toBe(false);
    const result = assessDeploymentEnvironment({
      VERCEL: "1",
      OPENAI_API_KEY: "private-api-key",
      TURSO_DATABASE_URL: "libsql://example.turso.io",
      TURSO_AUTH_TOKEN: "private-db-token",
      RESEARCH_ACCESS_TOKEN: "private-gate-token",
    });
    expect(result.researchReady).toBe(true);
    expect(result.persistenceMode).toBe("remote");
    expect(result.connectivityVerified).toBe(false);
    expect(result.issues).toEqual([]);
    const publicStatus = JSON.stringify(result);
    expect(publicStatus).not.toMatch(/private-|example\.turso/);
  });

  it("fails closed when a known server secret uses a public variable name", () => {
    const result = assessDeploymentEnvironment({
      OPENAI_API_KEY: "server-key",
      NEXT_PUBLIC_OPENAI_API_KEY: "exposed-test-key",
    });
    expect(result.serverSecretsSafe).toBe(false);
    expect(result.researchReady).toBe(false);
    expect(result.issues).toContain("PUBLIC_SECRET_CONFIGURED");
    expect(JSON.stringify(result)).not.toContain("exposed-test-key");
  });

  it("ignores whitespace as configuration and leaves cleanup time below function cap", () => {
    expect(
      assessDeploymentEnvironment({ OPENAI_API_KEY: "   " }).apiKeyConfigured,
    ).toBe(false);
    expect(RESEARCH_TIMEOUT_MS).toBeLessThan(300_000);
    expect(300_000 - RESEARCH_TIMEOUT_MS).toBeGreaterThanOrEqual(30_000);
  });

  it("health reports safe configuration facts without making connectivity claims", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("OPENAI_API_KEY", "test-api-credential");
    vi.stubEnv("TURSO_DATABASE_URL", "https://example.turso.io");
    vi.stubEnv("TURSO_AUTH_TOKEN", "test-storage-credential");
    const response = await GET();
    const body = await response.json();
    expect(body.researchReady).toBe(true);
    expect(body.connectivityVerified).toBe(false);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(JSON.stringify(body)).not.toMatch(
      /test-api-credential|test-storage-credential|example\.turso/,
    );
  });

  it("invalid Vercel configuration preserves seeds and fails before a DB connection", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("TURSO_DATABASE_URL", "file:./data/unsafe.db");
    vi.stubEnv("TURSO_AUTH_TOKEN", "test-token");
    expect(databaseConfigured()).toBe(false);
    expect((await getGuides()).map((guide) => guide.id)).toEqual([
      "github",
      "slack",
      "google",
    ]);
    await expect(getStore()).rejects.toThrow("not configured correctly");
  });

  it("remote database fetch preserves request cancellation and adds a deadline", async () => {
    const controller = new AbortController();
    const original = new Request("https://database.example", {
      signal: controller.signal,
    });
    const transport = vi.fn().mockResolvedValue(new Response("ok"));
    vi.stubGlobal("fetch", transport);
    await databaseFetch(original);
    const signal = transport.mock.calls[0][1].signal as AbortSignal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
    controller.abort();
    expect(signal.aborted).toBe(true);
    expect(transport.mock.calls[0][0]).toBe(original);
  });
});
