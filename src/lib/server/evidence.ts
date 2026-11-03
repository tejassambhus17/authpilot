import "server-only";
import { z } from "zod";
import type { Claim, GuideContent } from "@/lib/schema";
import { collectClaims } from "@/lib/claim-evidence";
export { collectClaims } from "@/lib/claim-evidence";

export type EvidenceDocument = {
  sourceId: string;
  url: string;
  status: "retrieved" | "unavailable";
  text: string;
  fetchedAt: string;
  contentHash?: string;
  authority: "provider-domain" | "unverified";
  detail: string;
};
export const evidenceReviewSchema = z
  .object({
    claims: z
      .array(
        z
          .object({
            claimId: z.string(),
            verdict: z.enum(["supported", "contradicted", "insufficient"]),
            conditions: z.array(z.string().max(500)).max(10),
            explanation: z.string().max(1200),
            evidence: z
              .array(
                z
                  .object({
                    sourceId: z.string(),
                    passage: z.string().min(1).max(1800),
                    assessment: z.enum([
                      "supports",
                      "contradicts",
                      "insufficient",
                    ]),
                    explanation: z.string().max(1200),
                  })
                  .strict(),
              )
              .max(10),
          })
          .strict(),
      )
      .max(50),
  })
  .strict();
export type EvidenceReview = z.infer<typeof evidenceReviewSchema>;

export function normalizedPassage(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function applyEvidenceReview(
  content: GuideContent,
  documents: EvidenceDocument[],
  review: EvidenceReview | undefined,
  checkedAt: string,
): GuideContent {
  const result = structuredClone(content);
  const reviewed = new Map<string, EvidenceReview["claims"][number]>();
  const duplicateIds = new Set<string>();
  for (const item of review?.claims || []) {
    if (reviewed.has(item.claimId)) duplicateIds.add(item.claimId);
    reviewed.set(item.claimId, item);
  }
  for (const source of result.sources) {
    const document = documents.find(
      (item) => item.sourceId === source.id && item.url === source.url,
    );
    source.retrieval = document
      ? {
          status: document.status,
          checkedAt: document.fetchedAt,
          ...(document.contentHash
            ? { contentHash: document.contentHash }
            : {}),
          authority: document.authority,
          detail: document.detail,
        }
      : {
          status: "unavailable",
          checkedAt,
          authority: "unverified",
          detail:
            "This source was not retrieved within the bounded evidence pass.",
        };
  }
  let downgraded = 0;
  for (const { claimId, claim, section } of collectClaims(result)) {
    const assessment = duplicateIds.has(claimId)
      ? undefined
      : reviewed.get(claimId);
    const proposed = assessment?.evidence || claim.evidence || [];
    claim.evidence = proposed.map((item) => {
      const source = result.sources.find(
        (source) =>
          source.id === item.sourceId && claim.sourceIds.includes(source.id),
      );
      const document =
        source &&
        documents.find(
          (document) =>
            document.sourceId === source.id &&
            document.url === source.url &&
            document.status === "retrieved",
        );
      const passage = normalizedPassage(item.passage);
      const match = !document
        ? "unavailable"
        : passage.length >= 24 &&
            normalizedPassage(document.text).includes(passage)
          ? "matched"
          : "not-found";
      return {
        sourceId: item.sourceId,
        passage: item.passage,
        assessment: item.assessment,
        explanation: item.explanation,
        match,
        checkedAt,
      };
    });
    if (assessment) claim.conditions = assessment.conditions;
    const matchedSupport = claim.evidence.some(
      (item) =>
        item.match === "matched" &&
        item.assessment === "supports" &&
        documents.some(
          (document) =>
            document.sourceId === item.sourceId &&
            document.url ===
              result.sources.find((source) => source.id === item.sourceId)
                ?.url &&
            document.authority === "provider-domain" &&
            document.status === "retrieved" &&
            normalizedPassage(document.text).includes(
              normalizedPassage(item.passage),
            ),
        ),
    );
    const conflict =
      assessment?.verdict === "contradicted" ||
      claim.evidence.some(
        (item) => item.match === "matched" && item.assessment === "contradicts",
      );
    const unsupportedOAuthAction =
      result.oauthSupport !== "supported" &&
      [
        "registration",
        "credentials",
        "scopes",
        "redirects",
        "testing",
      ].includes(section);
    const supported =
      assessment?.verdict === "supported" &&
      matchedSupport &&
      !conflict &&
      !unsupportedOAuthAction;
    const status: NonNullable<Claim["verification"]>["status"] = conflict
      ? "conflicting"
      : supported
        ? "passage-matched"
        : assessment?.verdict === "insufficient" || unsupportedOAuthAction
          ? "unsupported"
          : "unverified";
    claim.verification = {
      status,
      checkedAt,
      explanation: unsupportedOAuthAction
        ? "OAuth support is unsupported or unresolved. Registration and execution requirements cannot be confirmed for this provider."
        : supported
          ? `A supporting passage was matched in a retrieved provider-domain document. A separate AI review assessed the claim as supported for the recorded conditions. This is not independent factual certification. ${assessment.explanation}`
          : conflict
            ? `The evidence review found conflicting or contradictory support. Resolve the discrepancy before acting. ${assessment?.explanation || ""}`
            : `Support was not established by both a matched provider-domain passage and a separate claim assessment. ${assessment?.explanation || "No independent assessment was recorded for this claim."}`,
    };
    // A model-authored stamp, summary, or retrieved URL is never sufficient.
    if (claim.status === "source-confirmed" && !supported) {
      claim.status = "unknown";
      downgraded++;
    }
    if (claimId === "approval" && claim.status === "estimate" && !supported) {
      claim.status = "unknown";
      downgraded++;
    }
  }
  if (downgraded)
    result.warnings.push(
      `Claim evidence check: ${downgraded} assertion(s) without sufficient matched, assessed support were marked unknown. Unknown claims remain visible for manual verification.`,
    );
  return result;
}
