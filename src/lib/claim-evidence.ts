import type { Claim, Guide, GuideContent } from "./schema";
import {
  applyProviderCorrections,
  isAuditedFigmaSnapshot,
  isManualCorrectionClaim,
} from "./provider-corrections";

export function collectClaims(content: GuideContent) {
  return [
    { claimId: "approval", claim: content.approval, section: "approval" },
    ...content.blockers.map((claim, index) => ({
      claimId: `blocker:${index}`,
      claim,
      section: "blockers",
    })),
    ...content.sections.flatMap((section) =>
      section.claims.map((claim, index) => ({
        claimId: `section:${section.id}:${index}`,
        claim,
        section: section.id,
      })),
    ),
    { claimId: "effort", claim: content.effort, section: "effort" },
  ];
}

export function consequentialClaim(section: string, claim: Claim) {
  return (
    ["approval", "review", "distribution", "blockers"].includes(section) ||
    /\b(?:approv\w*|review|marketplace|listing|admin\w* consent|business days?|turnaround|\d+\s*(?:days?|weeks?|hours?))\b/i.test(
      claim.text,
    )
  );
}

// A read-time safety view; the original immutable database snapshot is retained.
// Curated guides have a separate recorded human source audit.
export function guideForReading(guide: Guide): Guide {
  if (guide.origin !== "researched") return guide;
  const result = structuredClone(guide);
  let changed = 0;
  for (const { section, claim } of collectClaims(result)) {
    if (isAuditedFigmaSnapshot(result) && isManualCorrectionClaim(claim))
      continue;
    const lastSourceFetch = Math.max(
      0,
      ...(claim.evidence || []).map((item) => {
        const source = result.sources.find(
          (source) => source.id === item.sourceId,
        );
        return source?.retrieval?.status === "retrieved"
          ? Date.parse(source.retrieval.checkedAt)
          : 0;
      }),
    );
    if (
      claim.verification?.status === "passage-matched" &&
      Date.parse(claim.verification.checkedAt) < lastSourceFetch
    ) {
      claim.status = "unknown";
      claim.verification = {
        status: "unverified",
        checkedAt: new Date().toISOString(),
        explanation:
          "Safety view: this snapshot records a claim check before its source page retrieval. That check timestamp is inconsistent and is not presented as a verified assessment time. The stored passage is retained as context; research again for a corrected snapshot.",
      };
      changed++;
      continue;
    }
    if (
      claim.status === "source-confirmed" &&
      consequentialClaim(section, claim) &&
      claim.verification?.status !== "passage-matched"
    ) {
      claim.status = "unknown";
      claim.verification = {
        status: "unverified",
        explanation:
          "This older research snapshot has citation provenance but no recorded passage check and independent support assessment for this consequential claim. Verify the documentation before acting.",
        checkedAt: new Date().toISOString(),
      };
      changed++;
    }
  }
  if (changed)
    result.warnings.push(
      "Safety view: unsupported or inconsistent claim-evidence records are shown as unknown. The stored snapshot has not been overwritten; research again to obtain current passage checks.",
    );
  return applyProviderCorrections(result);
}
