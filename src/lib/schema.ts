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
  })
  .strict();
export const claimSchema = z
  .object({
    text: z.string().min(1),
    status: evidenceStatusSchema,
    sourceIds: z.array(z.string()),
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
