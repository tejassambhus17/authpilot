import type { ChecklistStatus, Guide } from "@/lib/schema";

type Step = Guide["checklist"][number];
type Progress = Record<string, ChecklistStatus>;
const oauthExecutionSections = new Set([
  "registration",
  "credentials",
  "scopes",
  "redirects",
  "testing",
]);

export type StepDependency = {
  id: string;
  title: string;
  status: ChecklistStatus | "missing";
};

export function getStepDependencies(
  steps: Step[],
  step: Step,
  progress: Progress,
): { dependencies: StepDependency[]; inferredOrder: boolean } {
  const index = steps.findIndex((candidate) => candidate.id === step.id);
  const inferredOrder = step.dependsOn === undefined;
  const ids = inferredOrder
    ? steps.slice(0, Math.max(index, 0)).map((candidate) => candidate.id)
    : step.dependsOn || [];
  return {
    inferredOrder,
    dependencies: ids.map((id) => {
      const dependency = steps.find((candidate) => candidate.id === id);
      return {
        id,
        title: dependency?.title || `Unresolved prerequisite (${id})`,
        status: dependency ? progress[id] || "not-started" : "missing",
      };
    }),
  };
}

export function getGuideNextStep(guide: Guide, progress: Progress) {
  const supportUnestablished = guide.oauthSupport !== "supported";
  const incomplete = guide.checklist.filter(
    (step) => progress[step.id] !== "completed",
  );
  const blockedSteps = incomplete.filter(
    (step) => progress[step.id] === "blocked",
  );
  const actionable = incomplete.find((step) => {
    if (progress[step.id] === "blocked") return false;
    if (supportUnestablished && oauthExecutionSections.has(step.sectionId))
      return false;
    return getStepDependencies(
      guide.checklist,
      step,
      progress,
    ).dependencies.every((dependency) => dependency.status === "completed");
  });
  const step = actionable || blockedSteps[0] || incomplete[0];
  const dependencyInfo = step
    ? getStepDependencies(guide.checklist, step, progress)
    : { dependencies: [], inferredOrder: false };
  return {
    kind: !step
      ? ("complete" as const)
      : actionable
        ? ("actionable" as const)
        : ("blocked" as const),
    step,
    supportUnestablished,
    supportRestricted: Boolean(
      step &&
      supportUnestablished &&
      oauthExecutionSections.has(step.sectionId),
    ),
    blockedSteps,
    ...dependencyInfo,
    unmetDependencies: dependencyInfo.dependencies.filter(
      (dependency) => dependency.status !== "completed",
    ),
  };
}

export function getStepDocumentation(guide: Guide, step: Step) {
  const direct = (step.sourceIds || [])
    .map((id) => guide.sources.find((source) => source.id === id))
    .filter((source) => source !== undefined);
  if (direct.length) return { sources: direct, specific: true };
  const section = guide.sections.find((item) => item.id === step.sectionId);
  const ids = new Set(
    section?.claims.flatMap((claim) => claim.sourceIds) || [],
  );
  return {
    sources: guide.sources.filter((source) => ids.has(source.id)),
    specific: false,
  };
}
