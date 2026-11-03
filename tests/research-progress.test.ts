import { describe, expect, it } from "vitest";
import type { ResearchEvent, ResearchPhase } from "@/lib/schema";
import {
  getDiscoveredSources,
  getResearchProgress,
} from "@/lib/research-progress";

const event = (
  phase: ResearchPhase,
  extra: Partial<ResearchEvent> = {},
): ResearchEvent => ({
  phase,
  message: phase,
  timestamp: "2026-11-03T12:00:00.000Z",
  ...extra,
});

describe("observed research progress", () => {
  it("keeps search pending until a real search event arrives", () => {
    const result = getResearchProgress([event("accepted")], true, false);
    expect(result.map((step) => step.state)).toEqual([
      "completed",
      "pending",
      "pending",
      "pending",
      "pending",
    ]);
  });

  it("does not create an unobserved intermediate phase", () => {
    const result = getResearchProgress(
      [event("accepted"), event("synthesizing")],
      true,
      false,
    );
    expect(result[1].state).toBe("pending");
    expect(result[2].state).toBe("active");
    expect(result[3].state).toBe("pending");
  });

  it("marks interrupted search as failed without completing later work", () => {
    const result = getResearchProgress(
      [event("accepted"), event("searching"), event("error")],
      false,
      true,
    );
    expect(result.map((step) => step.state)).toEqual([
      "completed",
      "failed",
      "pending",
      "pending",
      "pending",
    ]);
  });

  it("requires a saved guide ID before the save stage is complete", () => {
    const phases: ResearchPhase[] = [
      "accepted",
      "searching",
      "synthesizing",
      "validating",
      "saving",
    ];
    const events = phases.map((phase) => event(phase));
    expect(
      getResearchProgress([...events, event("complete")], true, false)[4].state,
    ).toBe("active");
    expect(
      getResearchProgress(
        [...events, event("complete", { guideId: "example-123" })],
        false,
        false,
      ).every((step) => step.state === "completed"),
    ).toBe(true);
  });

  it("counts only actual, unique, safe source events without certifying publisher identity", () => {
    const sources = getDiscoveredSources([
      event("searching", { url: "https://example.com/unused" }),
      event("source-found", {
        message: "OAuth docs",
        url: "https://docs.example.com/oauth",
      }),
      event("source-found", {
        message: "Same docs",
        url: "https://docs.example.com/oauth",
      }),
      event("source-found", {
        message: "Community answer",
        url: "https://community.example.com/thread",
      }),
      event("source-found", { url: "javascript:alert(1)" }),
      event("source-found", { url: "https://user:password@example.com/docs" }),
    ]);
    expect(sources).toHaveLength(2);
    expect(sources[0].classification).toBe("Documentation candidate");
    expect(sources[1].classification).toBe("Retrieved source");
    expect(
      sources.every((source) => !source.classification.includes("Official")),
    ).toBe(true);
  });
});
