import { describe, expect, it } from "vitest";
import { seedGuides } from "@/lib/seed-guides";
import { guideForReading } from "@/lib/claim-evidence";
import { validateGuideEvidence } from "@/lib/schema";
import { guideToMarkdown } from "@/lib/server/markdown";

describe("snapshot safety and compatibility", () => {
  it("keeps curated manual-audit evidence unchanged", () => {
    expect(guideForReading(seedGuides[0])).toBe(seedGuides[0]);
  });
  it("makes unsupported legacy consequential claims unknown without overwriting snapshot content", () => {
    const raw = structuredClone(seedGuides[0]);
    raw.origin = "researched";
    raw.approval = {
      text: "Provider approval is mandatory and takes two days.",
      status: "source-confirmed",
      sourceIds: [raw.sources[0].id],
    };
    const before = JSON.stringify(raw);
    const view = guideForReading(raw);
    expect(view.approval.status).toBe("unknown");
    expect(view.approval.verification?.status).toBe("unverified");
    expect(view.approval.text).toBe(raw.approval.text);
    expect(JSON.stringify(raw)).toBe(before);
    expect(guideForReading(view).warnings).toEqual(view.warnings);
  });
  it("retains new checked assertions and exports conditions, passage status, dependencies and recovery", () => {
    const guide = structuredClone(seedGuides[0]);
    guide.origin = "researched";
    guide.approval = {
      text: "Listing review applies only when seeking a listing.",
      status: "source-confirmed",
      sourceIds: [guide.sources[0].id],
      conditions: ["Optional directory listing"],
      evidence: [
        {
          sourceId: guide.sources[0].id,
          passage:
            "Applications submitted for a directory listing are reviewed.",
          assessment: "supports",
          explanation: "Fixture assessment only.",
          match: "matched",
          checkedAt: guide.updatedAt,
        },
      ],
      verification: {
        status: "passage-matched",
        explanation: "Fixture server result.",
        checkedAt: guide.updatedAt,
      },
    };
    guide.checklist[0] = {
      ...guide.checklist[0],
      dependsOn: [],
      sourceIds: [guide.sources[0].id],
      recovery: "Read the listing submission guidance.",
    };
    const view = guideForReading(guide);
    expect(view.approval.status).toBe("source-confirmed");
    const markdown = guideToMarkdown(view);
    expect(markdown).toContain(
      "Applicable conditions: Optional directory listing",
    );
    expect(markdown).toContain("Matched source statement");
    expect(markdown).toContain(
      "If blocked: Read the listing submission guidance.",
    );
    expect(markdown).toContain("Step documentation:");
  });
  it("does not present an inconsistent pre-retrieval claim stamp as a verified assessment time", () => {
    const guide = structuredClone(seedGuides[0]);
    guide.origin = "researched";
    const source = guide.sources[0];
    source.retrieval = {
      status: "retrieved",
      authority: "provider-domain",
      checkedAt: "2026-11-03T14:03:00.000Z",
      detail: "Fixture fetch",
    };
    guide.approval = {
      text: "A fixture requirement.",
      status: "source-confirmed",
      sourceIds: [source.id],
      evidence: [
        {
          sourceId: source.id,
          passage: "A fixture passage retained in the source.",
          assessment: "supports",
          explanation: "Fixture only",
          match: "matched",
        },
      ],
      verification: {
        status: "passage-matched",
        checkedAt: "2026-11-03T14:00:00.000Z",
        explanation: "Old fixture stamp",
      },
    };
    const before = JSON.stringify(guide);
    const view = guideForReading(guide);
    expect(view.approval.status).toBe("unknown");
    expect(view.approval.verification?.explanation).toContain(
      "timestamp is inconsistent",
    );
    expect(JSON.stringify(guide)).toBe(before);
  });
});

describe("checklist contract integrity", () => {
  it("rejects missing and cyclic dependencies before persistence", () => {
    const guide = structuredClone(seedGuides[0]);
    guide.checklist[0].dependsOn = ["missing-step"];
    expect(() => validateGuideEvidence(guide)).toThrow("dependency");
    guide.checklist[0].dependsOn = [guide.checklist[1].id];
    guide.checklist[1].dependsOn = [guide.checklist[0].id];
    expect(() => validateGuideEvidence(guide)).toThrow("cycle");
  });
  it("rejects step-specific references to nonexistent sources", () => {
    const guide = structuredClone(seedGuides[0]);
    guide.checklist[0].sourceIds = ["missing-source"];
    expect(() => validateGuideEvidence(guide)).toThrow("missing source");
  });
});
