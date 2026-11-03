import { describe, expect, it } from "vitest";
import { defaultLaunchPath } from "@/lib/schema";
import { seedGuides } from "@/lib/seed-guides";
import {
  formatDuration,
  getPlanningEstimate,
  getStepApplicability,
} from "@/lib/launch-path";
import { getGuideNextStep } from "@/lib/guide-navigation";

describe("personal launch paths", () => {
  it("does not infer applicability from step wording or hide public steps for an undecided audience", () => {
    const step = {
      ...seedGuides[0].checklist[0],
      title: "Optional public marketplace review",
      applicability: undefined,
    };
    expect(getStepApplicability(step).excluded).toBe(false);
    expect(
      getStepApplicability({ ...step, applicability: "public" }).excluded,
    ).toBe(false);
  });
  it("excludes only explicit audience branches and optional listing choices", () => {
    const step = seedGuides[0].checklist[0];
    expect(
      getStepApplicability(
        { ...step, applicability: "public" },
        { ...defaultLaunchPath, audience: "internal" },
      ).excluded,
    ).toBe(true);
    expect(
      getStepApplicability({
        ...step,
        applicability: "marketplace",
        requirementType: "optional",
      }).excluded,
    ).toBe(true);
    expect(
      getStepApplicability(
        { ...step, applicability: "marketplace" },
        { ...defaultLaunchPath, marketplaceListing: true },
      ).excluded,
    ).toBe(false);
  });
  it("does not omit mandatory or conditional listings when optional listing is unchecked", () => {
    for (const requirementType of [
      "required",
      "conditional",
      undefined,
    ] as const) {
      expect(
        getStepApplicability({
          ...seedGuides[0].checklist[0],
          applicability: "marketplace",
          requirementType,
        }).excluded,
      ).toBe(false);
    }
  });
  it("retains both audience branches when internal and marketplace preferences conflict", () => {
    const path = {
      ...defaultLaunchPath,
      audience: "internal" as const,
      marketplaceListing: true,
    };
    const guide = structuredClone(seedGuides[0]);
    guide.checklist = [
      {
        ...guide.checklist[0],
        id: "public-review",
        dependsOn: [],
        applicability: "public",
      },
      {
        ...guide.checklist[1],
        id: "listing",
        dependsOn: ["public-review"],
        applicability: "marketplace",
      },
    ];
    expect(
      getStepApplicability(
        { ...guide.checklist[0], applicability: "internal" },
        path,
      ).excluded,
    ).toBe(false);
    const next = getGuideNextStep(guide, {}, path);
    expect(next.kind).toBe("actionable");
    expect(next.step?.id).toBe("public-review");
    expect(next.actionableSteps.map((step) => step.id)).not.toContain(
      "listing",
    );
  });
  it("does not let a manually skipped required prerequisite unlock another step", () => {
    const guide = structuredClone(seedGuides[0]);
    guide.checklist = [
      {
        ...guide.checklist[0],
        id: "register",
        dependsOn: [],
        requirementType: "required",
        applicability: "all",
      },
      {
        ...guide.checklist[1],
        id: "test",
        dependsOn: ["register"],
        applicability: "all",
      },
    ];
    const result = getGuideNextStep(guide, { register: "not-applicable" });
    expect(result.kind).toBe("blocked");
    expect(result.step?.id).toBe("test");
    expect(result.unmetDependencies[0]).toMatchObject({
      status: "not-applicable",
      satisfied: false,
    });
  });
  it("allows a correctly excluded conditional branch to stop blocking applicable work", () => {
    const guide = structuredClone(seedGuides[0]);
    guide.checklist = [
      {
        ...guide.checklist[0],
        id: "review",
        dependsOn: [],
        applicability: "public",
      },
      {
        ...guide.checklist[1],
        id: "internal-test",
        dependsOn: ["review"],
        applicability: "all",
      },
    ];
    const result = getGuideNextStep(
      guide,
      {},
      { ...defaultLaunchPath, audience: "internal" },
    );
    expect(result.kind).toBe("actionable");
    expect(result.step?.id).toBe("internal-test");
  });
});

describe("honest hands-on planning", () => {
  it("preserves legacy narrative estimates without inventing numeric ranges", () => {
    const guide = { ...seedGuides[0], planning: undefined };
    const plan = getPlanningEstimate(guide);
    expect(plan.baseline).toBe(true);
    expect(plan.registration).toBeNull();
    expect(plan.implementation).toBeNull();
    expect(plan.assumptions.join(" ")).toMatch(/not a provider-measured/);
    expect(plan.assumptions.join(" ")).toMatch(/approval waiting/);
  });
  it("does not estimate executable work for unclear or unsupported OAuth", () => {
    for (const oauthSupport of ["unclear", "unsupported"] as const) {
      const plan = getPlanningEstimate({
        ...seedGuides[0],
        oauthSupport,
        planning: {
          registration: { minMinutes: 5, maxMinutes: 10 },
          implementation: null,
          assumptions: ["An untrusted old estimate"],
        },
      });
      expect(plan.registration).toBeNull();
      expect(plan.implementation).toBeNull();
    }
  });
  it("keeps supplied estimates and readable minute/hour ranges", () => {
    const planning = {
      registration: { minMinutes: 10, maxMinutes: 30 },
      implementation: { minMinutes: 90, maxMinutes: 180 },
      assumptions: ["Existing backend"],
    };
    expect(getPlanningEstimate({ ...seedGuides[0], planning })).toMatchObject({
      ...planning,
      baseline: false,
    });
    expect(formatDuration(planning.registration)).toBe("10–30 minutes");
    expect(formatDuration(planning.implementation)).toBe("1.5–3 hours");
    expect(formatDuration(null)).toMatch(/Unknown/);
  });
});
