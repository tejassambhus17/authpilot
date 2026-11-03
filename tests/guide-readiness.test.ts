import { describe, expect, it } from "vitest";
import { getGuideReadiness } from "@/lib/guide-readiness";
import { seedGuides } from "@/lib/seed-guides";
import { defaultLaunchPath, type Guide } from "@/lib/schema";

const publicPath = { ...defaultLaunchPath, audience: "public" as const };

function sample(): Guide {
  const guide = structuredClone(seedGuides[0]);
  guide.checklist = [
    {
      id: "register",
      title: "Register app",
      description: "Create the client.",
      sectionId: "registration",
      actor: "developer",
      dependsOn: [],
      requirementType: "required",
    },
    {
      id: "test",
      title: "Test the integration",
      description: "Run the callback test.",
      sectionId: "testing",
      actor: "developer",
      dependsOn: ["register"],
    },
    {
      id: "review",
      title: "Provider review decision",
      description: "Check the provider decision.",
      sectionId: "review",
      actor: "provider",
      dependsOn: ["test"],
      applicability: "public",
    },
  ];
  return guide;
}

describe("guide readiness reading view", () => {
  it("keeps a blocker prominent when an independent task can continue", () => {
    const guide = sample();
    guide.checklist[1].dependsOn = [];
    const result = getGuideReadiness(
      guide,
      { register: "blocked" },
      publicPath,
    );
    expect(result.status).toBe("blocked");
    expect(result.title).toBe("1 blocker needs attention");
    expect(result.description).toContain("Independent work can continue");
    expect(result.blockedSteps.map((s) => s.id)).toEqual(["register"]);
    expect(result.actionableSteps.map((s) => s.id)).toEqual(["test"]);
    expect(result.lockedSteps.map((s) => s.id)).toEqual(["review"]);
  });

  it("counts dependency locks without recommending them as actionable", () => {
    const result = getGuideReadiness(sample(), {}, publicPath);
    expect(result.actionableSteps.map((s) => s.id)).toEqual(["register"]);
    expect(result.lockedSteps.map((s) => s.id)).toEqual(["test", "review"]);
    expect(result.waitingSteps.map((s) => s.id)).toEqual(["review"]);
    expect(result.status).toBe("in-progress");
  });

  it("separates a remaining provider decision from human actions", () => {
    const result = getGuideReadiness(
      sample(),
      { register: "completed", test: "completed" },
      publicPath,
    );
    expect(result.actionableSteps).toEqual([]);
    expect(result.status).toBe("waiting");
    expect(result.description).toContain("not evidence that review has begun");
  });

  it("prioritizes unsupported OAuth even over a completed personal checklist", () => {
    for (const oauthSupport of ["unclear", "unsupported"] as const) {
      const guide = { ...sample(), oauthSupport };
      const result = getGuideReadiness(
        guide,
        { register: "completed", test: "completed", review: "completed" },
        publicPath,
      );
      expect(result.status).toBe("support-unresolved");
      expect(result.description).toMatch(/not recommended until support/);
    }
  });

  it("restricts unsupported execution while allowing independent investigation", () => {
    const guide = sample();
    guide.oauthSupport = "unclear";
    guide.checklist.push({
      ...guide.checklist[0],
      id: "investigate",
      title: "Investigate support",
      sectionId: "prerequisites",
    });
    const result = getGuideReadiness(guide, {}, publicPath);
    expect(result.actionableSteps.map((s) => s.id)).toEqual(["investigate"]);
    expect(result.lockedSteps.map((s) => s.id)).toContain("register");
  });

  it("does not let manually omitted required prerequisites appear complete", () => {
    const result = getGuideReadiness(
      sample(),
      { register: "not-applicable", test: "completed", review: "completed" },
      publicPath,
    );
    expect(result.status).toBe("omissions");
    expect(result.requiredOmissions.map((s) => s.id)).toEqual(["register"]);
    expect(result.completedSteps).toHaveLength(2);
  });

  it("excludes documented audience branches without counting a manual omission", () => {
    const guide = sample();
    const result = getGuideReadiness(
      guide,
      {},
      { ...defaultLaunchPath, audience: "internal" },
    );
    expect(result.applicableSteps.map((s) => s.id)).toEqual([
      "register",
      "test",
    ]);
    expect(result.waitingSteps).toEqual([]);
    expect(result.omittedSteps).toEqual([]);
  });

  it("asks for audience context and keeps conflicting branches visible", () => {
    const guide = sample();
    expect(getGuideReadiness(guide, {}).status).toBe("path-unresolved");
    const result = getGuideReadiness(
      guide,
      {},
      { ...defaultLaunchPath, audience: "internal", marketplaceListing: true },
    );
    expect(result.title).toBe("Clarify your launch path");
    expect(result.applicableSteps).toHaveLength(3);
  });

  it("requires review after all tasks are recorded complete, without certification", () => {
    const result = getGuideReadiness(
      sample(),
      { register: "completed", test: "completed", review: "completed" },
      publicPath,
    );
    expect(result.status).toBe("review");
    expect(result.title).toBe("Review your recorded completion");
    expect(result.description).toContain(
      "does not establish a working OAuth setup",
    );
    expect(result.completedSteps).toHaveLength(3);
  });

  it("deduplicates snapshot unknowns without filtering them by personal audience", () => {
    const guide = sample();
    const unknown = {
      text: "Approval delay is unknown",
      status: "unknown" as const,
      sourceIds: [],
    };
    guide.approval = unknown;
    guide.blockers = [{ ...unknown, text: "  APPROVAL DELAY IS UNKNOWN  " }];
    guide.sections.forEach((section) => {
      section.claims = [
        {
          text: "Documented detail",
          status: "source-confirmed",
          sourceIds: [],
        },
      ];
    });
    guide.sections[0].claims.push({
      text: "Scope restriction unresolved",
      status: "unknown",
      sourceIds: [],
    });
    const result = getGuideReadiness(
      guide,
      {},
      { ...defaultLaunchPath, audience: "internal" },
    );
    expect(result.unknownClaims).toHaveLength(2);
    expect(guide.blockers[0].text).toBe("  APPROVAL DELAY IS UNKNOWN  ");
  });

  it("surfaces unresolved dependency records as prerequisites, not completion", () => {
    const guide = sample();
    guide.checklist.forEach((step) => {
      step.dependsOn = ["missing"];
    });
    const result = getGuideReadiness(guide, {}, publicPath);
    expect(result.status).toBe("blocked");
    expect(result.title).toBe("Resolve the remaining prerequisites");
    expect(result.actionableSteps).toEqual([]);
  });
});
