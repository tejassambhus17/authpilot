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
    registration: { minMinutes: 15, maxMinutes: 45 },
    implementation: { minMinutes: 120, maxMinutes: 480 },
    assumptions: [
      "Generic planning baseline for one OAuth client, not a provider-measured duration.",
      "An existing web backend, a developer familiar with OAuth, required account permissions, and a working local redirect endpoint.",
      "Registration covers console setup; implementation covers the authorization callback, secure token storage, and developer-run happy-path/error tests.",
      "Excludes learning OAuth, new infrastructure, security assessment, administrator decisions, and provider approval waiting.",
    ],
    baseline: true,
  };
}

export function formatDuration(
  range: { minMinutes: number; maxMinutes: number } | null,
) {
  if (!range) return "Unknown — confirm the integration path first";
  if (range.minMinutes >= 60 && range.maxMinutes >= 60)
    return `${Number((range.minMinutes / 60).toFixed(1))}–${Number((range.maxMinutes / 60).toFixed(1))} hours`;
  return `${range.minMinutes}–${range.maxMinutes} minutes`;
}
