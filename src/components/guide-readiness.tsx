"use client";

import { ArrowRight, CircleAlert, GitBranch } from "lucide-react";
import type {
  ChecklistStatus,
  Guide,
  LaunchPath,
  SectionId,
} from "@/lib/schema";
import { getGuideReadiness } from "@/lib/guide-readiness";
import styles from "./guide-readiness.module.css";

export function GuideReadiness({
  guide,
  progress,
  launchPath,
  blockers,
  ready,
  onEditPath,
  onSteps,
  onReview,
  onRead,
}: {
  guide: Guide;
  progress: Record<string, ChecklistStatus>;
  launchPath: LaunchPath;
  blockers: Record<string, { reason: string; owner: string }>;
  ready: boolean;
  onEditPath: () => void;
  onSteps: () => void;
  onReview: () => void;
  onRead: (section: SectionId) => void;
}) {
  const summary = getGuideReadiness(guide, progress, launchPath);
  return (
    <section
      className={styles.summary}
      aria-label="Readiness summary"
      aria-busy={!ready}
    >
      <div className={styles.heading}>
        <div>
          <h2>Readiness summary</h2>
          <p className={styles.verdict} aria-live="polite">
            {ready ? summary.title : "Loading your plan…"}
          </p>
        </div>
        <button
          className="button button-small"
          onClick={onEditPath}
          disabled={!ready}
        >
          <GitBranch size={14} /> Edit launch path
        </button>
      </div>
      {ready && (
        <>
          <p className={styles.description}>{summary.description}</p>
          <dl className={styles.context}>
            <div>
              <dt>Audience</dt>
              <dd>
                {launchPath.audience === "unsure"
                  ? "Not selected"
                  : launchPath.audience === "internal"
                    ? "Internal"
                    : "Public / external"}
              </dd>
            </div>
            <div>
              <dt>Scopes</dt>
              <dd>{launchPath.scopes || "Not specified"}</dd>
            </div>
            <div>
              <dt>Account access</dt>
              <dd>
                {launchPath.accountPermissions === "admin"
                  ? "Administrator (declared)"
                  : launchPath.accountPermissions === "member"
                    ? "Member (declared)"
                    : "Not checked"}
              </dd>
            </div>
            <div>
              <dt>Optional listing</dt>
              <dd>
                {launchPath.marketplaceListing ? "Included" : "Not selected"}
              </dd>
            </div>
          </dl>
          {launchPath.intendedApis && (
            <p className={styles.description}>
              Intended APIs: {launchPath.intendedApis}
            </p>
          )}
          <div className={styles.actions}>
            <button onClick={onSteps}>
              {summary.actionableSteps.length}{" "}
              {summary.actionableSteps.length === 1 ? "step" : "steps"} can
              continue <ArrowRight size={13} />
            </button>
            <button
              onClick={onSteps}
              className={
                summary.blockedSteps.length ? styles.warning : undefined
              }
            >
              {summary.blockedSteps.length} marked blocked ·{" "}
              {summary.lockedSteps.length} need prerequisites or support
              confirmation <ArrowRight size={13} />
            </button>
            <button onClick={onReview}>
              {summary.waitingSteps.length} provider-owned{" "}
              {summary.waitingSteps.length === 1 ? "step" : "steps"} remaining{" "}
              <ArrowRight size={13} />
            </button>
          </div>
          {summary.blockedSteps.length > 0 && (
            <details className={styles.details}>
              <summary>
                <CircleAlert size={14} /> Blockers to resolve
              </summary>
              <ul>
                {summary.blockedSteps.map((step) => (
                  <li key={step.id}>
                    <strong>{step.title}</strong>
                    <p>
                      {blockers[step.id]?.reason ||
                        "You marked this task blocked; no personal reason has been recorded."}
                    </p>
                    <p>
                      Recovery owner:{" "}
                      {blockers[step.id]?.owner ||
                        step.recoveryOwner ||
                        "Confirm the responsible account owner or provider"}
                      .
                    </p>
                    <button onClick={() => onRead(step.sectionId)}>
                      Read recovery and documentation <ArrowRight size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
          {summary.requiredOmissions.length > 0 && (
            <p className={styles.warning}>
              Steps not classified as optional were marked not applicable.
              Review their conditions in Setup steps; skipping a required task
              does not satisfy its dependencies.
            </p>
          )}
          {summary.unknownClaims.length > 0 && (
            <details className={styles.details}>
              <summary>
                {summary.unknownClaims.length} unresolved{" "}
                {summary.unknownClaims.length === 1 ? "finding" : "findings"} in
                this research snapshot
              </summary>
              <p>
                Snapshot-wide unknowns, including other launch paths. Check
                applicability and original evidence; local preferences do not
                resolve them.
              </p>
              <ul>
                {summary.unknownClaims.map((claim, index) => {
                  const section = guide.sections.find((item) =>
                    item.claims.some((item) => item.text === claim.text),
                  );
                  return (
                    <li key={index}>
                      <p>{claim.text}</p>
                      <button onClick={() => onRead(section?.id || "review")}>
                        Inspect guidance <ArrowRight size={13} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </details>
          )}
          <p className={styles.boundary}>
            Based on this browser’s checklist and declared preferences. Account
            access, OAuth setup and approval have not been verified.
          </p>
        </>
      )}
    </section>
  );
}
