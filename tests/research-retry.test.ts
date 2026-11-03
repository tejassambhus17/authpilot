import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import type { ResearchEvent } from "@/lib/schema";
import { ResearchError } from "@/lib/server/errors";
import {
  runResearchStage,
  transientResearchFailure,
} from "@/lib/server/research-retry";

afterEach(() => vi.useRealTimers());

const setup = () => ({
  phase: "searching" as const,
  label: "Documentation search",
  emit: vi.fn<(event: ResearchEvent) => void>(),
  signal: new AbortController().signal,
  deadline: Date.now() + 270_000,
});

describe("bounded transient research retries", () => {
  it.each([
    { name: "APIConnectionError" },
    { status: 503 },
    { status: 429 },
    { code: "ECONNRESET" },
    new ResearchError("SEARCH_INCOMPLETE", "Interrupted", 502),
  ])("retries a recognized temporary failure: %j", async (failure) => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValue("real returned evidence");
    const options = setup();
    await expect(runResearchStage(operation, options)).resolves.toBe(
      "real returned evidence",
    );
    expect(operation).toHaveBeenCalledTimes(2);
    expect(options.emit).toHaveBeenCalledOnce();
    expect(options.emit.mock.calls[0][0]).toMatchObject({
      phase: "searching",
      message: expect.stringContaining("Retrying once"),
    });
  });

  it("never retries more than once", async () => {
    const failure = { status: 503 };
    const operation = vi.fn().mockRejectedValue(failure);
    await expect(runResearchStage(operation, setup())).rejects.toBe(failure);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it.each([
    { status: 400 },
    { status: 401 },
    { status: 403 },
    { name: "ZodError" },
    { name: "AbortError" },
    { status: 429, code: "insufficient_quota" },
    new ResearchError("INVALID_EVIDENCE", "Invalid citations", 502),
    new ResearchError("NO_EVIDENCE", "Missing docs", 422),
  ])(
    "does not retry configuration, validation or quota failures: %j",
    async (failure) => {
      expect(transientResearchFailure(failure)).toBe(false);
      const operation = vi.fn().mockRejectedValue(failure);
      const options = setup();
      await expect(runResearchStage(operation, options)).rejects.toBe(failure);
      expect(operation).toHaveBeenCalledOnce();
      expect(options.emit).not.toHaveBeenCalled();
    },
  );

  it("skips retry when the deadline or Retry-After needs more time", async () => {
    for (const failure of [
      { status: 503 },
      { status: 429, headers: new Headers({ "retry-after": "60" }) },
    ]) {
      const operation = vi.fn().mockRejectedValue(failure);
      const options = {
        ...setup(),
        deadline: Date.now() + ("headers" in failure ? 270_000 : 5000),
      };
      await expect(runResearchStage(operation, options)).rejects.toBe(failure);
      expect(operation).toHaveBeenCalledOnce();
      expect(options.emit).not.toHaveBeenCalled();
    }
  });

  it("cancels the retry wait without issuing another request", async () => {
    const abort = new AbortController();
    const operation = vi.fn().mockRejectedValue({ status: 503 });
    const options = { ...setup(), signal: abort.signal };
    const run = runResearchStage(operation, options);
    const assertion = expect(run).rejects.toMatchObject({ name: "AbortError" });
    await Promise.resolve();
    abort.abort();
    await assertion;
    expect(operation).toHaveBeenCalledOnce();
  });
});
