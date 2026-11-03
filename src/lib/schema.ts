import { z } from "zod";

export const evidenceStatusSchema = z.enum([
  "source-confirmed",
  "agent-tested",
  "estimate",
  "unknown",
]);
export const sourceSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    url: z
      .url()
      .refine((v) => v.startsWith("https://"), "Sources must use HTTPS"),
    retrievedAt: z.iso.datetime(),
    publisher: z.string().min(1),
    excerpt: z.string().max(800),
    retrieval: z
      .object({
        status: z.enum(["retrieved", "unavailable"]),
        checkedAt: z.iso.datetime(),
        contentHash: z.string().optional(),
        authority: z.enum(["provider-domain", "unverified"]),
        detail: z.string(),
      })
      .strict()
      .optional(),
  })
  .strict();
export const supportingEvidenceSchema = z
  .object({
    sourceId: z.string().min(1),
    passage: z.string().min(1).max(1800),
    assessment: z.enum(["supports", "contradicts", "insufficient"]),
    explanation: z.string().max(1200),
    match: z.enum(["matched", "not-found", "unavailable"]).optional(),
    checkedAt: z.iso.datetime().optional(),
  })
  .strict();
export const claimSchema = z
  .object({
    text: z.string().min(1),
    status: evidenceStatusSchema,
    sourceIds: z.array(z.string()),
    conditions: z.array(z.string().max(500)).max(10).optional(),
    evidence: z.array(supportingEvidenceSchema).max(10).optional(),
    verification: z
      .object({
        status: z.enum([
          "passage-matched",
          "unverified",
          "conflicting",
          "unsupported",
        ]),
        explanation: z.string(),
        checkedAt: z.iso.datetime(),
      })
      .strict()
      .optional(),
  })
  .strict();
export const sectionIds = [
  "prerequisites",
  "registration",
  "scopes",
  "redirects",
  "credentials",
  "testing",
  "review",
  "distribution",
  "troubleshooting",
] as const;
export const sectionSchema = z
  .object({
    id: z.enum(sectionIds),
    title: z.string().min(1),
    summary: z.string().min(1),
    claims: z.array(claimSchema).min(1),
  })
  .strict();
export const stepSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    actor: z.enum(["developer", "agent", "provider"]),
    sectionId: z.enum(sectionIds),
    dependsOn: z.array(z.string()).max(20).optional(),
    sourceIds: z.array(z.string()).max(10).optional(),
    recovery: z.string().max(1500).optional(),
  })
  .strict();
export const guideContentSchema = z
  .object({
    provider: z.string().min(1).max(100),
    website: z.url(),
    description: z.string().min(1).max(600),
    category: z.string().min(1),
    oauthSupport: z.enum(["supported", "unclear", "unsupported"]),
    difficulty: z.enum(["Straightforward", "Moderate", "Involved", "Unknown"]),
    effort: claimSchema,
    approval: claimSchema,
    sections: z.array(sectionSchema).length(9),
    checklist: z.array(stepSchema).min(1).max(20),
    sources: z.array(sourceSchema).max(25),
    blockers: z.array(claimSchema),
    automation: z
      .object({
        canDo: z.array(z.string()).min(1),
        requiresHuman: z.array(z.string()).min(1),
        neverDoes: z.array(z.string()).min(1),
      })
      .strict(),
    warnings: z.array(z.string()),
  })
  .strict();
// New research uses required fields for strict structured output. Stored snapshots
// remain backward compatible; server-only verification is never model-authored.
const researchClaimSchema = claimSchema
  .omit({ verification: true, evidence: true })
  .extend({
    conditions: z.array(z.string().max(500)).max(10),
    evidence: z
      .array(supportingEvidenceSchema.omit({ match: true, checkedAt: true }))
      .max(10),
  });
export const researchGuideContentSchema = guideContentSchema
  .extend({
    effort: researchClaimSchema,
    approval: researchClaimSchema,
    blockers: z.array(researchClaimSchema),
    sections: z
      .array(
        sectionSchema.extend({ claims: z.array(researchClaimSchema).min(1) }),
      )
      .length(9),
    sources: z.array(sourceSchema.omit({ retrieval: true })).max(25),
    checklist: z
      .array(
        stepSchema.extend({
          dependsOn: z.array(z.string()).max(20),
          sourceIds: z.array(z.string()).max(10),
          recovery: z.string().max(1500),
        }),
      )
      .min(1)
      .max(20),
  })
  .strict();
export const guideSchema = guideContentSchema
  .extend({
    id: z.string().min(1),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    origin: z.enum(["curated", "researched"]),
  })
  .strict();
export type Guide = z.infer<typeof guideSchema>;
export type GuideContent = z.infer<typeof guideContentSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type SectionId = (typeof sectionIds)[number];
export type EvidenceStatus = z.infer<typeof evidenceStatusSchema>;
export const checklistStatusSchema = z.enum([
  "not-started",
  "in-progress",
  "blocked",
  "completed",
]);
export type ChecklistStatus = z.infer<typeof checklistStatusSchema>;

function safeProviderInput(value: string): boolean {
  // Stop common accidental credential pastes before they reach the research service.
  if (
    /(?:\bsk-(?:proj-)?[a-z0-9_-]{12,}|\bxox[baprs]-[a-z0-9-]{10,}|\bgh[pousr]_[a-z0-9_]{15,}|\bgithub_pat_[a-z0-9_]{15,}|\bAIza[a-z0-9_-]{20,}|\bBearer\s+\S+|\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+)/i.test(
      value,
    )
  )
    return false;
  if (
    /\b(?:client_secret|access_token|refresh_token|api_key|apikey|password|authorization)\s*[:=]\s*\S+/i.test(
      value,
    )
  )
    return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) && !/^https?:\/\//i.test(value))
    return false;
  if (/^https?:/i.test(value) || (!/\s/.test(value) && /[@/?#.]/.test(value))) {
    try {
      const url = new URL(
        /^https?:\/\//i.test(value) ? value : `https://${value}`,
      );
      if (url.username || url.password) return false;
      for (const [key, entry] of [
        ...url.searchParams,
        ...new URLSearchParams(url.hash.slice(1)),
      ]) {
        if (
          /^(?:client_secret|access_token|refresh_token|api_key|apikey|password|authorization)$/i.test(
            key,
          ) &&
          entry
        )
          return false;
      }
    } catch {
      return false;
    }
  }
  return true;
}
export const researchInputSchema = z
  .object({
    query: z
      .string()
      .trim()
      .min(2, "Enter a provider name or website (at least 2 characters).")
      .max(160, "Keep the provider name or website under 160 characters.")
      .refine(
        (v) => !/[\x00-\x1f<>]/.test(v),
        "Enter a plain provider name or public website.",
      )
      .refine(
        safeProviderInput,
        "Enter only a provider name or public website. Remove credentials, tokens, and secret parameters.",
      ),
  })
  .strict();
export type ResearchPhase =
  | "accepted"
  | "searching"
  | "source-found"
  | "synthesizing"
  | "validating"
  | "saving"
  | "complete"
  | "error";
export type ResearchEvent = {
  phase: ResearchPhase;
  message: string;
  timestamp: string;
  url?: string;
  guideId?: string;
  code?: string;
};

export function validateGuideEvidence(guide: GuideContent): void {
  const ids = new Set(guide.sources.map((s) => s.id));
  if (ids.size !== guide.sources.length)
    throw new Error("Duplicate source IDs.");
  if (new Set(guide.sections.map((s) => s.id)).size !== 9)
    throw new Error("Every guide section must appear exactly once.");
  if (new Set(guide.checklist.map((s) => s.id)).size !== guide.checklist.length)
    throw new Error("Duplicate checklist IDs.");
  const steps = new Map(guide.checklist.map((step) => [step.id, step]));
  for (const step of guide.checklist) {
    if (step.sourceIds?.some((id) => !ids.has(id)))
      throw new Error("A checklist step references a missing source.");
    if (step.dependsOn?.some((id) => !steps.has(id) || id === step.id))
      throw new Error("A checklist dependency is missing or refers to itself.");
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id))
      throw new Error("Checklist dependencies must not contain a cycle.");
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of steps.get(id)?.dependsOn || []) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of steps.keys()) visit(id);
  const claims = [
    guide.effort,
    guide.approval,
    ...guide.blockers,
    ...guide.sections.flatMap((s) => s.claims),
  ];
  for (const claim of claims) {
    if (claim.sourceIds.some((id) => !ids.has(id)))
      throw new Error("A claim references a missing source.");
    if (claim.status === "source-confirmed" && !claim.sourceIds.length)
      throw new Error("Confirmed claims require source evidence.");
    if (claim.status === "agent-tested")
      throw new Error(
        "AuthPilot does not execute OAuth setup; agent-tested claims are not allowed.",
      );
  }
}
