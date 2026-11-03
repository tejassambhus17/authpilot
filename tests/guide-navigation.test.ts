import { describe, expect, it } from "vitest";
import { seedGuides } from "@/lib/seed-guides";
import type { Guide } from "@/lib/schema";
import { getGuideNextStep, getStepDocumentation } from "@/lib/guide-navigation";

function guide(): Guide {
  const result = structuredClone(seedGuides[0]);
  result.checklist = [
    {
      id: "register",
      title: "Register app",
      description: "Create registration.",
      actor: "developer",
      sectionId: "registration",
    },
    {
      id: "callback",
      title: "Configure callback",
      description: "Set callback.",
      actor: "developer",
      sectionId: "redirects",
    },
    {
      id: "test",
      title: "Test integration",
      description: "Run a test.",
      actor: "developer",
      sectionId: "testing",
    },
  ];
  return result;
}

describe("blocker-aware guide navigation", () => {
  for (const oauthSupport of ["unsupported", "unclear"] as const) {
    it(`does not recommend OAuth execution tasks when support is ${oauthSupport}`, () => {
      for (const sectionId of [
        "registration",
        "credentials",
        "scopes",
        "redirects",
        "testing",
      ] as const) {
        const value = guide();
        value.oauthSupport = oauthSupport;
        value.checklist = [{ ...value.checklist[0], sectionId }];
        const progress = { register: "in-progress" as const };
        const result = getGuideNextStep(value, progress);
        expect(result.kind).toBe("blocked");
        expect(result.supportRestricted).toBe(true);
        expect(result.supportUnestablished).toBe(true);
        expect(progress).toEqual({ register: "in-progress" });
      }
    });
  }

  it("permits explicit independent investigation while keeping OAuth execution restricted", () => {
    const value = guide();
    value.oauthSupport = "unsupported";
    value.checklist[2] = {
      id: "investigate",
      title: "Confirm provider support",
      description: "Inspect official documentation or ask provider support.",
      actor: "developer",
      sectionId: "prerequisites",
      dependsOn: [],
    };
    const result = getGuideNextStep(value, {});
    expect(result.kind).toBe("actionable");
    expect(result.step?.id).toBe("investigate");
    expect(result.supportRestricted).toBe(false);
    expect(result.supportUnestablished).toBe(true);
  });

  it("never recommends a blocked first task or skips to a potentially dependent legacy task", () => {
    const result = getGuideNextStep(guide(), { register: "blocked" });
    expect(result.kind).toBe("blocked");
    expect(result.step?.id).toBe("register");
    expect(result.blockedSteps.map((step) => step.id)).toEqual(["register"]);
    expect(result.inferredOrder).toBe(true);
  });

  it("waits for explicit dependencies even if a later step was marked in progress", () => {
    const value = guide();
    value.checklist[1].dependsOn = ["register"];
    value.checklist[2].dependsOn = ["callback"];
    const result = getGuideNextStep(value, {
      register: "blocked",
      callback: "in-progress",
    });
    expect(result.kind).toBe("blocked");
    expect(result.step?.id).toBe("register");
  });

  it("can recommend an explicitly independent task while keeping the blocker visible", () => {
    const value = guide();
    value.checklist[2].dependsOn = [];
    const result = getGuideNextStep(value, { register: "blocked" });
    expect(result.kind).toBe("actionable");
    expect(result.step?.id).toBe("test");
    expect(result.blockedSteps.map((step) => step.id)).toEqual(["register"]);
  });

  it("advances only when legacy prerequisites have been completed", () => {
    const result = getGuideNextStep(guide(), { register: "completed" });
    expect(result.kind).toBe("actionable");
    expect(result.step?.id).toBe("callback");
    expect(result.dependencies[0]).toMatchObject({
      id: "register",
      status: "completed",
    });
  });

  it("does not treat unknown dependency identifiers as satisfied", () => {
    const value = guide();
    value.checklist.forEach((step) => {
      step.dependsOn = ["missing"];
    });
    const result = getGuideNextStep(value, {});
    expect(result.kind).toBe("blocked");
    expect(result.unmetDependencies[0].status).toBe("missing");
  });

  it("does not choose a step in a dependency cycle", () => {
    const value = guide();
    value.checklist[0].dependsOn = ["callback"];
    value.checklist[1].dependsOn = ["test"];
    value.checklist[2].dependsOn = ["register"];
    expect(getGuideNextStep(value, {}).kind).toBe("blocked");
  });

  it("reports completion without suggesting more setup tasks", () => {
    const result = getGuideNextStep(guide(), {
      register: "completed",
      callback: "completed",
      test: "completed",
    });
    expect(result.kind).toBe("complete");
    expect(result.step).toBeUndefined();
  });

  it("prefers a step's exact documentation over its section's first citation", () => {
    const value = guide();
    value.checklist[0].sourceIds = [value.sources.at(-1)!.id];
    const result = getStepDocumentation(value, value.checklist[0]);
    expect(result.specific).toBe(true);
    expect(result.sources.map((source) => source.id)).toEqual([
      value.sources.at(-1)!.id,
    ]);
  });

  it("labels legacy section documentation as related, without claiming a step-specific link", () => {
    const value = guide();
    const result = getStepDocumentation(value, value.checklist[0]);
    expect(result.specific).toBe(false);
    expect(result.sources.length).toBeGreaterThan(0);
  });
});
