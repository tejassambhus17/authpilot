import { defaultLaunchPath, type Guide, type LaunchPath } from "@/lib/schema";

export function getStepApplicability(
  step: Guide["checklist"][number],
  path: LaunchPath = defaultLaunchPath,
): { excluded: boolean; reason: string } {
  const audience =
    path.audience === "internal" && path.marketplaceListing
      ? "unsure"
      : path.audience;
  if (
    step.applicability === "marketplace" &&
    step.requirementType === "optional" &&
    !path.marketplaceListing
  )
    return {
      excluded: true,
      reason:
        "Optional marketplace listing is outside your selected launch path.",
    };
  if (step.applicability === "public" && audience === "internal")
    return {
      excluded: true,
      reason:
        "This step is explicitly scoped to public distribution; your selected audience is internal.",
    };
  if (step.applicability === "internal" && audience === "public")
    return {
      excluded: true,
      reason:
        "This step is explicitly scoped to an internal app; your selected audience is public.",
    };
  return { excluded: false, reason: "" };
}

export function getPlanningEstimate(guide: Guide) {
  if (guide.oauthSupport !== "supported")
    return {
      registration: null,
      implementation: null,
      assumptions: [
        "OAuth support must be established before estimating executable setup work.",
      ],
      baseline: true,
    };
  if (guide.planning) return { ...guide.planning, baseline: false };
  return {
    registration: null,
    implementation: null,
    assumptions: [
      "This snapshot records a narrative estimate, without separate registration and implementation ranges. No numeric fallback is substituted.",
      "Preserve the conditions and exclusions in the recorded estimate; it is an unmeasured planning judgment, not a provider-measured duration.",
      "Provider approval waiting is separate. Account permissions, existing implementation, requested scopes, and review feedback can change the work.",
    ],
    baseline: true,
  };
}

export function formatDuration(
  range: { minMinutes: number; maxMinutes: number } | null,
) {
  if (!range) return "Unknown — no reliable range recorded";
  if (range.minMinutes >= 60 && range.maxMinutes >= 60)
    return `${Number((range.minMinutes / 60).toFixed(1))}–${Number((range.maxMinutes / 60).toFixed(1))} hours`;
  return `${range.minMinutes}–${range.maxMinutes} minutes`;
}
