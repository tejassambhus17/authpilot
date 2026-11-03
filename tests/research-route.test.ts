import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ResearchEvent } from "@/lib/schema";

const mocks = vi.hoisted(() => ({
  research: vi.fn(),
  transport: vi.fn(),
  consumeRateLimit: vi.fn(),
  saveGuide: vi.fn(),
}));
vi.mock("@/lib/server/research", () => ({
  OpenAIResearchTransport: class {
    constructor() {
      mocks.transport();
    }
  },
  researchProvider: mocks.research,
}));
vi.mock("@/lib/server/store", () => ({
  getStore: async () => ({ consumeRateLimit: mocks.consumeRateLimit }),
  saveGuide: mocks.saveGuide,
}));
import { POST } from "@/app/api/research/route";

const request = (query: string, extra: object = {}) =>
  new Request("https://authpilot.example/api/research", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, ...extra }),
  });

beforeEach(() => {
  vi.stubEnv("OPENAI_API_KEY", "test-placeholder-not-real");
  vi.stubEnv("RESEARCH_ACCESS_TOKEN", "");
  vi.clearAllMocks();
  mocks.consumeRateLimit.mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("research request trace and early validation", () => {
  it("rejects loopback input before constructing a paid transport", async () => {
    const response = await POST(request("https://127.0.0.1:3000/docs"));
    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result).toMatchObject({ code: "INVALID_INPUT" });
    expect(result.requestId).toMatch(/^AP-[a-f\d-]{12}$/);
    expect(response.headers.get("x-request-id")).toBe(result.requestId);
    expect(mocks.transport).not.toHaveBeenCalled();
    expect(mocks.research).not.toHaveBeenCalled();
    expect(mocks.consumeRateLimit).not.toHaveBeenCalled();
  });

  it("keeps one reference through events and sanitized diagnostic logs", async () => {
    mocks.research.mockImplementationOnce(
      async (
        _query: string,
        options: { emit: (event: ResearchEvent) => void },
      ) => {
        options.emit({
          phase: "accepted",
          message: "Accepted",
          timestamp: new Date().toISOString(),
        });
        throw new Error("private-upstream-secret");
      },
    );
    const response = await POST(request("Figma"));
    const events = (await response.text())
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    const requestId = response.headers.get("x-request-id");
    expect(events.map((event) => event.phase)).toEqual(["accepted", "error"]);
    expect(events.every((event) => event.requestId === requestId)).toBe(true);
    expect(JSON.stringify(events)).not.toContain("private-upstream-secret");
    expect(console.error).toHaveBeenCalledWith(
      "AuthPilot research failure",
      expect.objectContaining({ requestId, code: "RESEARCH_FAILED" }),
    );
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
      "private-upstream-secret",
    );
  });

  it("returns a reference for configuration failures without exposing credentials", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const response = await POST(request("Figma"));
    const result = await response.json();
    expect(response.status).toBe(503);
    expect(result.code).toBe("API_KEY_MISSING");
    expect(result.requestId).toBe(response.headers.get("x-request-id"));
    expect(mocks.transport).not.toHaveBeenCalled();
  });

  it("reports the actual application deadline rather than a generic failure", async () => {
    vi.useFakeTimers();
    const startedAt = Date.now();
    mocks.consumeRateLimit.mockImplementationOnce(async () => {
      // Simulate time spent admitting the request before any paid API work.
      vi.setSystemTime(startedAt + 50_000);
      return true;
    });
    mocks.research.mockImplementationOnce(
      async (_query: string, options: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) =>
          options.signal.addEventListener(
            "abort",
            () => reject(options.signal.reason),
            { once: true },
          ),
        ),
    );
    const response = await POST(request("Figma"));
    expect(mocks.research.mock.calls[0][1].deadline).toBe(startedAt + 270_000);
    const body = response.text();
    await vi.advanceTimersByTimeAsync(220_000);
    const event = JSON.parse((await body).trim());
    expect(event.code).toBe("TIMEOUT");
    expect(event.message).toContain("270-second request limit");
    expect(event.requestId).toBe(response.headers.get("x-request-id"));
  });
});
