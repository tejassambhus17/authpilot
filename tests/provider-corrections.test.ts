import { describe, expect, it } from "vitest";
import { seedGuides } from "@/lib/seed-guides";
import {
  applyProviderCorrections,
  FIGMA_CORRECTION_RETRIEVED_AT,
  FIGMA_CORRECTION_SOURCE_ID,
  isAuditedFigmaSnapshot,
  isAuditedFigmaPlanningSnapshot,
  isManualCorrectionClaim,
} from "@/lib/provider-corrections";
import {
  defaultLaunchPath,
  guideSchema,
  validateGuideEvidence,
  type ChecklistStatus,
  type Guide,
} from "@/lib/schema";
import { getGuideNextStep } from "@/lib/guide-navigation";

function auditedSnapshot(): Guide {
  const guide = structuredClone(seedGuides[0]);
  guide.id = "figma-5c8d411d-77e";
  guide.provider = "Figma";
  guide.website = "https://www.figma.com";
  guide.origin = "researched";
  guide.createdAt = "2026-11-03T16:00:00.000Z";
  guide.sections.find((section) => section.id === "testing")!.claims = [
    { text: "Test refresh-token rotation.", status: "estimate", sourceIds: [] },
  ];
  guide.checklist[3].title = "Implement the authorization flow";
  return guide;
}

describe("dated provider correction view", () => {
  it("preserves the immutable snapshot and retains the inaccurate wording as unsupported", () => {
    const original = auditedSnapshot();
    const before = JSON.stringify(original);
    const view = applyProviderCorrections(original);
    const claims = view.sections.find(
      (section) => section.id === "testing",
    )!.claims;
    expect(claims[0].text).toBe("Test refresh-token rotation.");
    expect(claims[0].status).toBe("unknown");
    expect(claims[0].verification?.status).toBe("unsupported");
    expect(JSON.stringify(original)).toBe(before);
    expect(view.warnings.join(" ")).toContain(
      "original stored snapshot is retained",
    );
  });

  it("adds separately sourced manual amendments without inventing server checks or setup results", () => {
    const view = applyProviderCorrections(auditedSnapshot());
    const manualClaims = view.sections
      .flatMap((section) => section.claims)
      .filter(isManualCorrectionClaim);
    expect(manualClaims).toHaveLength(2);
    expect(
      manualClaims.some((claim) => /reusable refresh token/.test(claim.text)),
    ).toBe(true);
    expect(manualClaims.some((claim) => /S256/.test(claim.text))).toBe(true);
    for (const claim of manualClaims) {
      expect(claim.evidence).toBeUndefined();
      expect(claim.verification).toBeUndefined();
      expect(claim.conditions?.join(" ")).toContain(
        "Manual AuthPilot documentation correction",
      );
    }
    expect(
      view.sources.find((source) => source.id === FIGMA_CORRECTION_SOURCE_ID)
        ?.retrievedAt,
    ).toBe(FIGMA_CORRECTION_RETRIEVED_AT);
    expect(view.checklist[3].description).toContain("recommended S256 PKCE");
    expect(() => guideSchema.parse(view)).not.toThrow();
    expect(() => validateGuideEvidence(view)).not.toThrow();
  });

  it("is idempotent and leaves future, unrelated, or untrusted snapshots untouched", () => {
    const view = applyProviderCorrections(auditedSnapshot());
    expect(applyProviderCorrections(view)).toBe(view);
    for (const change of [
      { id: "figma-a-new-snapshot" },
      { website: "https://figma.example.com" },
      { createdAt: "2026-11-04T00:00:00.000Z" },
      { origin: "curated" as const },
    ]) {
      const guide = { ...auditedSnapshot(), ...change };
      expect(isAuditedFigmaSnapshot(guide)).toBe(false);
      expect(applyProviderCorrections(guide)).toBe(guide);
    }
  });

  it("keeps private publication, public review and optional listing on distinct launch paths", () => {
    const guide = auditedSnapshot();
    guide.checklist = Array.from({ length: 13 }, (_, index) => ({
      id: `figma-${String(index + 1).padStart(3, "0")}`,
      title: `Historical step ${index + 1}`,
      description: "A historical generated instruction.",
      actor: "developer" as const,
      sectionId: "distribution" as const,
    }));
    const view = applyProviderCorrections(guide);
    const byId = (id: string) => view.checklist.find((step) => step.id === id)!;
    expect(byId("figma-010").applicability).toBe("internal");
    expect(byId("figma-011").applicability).toBe("public");
    expect(byId("figma-012").dependsOn).toEqual(["figma-009", "figma-011"]);
    expect(byId("figma-013").applicability).toBe("marketplace");
    expect(byId("figma-013").requirementType).toBe("optional");
    expect(byId("figma-005").dependsOn).toEqual(["figma-001"]);
    expect(byId("figma-011").dependsOn).toEqual(["figma-006"]);
    expect(byId("figma-012").recoveryOwner).toContain("Figma reviewer");
    expect(() => validateGuideEvidence(view)).not.toThrow();
  });
});

describe("audited live Figma planning amendment", () => {
  function livePlanningSnapshot(): Guide {
    const guide = auditedSnapshot();
    guide.id = "figma-fe206d20-77d";
    guide.createdAt = "2026-11-03T16:48:25.968Z";
    guide.sources[0].id = "s1";
    guide.sources[0].url =
      "https://developers.figma.com/docs/rest-api/oauth-apps/";
    for (const section of guide.sections)
      for (const claim of section.claims)
        claim.sourceIds = claim.sourceIds.map((id) =>
          id === "gh-create" ? "s1" : id,
        );
    guide.checklist = Array.from({ length: 14 }, (_, index) => ({
      id: `figma-oauth-${String(index + 1).padStart(3, "0")}`,
      title: `Original live step ${index + 1}`,
      description: "Original generated instruction.",
      actor: "developer" as const,
      sectionId: "review" as const,
      dependsOn: index ? [`figma-oauth-${String(index).padStart(3, "0")}`] : [],
      sourceIds: ["s1"],
      applicability: "public" as const,
      requirementType: "required" as const,
    }));
    return guide;
  }

  it("separates audience decision, preparation, actual submission and provider decision", () => {
    const raw = livePlanningSnapshot();
    const before = JSON.stringify(raw);
    const view = applyProviderCorrections(raw);
    const byId = (id: string) => view.checklist.find((step) => step.id === id)!;
    expect(isAuditedFigmaPlanningSnapshot(raw)).toBe(true);
    expect(byId("figma-oauth-010").title).toBe(
      "Decide the intended publication audience",
    );
    expect(byId("figma-oauth-010").dependsOn).toEqual(["figma-oauth-001"]);
    expect(byId("figma-oauth-010").description).toContain(
      "audience decision only",
    );
    expect(byId("figma-oauth-011").dependsOn).toEqual([
      "figma-oauth-009",
      "figma-oauth-010",
    ]);
    expect(byId("figma-oauth-012").dependsOn).toEqual(["figma-oauth-011"]);
    expect(byId("figma-oauth-015").dependsOn).toEqual([
      "figma-oauth-009",
      "figma-oauth-011",
      "figma-oauth-012",
      "figma-oauth-013",
    ]);
    expect(byId("figma-oauth-015").actor).toBe("developer");
    expect(byId("figma-oauth-016").dependsOn).toEqual(["figma-oauth-015"]);
    expect(byId("figma-oauth-016").actor).toBe("provider");
    expect(byId("figma-oauth-016").description).toContain(
      "time and outcome remain unknown",
    );
    expect(byId("figma-oauth-013").requirementType).toBe("optional");
    expect(byId("figma-oauth-013").dependsOn).toEqual(["figma-oauth-010"]);
    expect(byId("figma-oauth-013").title).not.toMatch(/avoid|do not/i);
    expect(view.warnings.at(-1)).toContain(
      "Public-unlisted availability remains unresolved",
    );
    expect(view.sections).toEqual(raw.sections);
    expect(view.sources).toEqual(raw.sources);
    expect(JSON.stringify(raw)).toBe(before);
    expect(() => guideSchema.parse(view)).not.toThrow();
    expect(() => validateGuideEvidence(view)).not.toThrow();
    expect(applyProviderCorrections(view)).toBe(view);
  });

  it("does not alter a lookalike, newer, or incomplete snapshot", () => {
    for (const change of [
      { id: "figma-fe206d20-new" },
      { createdAt: "2026-11-03T16:48:26.000Z" },
      { website: "https://untrusted.example" },
      { sources: [] },
    ]) {
      const guide = { ...livePlanningSnapshot(), ...change };
      expect(isAuditedFigmaPlanningSnapshot(guide)).toBe(false);
      expect(applyProviderCorrections(guide)).toBe(guide);
    }
    const incomplete = livePlanningSnapshot();
    incomplete.checklist = incomplete.checklist.slice(0, 8);
    expect(applyProviderCorrections(incomplete)).toBe(incomplete);
  });

  it("keeps submission gated by readiness and optional listing preparation only when selected", () => {
    const view = applyProviderCorrections(livePlanningSnapshot());
    const progress: Record<string, ChecklistStatus> = Object.fromEntries(
      view.checklist
        .filter(
          (step) =>
            ![
              "figma-oauth-012",
              "figma-oauth-013",
              "figma-oauth-015",
              "figma-oauth-016",
            ].includes(step.id),
        )
        .map((step) => [step.id, "completed"]),
    );
    const path = { ...defaultLaunchPath, audience: "public" as const };
    expect(
      getGuideNextStep(view, progress, path).actionableSteps.map(
        (step) => step.id,
      ),
    ).not.toContain("figma-oauth-015");
    progress["figma-oauth-012"] = "completed";
    const noListing = getGuideNextStep(view, progress, path);
    expect(noListing.step?.id).toBe("figma-oauth-015");
    expect(noListing.actionableSteps.map((step) => step.id)).not.toContain(
      "figma-oauth-016",
    );
    const listing = getGuideNextStep(view, progress, {
      ...path,
      marketplaceListing: true,
    });
    expect(listing.step?.id).toBe("figma-oauth-013");
    expect(listing.actionableSteps.map((step) => step.id)).not.toContain(
      "figma-oauth-015",
    );
    progress["figma-oauth-013"] = "completed";
    expect(
      getGuideNextStep(view, progress, { ...path, marketplaceListing: true })
        .step?.id,
    ).toBe("figma-oauth-015");
  });
});

describe("curated planning and timing corrections", () => {
  it("separates branding branches from unknown total Google approval", () => {
    const google = seedGuides.find((guide) => guide.id === "google")!;
    expect(google.approval.status).toBe("unknown");
    const review = google.sections.find((section) => section.id === "review")!;
    const timing = review.claims.find((claim) =>
      /two branches/.test(claim.text),
    )!;
    expect(timing.status).toBe("source-confirmed");
    expect(timing.text).toMatch(/minutes.*2–3 business days/);
    expect(timing.text).toContain("not total");
    expect(
      google.sources.find((source) => source.id === "go-brand")?.retrievedAt,
    ).toBe(FIGMA_CORRECTION_RETRIEVED_AT);
  });

  it("scopes Slack timing to Marketplace review and gives every curated step concrete dependencies and recovery", () => {
    const slack = seedGuides.find((guide) => guide.id === "slack")!;
    const review = slack.sections.find((section) => section.id === "review")!;
    const timing = review.claims.find((claim) =>
      /10 business days/.test(claim.text),
    )!;
    expect(timing.text).toMatch(/10 weeks.*6 weeks/);
    expect(timing.conditions?.join(" ")).toContain(
      "not an internal workspace installation",
    );
    for (const guide of seedGuides) {
      for (const step of guide.checklist) {
        expect(step.dependsOn).toBeDefined();
        expect(step.sourceIds?.length).toBeGreaterThan(0);
        expect(step.recovery?.length).toBeGreaterThan(50);
        expect(step.recoveryOwner).toBeTruthy();
        expect(step.applicability).toBeTruthy();
        expect(step.requirementType).toBeTruthy();
      }
      expect(() => validateGuideEvidence(guide)).not.toThrow();
    }
    // Public commercial Slack apps must not hide mandatory listing obligations
    // simply because the reader did not opt into an optional discovery listing.
    expect(
      slack.checklist.find((step) => step.id === "sl-submit")?.applicability,
    ).toBe("public");
    expect(
      slack.checklist.find((step) => step.id === "sl-submit")?.requirementType,
    ).toBe("conditional");
    expect(
      seedGuides[0].checklist.find((step) => step.id === "gh-scope")?.dependsOn,
    ).toEqual(["gh-model"]);
  });
});
