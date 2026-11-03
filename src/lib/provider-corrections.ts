import type { Claim, Guide, Source } from "./schema";

export const FIGMA_CORRECTION_SOURCE_ID = "authpilot-figma-correction-20261103";
export const FIGMA_CORRECTION_RETRIEVED_AT = "2026-11-03T16:30:40.000Z";
const FIGMA_AUDITED_SNAPSHOT_ID = "figma-5c8d411d-77e";
const FIGMA_PLANNING_SNAPSHOT_ID = "figma-fe206d20-77d";
const FIGMA_PLANNING_SNAPSHOT_CREATED_AT = "2026-11-03T16:48:25.968Z";
export const FIGMA_PLANNING_CORRECTED_AT = "2026-11-03T16:55:07.000Z";
const planningCorrectionNotice =
  "Planning correction — 3 November 2026, 16:55 UTC: the publication-choice task is now a decision only; public submission follows developer tests, reviewer materials, and readiness checks, then a separate provider-decision task. Optional Community preparation is separate. Public-unlisted availability remains unresolved for your exact app: check the current console before committing to that route. Claims, source checks, original retrieval dates, and the stored snapshot are unchanged; this manual checklist amendment is not a new retrieval, approval prediction, or executed setup.";
const correctionNotice =
  "Documentation correction — 3 November 2026: this Figma snapshot's refresh-token-rotation testing wording was inaccurate, and its authorization checklist omitted recommended S256 PKCE. Dated manual amendments in Setup steps and testing also distinguish private publication, public review, and optional Community listing. The original stored snapshot is retained; no OAuth setup or token exchange was performed.";

type StepAmendment = Pick<
  Guide["checklist"][number],
  "dependsOn" | "applicability" | "requirementType" | "recoveryOwner"
>;
const figmaStepAmendments: Record<string, StepAmendment> = {
  "figma-001": {
    dependsOn: [],
    applicability: "all",
    requirementType: "required",
    recoveryOwner: "Developer and owning team/organization administrator",
  },
  "figma-002": {
    dependsOn: ["figma-001"],
    applicability: "all",
    requirementType: "required",
    recoveryOwner: "Developer and owning team/organization administrator",
  },
  "figma-003": {
    dependsOn: ["figma-002"],
    applicability: "all",
    requirementType: "required",
    recoveryOwner: "App owner and server operator",
  },
  "figma-004": {
    dependsOn: ["figma-002"],
    applicability: "all",
    requirementType: "required",
    recoveryOwner: "Integration developer",
  },
  "figma-005": {
    dependsOn: ["figma-001"],
    applicability: "all",
    requirementType: "required",
    recoveryOwner: "Developer and product owner",
  },
  "figma-006": {
    dependsOn: ["figma-001"],
    applicability: "all",
    requirementType: "required",
    recoveryOwner: "Product owner and app owner",
  },
  "figma-007": {
    dependsOn: ["figma-003", "figma-004", "figma-005"],
    applicability: "all",
    requirementType: "required",
    recoveryOwner: "Integration developer",
  },
  "figma-008": {
    dependsOn: ["figma-007"],
    applicability: "all",
    requirementType: "required",
    recoveryOwner: "Integration developer",
  },
  "figma-009": {
    dependsOn: ["figma-008"],
    applicability: "all",
    requirementType: "required",
    recoveryOwner: "Developer and eligible test user",
  },
  "figma-010": {
    dependsOn: ["figma-006", "figma-009"],
    applicability: "internal",
    requirementType: "required",
    recoveryOwner: "App owner",
  },
  "figma-011": {
    dependsOn: ["figma-006"],
    applicability: "public",
    requirementType: "required",
    recoveryOwner: "Developer and product owner",
  },
  "figma-012": {
    dependsOn: ["figma-009", "figma-011"],
    applicability: "public",
    requirementType: "required",
    recoveryOwner: "Developer submits; Figma reviewer decides",
  },
  "figma-013": {
    dependsOn: ["figma-012"],
    applicability: "marketplace",
    requirementType: "optional",
    recoveryOwner: "Developer and Community reviewer",
  },
};

export function isManualCorrectionSource(source: Source) {
  return source.id === FIGMA_CORRECTION_SOURCE_ID;
}

export function isManualCorrectionClaim(claim: Claim) {
  return claim.sourceIds.includes(FIGMA_CORRECTION_SOURCE_ID);
}

export function isAuditedFigmaSnapshot(guide: Guide) {
  try {
    return (
      guide.id === FIGMA_AUDITED_SNAPSHOT_ID &&
      guide.origin === "researched" &&
      guide.provider.trim().toLowerCase() === "figma" &&
      ["figma.com", "www.figma.com", "developers.figma.com"].includes(
        new URL(guide.website).hostname.toLowerCase(),
      ) &&
      Date.parse(guide.createdAt) <= Date.parse(FIGMA_CORRECTION_RETRIEVED_AT)
    );
  } catch {
    return false;
  }
}

export function isAuditedFigmaPlanningSnapshot(guide: Guide) {
  try {
    return (
      guide.id === FIGMA_PLANNING_SNAPSHOT_ID &&
      guide.createdAt === FIGMA_PLANNING_SNAPSHOT_CREATED_AT &&
      guide.origin === "researched" &&
      guide.provider.trim().toLowerCase() === "figma" &&
      ["figma.com", "www.figma.com", "developers.figma.com"].includes(
        new URL(guide.website).hostname.toLowerCase(),
      ) &&
      guide.sources.some(
        (source) =>
          source.id === "s1" &&
          source.url ===
            "https://developers.figma.com/docs/rest-api/oauth-apps/",
      )
    );
  } catch {
    return false;
  }
}

function amendFigmaPlanning(guide: Guide): Guide {
  if (guide.warnings.includes(planningCorrectionNotice)) return guide;
  const requiredIds = [
    "figma-oauth-001",
    "figma-oauth-009",
    "figma-oauth-010",
    "figma-oauth-011",
    "figma-oauth-012",
    "figma-oauth-013",
  ];
  if (
    requiredIds.some((id) => !guide.checklist.some((step) => step.id === id)) ||
    guide.checklist.some((step) =>
      ["figma-oauth-015", "figma-oauth-016"].includes(step.id),
    ) ||
    guide.checklist.length > 18
  )
    return guide;

  const result = structuredClone(guide);
  const decision = result.checklist.find(
    (step) => step.id === "figma-oauth-010",
  )!;
  Object.assign(decision, {
    title: "Decide the intended publication audience",
    description:
      "Choose associated-team/organization private use or public use. This is an audience decision only; complete developer tests, reviewer materials, and readiness checks before the separate public submission task.",
    dependsOn: ["figma-oauth-001"],
    applicability: "all",
    recovery:
      "Confirm the intended users with the product owner. Keep the choice separate from publishing or submitting; review the public/private definitions in the existing Figma OAuth documentation.",
    recoveryOwner: "Developer and product owner",
  });
  result.checklist.find((step) => step.id === "figma-oauth-011")!.dependsOn = [
    "figma-oauth-009",
    "figma-oauth-010",
  ];
  result.checklist.find((step) => step.id === "figma-oauth-012")!.dependsOn = [
    "figma-oauth-011",
  ];
  const listing = result.checklist.find(
    (step) => step.id === "figma-oauth-013",
  )!;
  Object.assign(listing, {
    title: "Prepare optional Community listing materials",
    description:
      "If Community discovery is wanted, prepare listing assets and inspect the current listing workflow. This optional preparation does not replace the required public OAuth review path; public-unlisted availability for this exact app remains unresolved.",
    dependsOn: ["figma-oauth-010"],
    sourceIds: ["s1"],
    applicability: "marketplace",
    requirementType: "optional",
    recovery:
      "Gather the requested listing assets if listing is wanted. If the public-unlisted route is unclear, verify the current console independently of this optional task before promising launch availability.",
    recoveryOwner: "Developer and product owner",
  });
  result.checklist.push(
    {
      id: "figma-oauth-015",
      title: "Submit the public OAuth app for review",
      description:
        "After developer tests, reviewer materials, and readiness checks are complete, use Figma's public-app submission flow. The developer submits; submission does not itself grant approval or authorize general users.",
      actor: "developer",
      sectionId: "review",
      dependsOn: [
        "figma-oauth-009",
        "figma-oauth-011",
        "figma-oauth-012",
        "figma-oauth-013",
      ],
      sourceIds: ["s1"],
      recovery:
        "Resolve the console's submission errors and missing reviewer access or instructions. Do not submit an untested app; return to the unmet prerequisite before trying again.",
      recoveryOwner: "Integration developer",
      applicability: "public",
      requirementType: "required",
    },
    {
      id: "figma-oauth-016",
      title: "Await Figma's public-app decision",
      description:
        "Monitor the submitted review and respond to requested changes. Figma decides whether the public app is approved; the actual decision time and outcome remain unknown.",
      actor: "provider",
      sectionId: "review",
      dependsOn: ["figma-oauth-015"],
      sourceIds: ["s1"],
      recovery:
        "Read the review status and feedback in the provider console, address requested corrections, and resubmit when instructed. AuthPilot cannot grant approval or predict the decision.",
      recoveryOwner: "Figma reviewer; developer responds",
      applicability: "public",
      requirementType: "required",
    },
  );
  result.warnings.push(planningCorrectionNotice);
  return result;
}

function manualClaim(text: string, condition: string): Claim {
  return {
    text,
    status: "source-confirmed",
    sourceIds: [FIGMA_CORRECTION_SOURCE_ID],
    conditions: [
      "Manual AuthPilot documentation correction, reviewed 3 November 2026; no server-checked quotation or executed OAuth setup.",
      condition,
    ],
  };
}

/**
 * Dated view amendment for the one audited historical snapshot. Never mutates
 * the database document, future generated guides, or unrelated provider data.
 * The amendment is manually sourced, not a fabricated model/server check.
 */
export function applyProviderCorrections(guide: Guide): Guide {
  if (isAuditedFigmaPlanningSnapshot(guide)) return amendFigmaPlanning(guide);
  if (
    !isAuditedFigmaSnapshot(guide) ||
    guide.warnings.includes(correctionNotice)
  )
    return guide;

  const result = structuredClone(guide);
  if (!result.sources.some(isManualCorrectionSource)) {
    // Preserve the schema's source bound even for an unexpected legacy shape.
    if (result.sources.length >= 25) return guide;
    result.sources.push({
      id: FIGMA_CORRECTION_SOURCE_ID,
      title: "Figma OAuth apps — manual documentation correction",
      url: "https://developers.figma.com/docs/rest-api/oauth-apps/",
      publisher: "Figma Developer Docs",
      retrievedAt: FIGMA_CORRECTION_RETRIEVED_AT,
      excerpt:
        "Manual audit summary: reuse the refresh token to replace access tokens; S256 PKCE is recommended for authorization.",
    });
  }
  result.warnings.push(correctionNotice);
  for (const step of result.checklist) {
    const amendment = figmaStepAmendments[step.id];
    if (!amendment) continue;
    Object.assign(step, amendment);
    step.sourceIds = [
      ...new Set([...(step.sourceIds || []), FIGMA_CORRECTION_SOURCE_ID]),
    ];
    if (step.id === "figma-005")
      step.recovery =
        "Plan the minimum scopes from intended endpoint calls while registration access is resolved. Apply the selected scopes in app configuration once registration is available.";
    if (step.id === "figma-006")
      step.recovery =
        "Decide whether users stay within the associated team/organization or need public access. Treat Community discovery as a separate optional listing decision; update Your launch path to match.";
    if (step.id === "figma-011")
      step.recovery =
        "Prepare the app description and reviewer instructions while implementation continues. Complete the working developer tests before submitting the public app.";
  }

  for (const section of result.sections) {
    for (const claim of section.claims) {
      if (/refresh[ -]token\s+rotation/i.test(claim.text)) {
        claim.status = "unknown";
        claim.verification = {
          status: "unsupported",
          checkedAt: FIGMA_CORRECTION_RETRIEVED_AT,
          explanation:
            "Manual documentation correction: this retained testing suggestion incorrectly implies refresh-token rotation. Figma documents refresh-token reuse and replacement of the access token. The original wording is retained for transparency; use the dated correction below.",
        };
      }
    }
    if (section.id === "testing")
      section.claims.push(
        manualClaim(
          "Figma refresh testing: retain the reusable refresh token, store the replacement access token, and check that the earlier access token stops working. This is access-token replacement, not documented refresh-token rotation. These tests remain for the developer to execute.",
          "Long-lived Figma REST API OAuth integration using the documented refresh flow.",
        ),
      );
    if (section.id === "redirects")
      section.claims.push(
        manualClaim(
          "Figma recommends PKCE for authorization. Generate the challenge with S256 and provide its code_verifier during code exchange; keep state validation. PKCE is recommended, not a requirement asserted for all clients.",
          "Authorization-code flow; provide code_verifier when PKCE was used in authorization.",
        ),
      );
  }

  const authorizationStep = result.checklist.find(
    (step) =>
      /authoriz|oauth flow|implement.*flow/i.test(step.title) &&
      step.sectionId !== "review" &&
      step.sectionId !== "distribution",
  );
  if (authorizationStep && !/S256/i.test(authorizationStep.description)) {
    authorizationStep.description +=
      " Documentation correction (3 Nov 2026): include recommended S256 PKCE and its matching code_verifier at exchange; continue validating state.";
    authorizationStep.sourceIds = [
      ...new Set([
        ...(authorizationStep.sourceIds || []),
        FIGMA_CORRECTION_SOURCE_ID,
      ]),
    ];
  }
  return result;
}
