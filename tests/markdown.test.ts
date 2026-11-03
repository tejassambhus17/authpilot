import { describe, expect, it } from "vitest";
import { seedGuides } from "@/lib/seed-guides";
import { guideToMarkdown } from "@/lib/server/markdown";

describe("portable guide export", () => {
  it("keeps planning estimates separate from unknown approval waiting and preserves evidence", () => {
    const guide = structuredClone(seedGuides[0]);
    guide.approval = {
      text: "No approval timeline established.",
      status: "unknown",
      sourceIds: [],
    };
    guide.planning = {
      registration: { minMinutes: 20, maxMinutes: 40 },
      implementation: { minMinutes: 120, maxMinutes: 240 },
      assumptions: ["Existing backend and administrator access."],
    };
    const output = guideToMarkdown(guide);
    expect(output).toContain("Hands-on registration estimate: 20–40 minutes");
    expect(output).toContain("Hands-on implementation estimate: 2–4 hours");
    expect(output).toContain("AI planning judgment, not provider-measured");
    expect(output).toContain("**unknown**: No approval timeline established.");
    expect(output).toContain(guide.sources[0].url);
    expect(output).toContain(`Retrieved: ${guide.sources[0].retrievedAt}`);
    expect(output).toContain("not a successful setup attempt");
  });

  it("exports applicability, recovery ownership and dependencies without personal progress", () => {
    const guide = structuredClone(seedGuides[0]);
    guide.checklist = [
      {
        id: "review",
        title: "Submit public review",
        description: "Prepare the review materials.",
        actor: "developer",
        sectionId: "review",
        applicability: "public",
        requirementType: "conditional",
        recoveryOwner: "App owner",
        recovery: "Obtain reviewer access from the app owner.",
        dependsOn: [],
        sourceIds: [guide.sources[0].id],
      },
    ];
    const output = guideToMarkdown(guide);
    expect(output).toContain(
      "Applicable path: public. Requirement: conditional.",
    );
    expect(output).toContain("Recovery owner: App owner");
    expect(output).toContain("If blocked: Obtain reviewer access");
    expect(output).toContain("Dependencies: No recorded prerequisites");
    expect(output).toContain("- [ ] **Submit public review**");
    expect(output).toContain(
      "blocker notes and Not applicable decisions also stay in the current browser",
    );
    expect(output).not.toContain("- [x]");
  });

  it("does not invent executable effort estimates for unsupported OAuth", () => {
    const guide = structuredClone(seedGuides[0]);
    delete guide.planning;
    guide.oauthSupport = "unsupported";
    expect(guideToMarkdown(guide)).toContain(
      "Unknown — confirm the integration path first",
    );
    expect(guideToMarkdown(guide)).not.toContain("15–45 minutes");
  });
});
