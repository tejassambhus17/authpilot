import {
  defaultLaunchPath,
  type ChecklistStatus,
  type Claim,
  type Guide,
  type LaunchPath,
} from "@/lib/schema";
import { getGuideNextStep, getStepDependencies } from "@/lib/guide-navigation";
import { getStepApplicability } from "@/lib/launch-path";

type Step = Guide["checklist"][number];
type Progress = Record<string, ChecklistStatus>;

export type GuideReadiness = {
  status:
    | "support-unresolved"
    | "blocked"
    | "omissions"
    | "path-unresolved"
    | "in-progress"
    | "waiting"
    | "review";
  title: string;
  description: string;
  applicableSteps: Step[];
  completedSteps: Step[];
  blockedSteps: Step[];
  actionableSteps: Step[];
  /** Remaining provider-owned steps, not evidence that a submission was made. */
  waitingSteps: Step[];
  lockedSteps: Step[];
  omittedSteps: Step[];
  /** Manually omitted steps that were not explicitly classified as optional. */
  requiredOmissions: Step[];
  /** Unresolved findings across the snapshot; not filtered by personal context. */
  unknownClaims: Claim[];
};

/** A reading view of recorded evidence and personal progress, never a setup test. */
export function getGuideReadiness(
  guide: Guide,
  progress: Progress,
  path: LaunchPath = defaultLaunchPath,
): GuideReadiness {
  const applicableSteps = guide.checklist.filter(
    (step) => !getStepApplicability(step, path).excluded,
  );
  const completedSteps = applicableSteps.filter(
    (step) => progress[step.id] === "completed",
  );
  const omittedSteps = applicableSteps.filter(
    (step) => progress[step.id] === "not-applicable",
  );
  const requiredOmissions = omittedSteps.filter(
    (step) => step.requirementType !== "optional",
  );
  const pending = applicableSteps.filter(
    (step) =>
      progress[step.id] !== "completed" &&
      progress[step.id] !== "not-applicable",
  );
  const navigation = getGuideNextStep(guide, progress, path);
  const actionableSteps = navigation.actionableSteps.filter(
    (step) => step.actor !== "provider",
  );
  const waitingSteps = pending.filter((step) => step.actor === "provider");
  const lockedSteps = pending.filter(
    (step) =>
      progress[step.id] !== "blocked" &&
      !navigation.actionableSteps.some((item) => item.id === step.id),
  );
  const claims = [
    guide.approval,
    ...guide.sections.flatMap((section) => section.claims),
    ...guide.blockers,
  ];
  const unknownClaims = Array.from(
    new Map(
      claims
        .filter(
          (claim) =>
            claim.status === "unknown" ||
            claim.verification?.status === "conflicting",
        )
        .map((claim) => [claim.text.trim().toLocaleLowerCase(), claim]),
    ).values(),
  );
  const base = {
    applicableSteps,
    completedSteps,
    blockedSteps: navigation.blockedSteps,
    actionableSteps,
    waitingSteps,
    lockedSteps,
    omittedSteps,
    requiredOmissions,
    unknownClaims,
  };
  if (guide.oauthSupport !== "supported")
    return {
      ...base,
      status: "support-unresolved",
      title:
        guide.oauthSupport === "unsupported"
          ? "OAuth is not supported in this guide"
          : "Confirm OAuth support first",
      description:
        "Review the support findings with the provider. Registration, credentials and OAuth execution are not recommended until support is established; independent investigation may continue.",
    };
  if (base.blockedSteps.length)
    return {
      ...base,
      status: "blocked",
      title: `${base.blockedSteps.length} ${base.blockedSteps.length === 1 ? "blocker needs" : "blockers need"} attention`,
      description: actionableSteps.length
        ? "Independent work can continue. Resolve your recorded blockers before resuming the affected steps."
        : "Resolve the recorded blockers and their prerequisites before continuing the affected setup work.",
    };
  if (requiredOmissions.length)
    return {
      ...base,
      status: "omissions",
      title: "Review omitted prerequisites",
      description:
        "Some steps were manually marked not applicable without being classified as optional. Confirm their conditions; omission does not satisfy a required dependency.",
    };
  if (
    path.audience === "unsure" ||
    (path.audience === "internal" && path.marketplaceListing)
  )
    return {
      ...base,
      status: "path-unresolved",
      title:
        path.audience === "unsure"
          ? "Choose your launch audience"
          : "Clarify your launch path",
      description:
        path.audience === "unsure"
          ? "Internal use, public distribution and optional listing can have different requirements. Conditional branches remain visible until you choose."
          : "Internal audience and optional public listing are both selected. Both audience branches remain visible; confirm the intended path before omitting steps.",
    };
  if (actionableSteps.length)
    return {
      ...base,
      status: "in-progress",
      title: "You can continue your setup plan",
      description:
        "The next actions have no unresolved recorded prerequisites. Account permissions and source conditions still need your verification.",
    };
  const providerCanProceed = waitingSteps.some((step) =>
    getStepDependencies(
      guide.checklist,
      step,
      progress,
      path,
    ).dependencies.every((dependency) => dependency.satisfied),
  );
  if (providerCanProceed)
    return {
      ...base,
      status: "waiting",
      title: "A provider decision remains",
      description:
        "Your plan includes a remaining provider-owned step. Check its submission and follow-up instructions; this is not evidence that review has begun or approval was granted.",
    };
  if (lockedSteps.length)
    return {
      ...base,
      status: "blocked",
      title: "Resolve the remaining prerequisites",
      description:
        "The remaining tasks depend on steps that are not satisfied. Inspect the dependencies and recovery guidance before proceeding.",
    };
  return {
    ...base,
    status: "review",
    title: "Review your recorded completion",
    description:
      "Your selected checklist has no remaining actions. Review omitted steps, unresolved findings and current provider requirements; personal completion does not establish a working OAuth setup or provider approval.",
  };
}
