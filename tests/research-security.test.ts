import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  anonymousRateLimitKey,
  assertResearchAccess,
  readSmallJson,
} from "@/lib/server/request-security";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("research request controls", () => {
  it("rejects cross-origin browser requests", () => {
    const request = new Request("https://authpilot.example/api/research", {
      headers: { origin: "https://unrelated.example" },
    });
    expect(() => assertResearchAccess(request)).toThrow(
      "must come from this application",
    );
    expect(() =>
      assertResearchAccess(
        new Request("https://authpilot.example/api/research", {
          headers: { origin: "https://authpilot.example" },
        }),
      ),
    ).not.toThrow();
  });

  it("uses the browser request Host when Next exposes an internal URL hostname", () => {
    const request = new Request("http://localhost:3100/api/research", {
      headers: { host: "127.0.0.1:3100", origin: "http://127.0.0.1:3100" },
    });
    expect(() => assertResearchAccess(request)).not.toThrow();
    const foreign = new Request("http://localhost:3100/api/research", {
      headers: {
        host: "127.0.0.1:3100",
        origin: "https://unrelated.example",
        "x-forwarded-host": "unrelated.example",
      },
    });
    expect(() => assertResearchAccess(foreign)).toThrow(
      "must come from this application",
    );
  });

  it.each([
    "null",
    "not-an-origin",
    "ftp://authpilot.example",
    "https://authpilot.example/path",
    "https://user:password@authpilot.example",
  ])("rejects malformed or opaque origin %s", (origin) => {
    expect(() =>
      assertResearchAccess(
        new Request("https://authpilot.example/api/research", {
          headers: { host: "authpilot.example", origin },
        }),
      ),
    ).toThrow("must come from this application");
  });

  it("enforces the deployment research token without exposing it", () => {
    vi.stubEnv("RESEARCH_ACCESS_TOKEN", "test-private-owner-token");
    expect(() =>
      assertResearchAccess(
        new Request("https://authpilot.example/api/research"),
      ),
    ).toThrow("requires a research access token");
    expect(() =>
      assertResearchAccess(
        new Request("https://authpilot.example/api/research", {
          headers: { "x-research-token": "test-private-owner-token" },
        }),
      ),
    ).not.toThrow();
  });

  it("bounds request bytes and validates JSON instead of passing arbitrary bodies", async () => {
    const request = (body: string, contentType = "application/json") =>
      new Request("https://authpilot.example/api/research", {
        method: "POST",
        headers: { "content-type": contentType },
        body,
      });
    await expect(readSmallJson(request('{"query":"Linear"}'))).resolves.toEqual(
      { query: "Linear" },
    );
    await expect(readSmallJson(request("{"))).rejects.toThrow("not valid JSON");
    await expect(readSmallJson(request("x".repeat(2049)))).rejects.toThrow(
      "under 2 KB",
    );
    await expect(
      readSmallJson(request("query=Linear", "text/plain")),
    ).rejects.toThrow("JSON research request");
  });

  it("never stores raw client IPs in the rate-limit key", () => {
    vi.stubEnv("VERCEL", "1");
    const key = anonymousRateLimitKey(
      new Request("https://authpilot.example/api/research", {
        headers: { "x-vercel-forwarded-for": "203.0.113.10" },
      }),
    );
    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(key).not.toContain("203.0.113.10");
  });
});
