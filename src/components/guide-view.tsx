"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Clock3,
  Download,
  FileCheck2,
  FlaskConical,
  GitBranch,
  ListChecks,
  LockKeyhole,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  checklistStatusSchema,
  defaultLaunchPath,
  launchPathSchema,
  type ChecklistStatus,
  type Claim,
  type Guide,
  type LaunchPath,
  type SectionId,
} from "@/lib/schema";
import { ProviderIcon } from "./brand";
import { isAuditedFigmaPlanningSnapshot } from "@/lib/provider-corrections";
import { EvidenceTag } from "./evidence";
import { SaveGuideButton } from "./save-guide-button";
import { EvidenceInspector } from "./evidence-inspector";
import { LaunchPathFields } from "./launch-path-fields";
import { GuideReadiness } from "./guide-readiness";
import {
  formatDuration,
  getPlanningEstimate,
  getStepApplicability,
} from "@/lib/launch-path";
import {
  getGuideNextStep,
  getStepDependencies,
  getStepDocumentation,
} from "@/lib/guide-navigation";
import styles from "./guide-view.module.css";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "steps", label: "Setup steps" },
  { id: "scopes", label: "Scopes" },
  { id: "approval", label: "Approval & review" },
  { id: "issues", label: "Common issues" },
  { id: "sources", label: "Sources" },
] as const;
type Tab = (typeof tabs)[number]["id"];
const statuses: { value: ChecklistStatus; label: string }[] = [
  { value: "not-started", label: "Not started" },
  { value: "in-progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "not-applicable", label: "Not applicable" },
];
type BlockerNote = { reason: string; owner: string };
type BlockerNotes = Record<string, BlockerNote>;
const setupSections: SectionId[] = [
  "prerequisites",
  "registration",
  "redirects",
  "credentials",
  "testing",
];

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function ClaimEvidence({ claim, guide }: { claim: Claim; guide: Guide }) {
  return (
    <div className={styles.claimEvidence}>
      <EvidenceTag status={claim.status} />
      {claim.sourceIds.map((id) => {
        const source = guide.sources.find((s) => s.id === id);
        return source ? (
          <a
            key={id}
            className="source-reference"
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            title={source.title}
          >
            {source.publisher}
            <ArrowUpRight size={11} />
          </a>
        ) : null;
      })}
      <EvidenceInspector claim={claim} guide={guide} />
    </div>
  );
}

function GuideSections({ guide, ids }: { guide: Guide; ids: SectionId[] }) {
  return (
    <div className={styles.reading}>
      {ids.map((id) => {
        const section = guide.sections.find((item) => item.id === id);
        if (!section) return null;
        return (
          <section
            className={styles.guideSection}
            key={id}
            id={`section-${id}`}
            tabIndex={-1}
          >
            <h2>{section.title}</h2>
            <p className={styles.sectionSummary}>{section.summary}</p>
            <ul className={styles.claimList}>
              {section.claims.map((claim, i) => (
                <li key={i}>
                  <p>{claim.text}</p>
                  <ClaimEvidence claim={claim} guide={guide} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ResearchSnapshotContext({ guide }: { guide: Guide }) {
  const context = guide.researchContext;
  return (
    <section
      className={styles.snapshotContext}
      aria-label="Research snapshot context"
    >
      <h3>Research snapshot context</h3>
      {context ? (
        <dl>
          <div>
            <dt>Audience</dt>
            <dd>
              {context.audience === "internal"
                ? "Internal / own organization"
                : context.audience === "public"
                  ? "Public / external users"
                  : "Undecided"}
            </dd>
          </div>
          <div>
            <dt>Intended APIs</dt>
            <dd>{context.intendedApis || "Not specified"}</dd>
          </div>
          <div>
            <dt>Scopes investigated</dt>
            <dd>{context.scopes || "Not specified"}</dd>
          </div>
          <div>
            <dt>Declared permissions</dt>
            <dd>
              {context.accountPermissions === "admin"
                ? "Owner / administrator"
                : context.accountPermissions === "member"
                  ? "Member / needs an administrator"
                  : "Not checked"}
            </dd>
          </div>
          <div>
            <dt>Optional listing</dt>
            <dd>
              {context.marketplaceListing
                ? "Included in research"
                : "Not requested"}
            </dd>
          </div>
        </dl>
      ) : (
        <p>
          This older snapshot has no recorded launch context. Check each
          requirement’s conditions before applying it to your integration.
        </p>
      )}
      <p>
        Changing preferences does not research missing requirements. Research
        again for another launch path. Declared account permissions are user
        input, not verified access.
      </p>
    </section>
  );
}

type ChecklistProps = {
  guide: Guide;
  progress: Record<string, ChecklistStatus>;
  ready: boolean;
  compact?: boolean;
  launchPath: LaunchPath;
  blockers: BlockerNotes;
  onBlockerChange: (id: string, note: BlockerNote) => void;
  onChange: (id: string, status: ChecklistStatus) => void;
  onRead: (sectionId: SectionId) => void;
};

function Checklist({
  guide,
  progress,
  ready,
  compact = false,
  launchPath,
  blockers,
  onBlockerChange,
  onChange,
  onRead,
}: ChecklistProps) {
  const applicable = guide.checklist.filter(
    (step) =>
      !getStepApplicability(step, launchPath).excluded &&
      progress[step.id] !== "not-applicable",
  );
  const done = applicable.filter(
    (step) => progress[step.id] === "completed",
  ).length;
  return (
    <section
      className={`${styles.checklist} ${compact ? styles.compactChecklist : styles.expandedChecklist}`}
      aria-label="Setup checklist"
    >
      <div className={styles.checklistHeading}>
        <h2>
          <ListChecks size={16} />
          Setup checklist
        </h2>
        <span>
          {done} / {applicable.length} completed
        </span>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Checklist completion"
        aria-valuemin={0}
        aria-valuemax={applicable.length || 1}
        aria-valuenow={done}
      >
        <span
          style={{
            transform: `scaleX(${applicable.length ? done / applicable.length : 0})`,
          }}
        />
      </div>
      <ol className={styles.checklistItems} aria-label="Checklist steps">
        {guide.checklist.map((step) => {
          const applicability = getStepApplicability(step, launchPath);
          const status = applicability.excluded
            ? "not-applicable"
            : progress[step.id] || "not-started";
          const note = blockers[step.id] || { reason: "", owner: "" };
          const { dependencies, inferredOrder } = getStepDependencies(
            guide.checklist,
            step,
            progress,
            launchPath,
          );
          const unmet = dependencies.filter((item) => !item.satisfied);
          const documentation = getStepDocumentation(guide, step);
          return (
            <li className={styles.checklistItem} key={step.id}>
              <label
                className={`${styles.stepLabel} ${status === "completed" ? styles.completed : ""}`}
              >
                <input
                  type="checkbox"
                  checked={status === "completed"}
                  disabled={
                    !ready ||
                    applicability.excluded ||
                    status === "not-applicable"
                  }
                  aria-label={`Mark ${step.title} complete`}
                  onChange={(e) =>
                    onChange(
                      step.id,
                      e.target.checked ? "completed" : "not-started",
                    )
                  }
                />
                <span>{step.title}</span>
              </label>
              {!compact && (
                <p className={styles.stepDescription}>{step.description}</p>
              )}
              {applicability.excluded && (
                <p className={styles.dependencyNote}>
                  {applicability.reason} Excluded from your completion count;
                  change Your launch path to include it.
                </p>
              )}
              {!compact &&
                status === "not-applicable" &&
                !applicability.excluded && (
                  <p className={styles.dependencyNote}>
                    You marked this step not applicable. This does not satisfy a
                    required prerequisite for another step. Confirm the
                    documented conditions before omitting it.
                  </p>
                )}
              {!compact && status === "blocked" && (
                <div className={styles.stepRecovery}>
                  <strong>Blocked — resolve before continuing</strong>
                  <label className={styles.blockerField}>
                    What is blocking this step?
                    <textarea
                      aria-label={`Blocker reason for ${step.title}`}
                      maxLength={500}
                      value={note.reason}
                      placeholder="Record the missing permission, decision, or prerequisite. No secrets."
                      onChange={(e) =>
                        onBlockerChange(step.id, {
                          ...note,
                          reason: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className={styles.blockerField}>
                    Responsible person or role
                    <input
                      aria-label={`Blocker owner for ${step.title}`}
                      maxLength={120}
                      value={note.owner}
                      placeholder={
                        step.recoveryOwner ||
                        "e.g. your organization administrator"
                      }
                      onChange={(e) =>
                        onBlockerChange(step.id, {
                          ...note,
                          owner: e.target.value,
                        })
                      }
                    />
                  </label>
                  <p>
                    {step.recovery ||
                      "You marked this task blocked; its specific reason was not recorded. Review the guidance and documentation, resolve the prerequisite, then update the status when you can continue."}
                  </p>
                  <p>
                    Recovery owner:{" "}
                    {note.owner ||
                      step.recoveryOwner ||
                      (step.actor === "provider"
                        ? "Provider decision-maker"
                        : "Developer / relevant account owner")}
                    . Your reason and owner stay in this browser.
                  </p>
                </div>
              )}
              {!compact && unmet.length > 0 && (
                <p className={styles.dependencyNote}>
                  Depends on:{" "}
                  {unmet
                    .map(
                      (item) =>
                        `${item.title} (${item.status === "missing" ? "not recorded" : statuses.find((value) => value.value === item.status)?.label.toLowerCase()})`,
                    )
                    .join("; ")}
                  .
                  {inferredOrder &&
                    " This older guide uses checklist order as a conservative prerequisite assumption."}
                </p>
              )}
              <div className={styles.stepControls}>
                <select
                  className={styles.statusSelect}
                  disabled={!ready || applicability.excluded}
                  aria-label={`Status for ${step.title}`}
                  value={status}
                  onChange={(e) =>
                    onChange(step.id, e.target.value as ChecklistStatus)
                  }
                >
                  {statuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className={styles.actor}>
                  {step.actor === "developer" ? (
                    <UserRound size={11} />
                  ) : step.actor === "agent" ? (
                    <Sparkles size={11} />
                  ) : (
                    <ShieldCheck size={11} />
                  )}
                  {step.actor === "developer"
                    ? "Your action"
                    : step.actor === "agent"
                      ? "Agent can assist"
                      : "Provider decision"}
                </span>
                {!compact && (
                  <button
                    className={styles.inlineAction}
                    onClick={() => onRead(step.sectionId)}
                  >
                    Read guidance
                    <ArrowUpRight size={12} />
                  </button>
                )}
                {!compact && documentation.sources[0] && (
                  <a
                    className={styles.inlineAction}
                    href={documentation.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {documentation.specific
                      ? "Step documentation"
                      : "Related section documentation"}
                    <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {compact && (
        <p className={styles.personalNote}>
          Progress is saved in this browser, just for you.
          {guide.checklist.length - applicable.length > 0
            ? ` ${guide.checklist.length - applicable.length} steps omitted; inspect Setup steps for conditions.`
            : ""}
        </p>
      )}
    </section>
  );
}

function NextStepPanel({
  guide,
  progress,
  ready,
  onRead,
  launchPath,
  blockers,
}: {
  guide: Guide;
  progress: Record<string, ChecklistStatus>;
  ready: boolean;
  onRead: (section: SectionId) => void;
  launchPath: LaunchPath;
  blockers: BlockerNotes;
}) {
  const next = getGuideNextStep(guide, progress, launchPath);
  const step = next.step;
  const docs = step ? getStepDocumentation(guide, step) : null;
  const otherBlockers = next.blockedSteps.filter(
    (blocked) =>
      blocked.id !== (next.kind === "blocked" ? step?.id : undefined),
  );
  const manuallyOmitted = guide.checklist.filter(
    (item) =>
      progress[item.id] === "not-applicable" &&
      !getStepApplicability(item, launchPath).excluded,
  );
  return (
    <section
      className={`${styles.nextStepPanel} ${next.kind === "blocked" ? styles.blockedPanel : ""}`}
      aria-live="polite"
    >
      <h2>
        {next.kind === "blocked" ? (
          <CircleAlert size={16} />
        ) : (
          <Zap size={16} />
        )}
        {next.kind === "blocked"
          ? "Resolve a blocker"
          : step?.actor === "provider"
            ? "Provider decision pending"
            : "Your next step"}
      </h2>
      {!ready ? (
        <p>Loading your checklist progress…</p>
      ) : (
        <>
          <h3>
            {next.supportRestricted
              ? "Confirm OAuth support first"
              : step?.title ||
                (next.supportUnestablished
                  ? "Review your OAuth support findings"
                  : "Review your completed integration")}
          </h3>
          <p>
            {next.supportRestricted
              ? `OAuth support is ${guide.oauthSupport === "unsupported" ? "not established" : "unclear"} for this provider. “${step!.title}” is not recommended as an executable next step.`
              : next.kind === "blocked"
                ? progress[step!.id] === "blocked"
                  ? "You marked this task blocked. Resolve the blocker before treating this task as actionable."
                  : "This task has unmet prerequisites. Complete or resolve the dependencies below before continuing."
                : step?.description ||
                  (next.supportUnestablished
                    ? "Checklist completion does not establish OAuth support. Review official support for your use case before implementing an integration."
                    : "Your selected plan has no remaining tasks. Review completed and omitted steps against the current provider requirements before launch.")}
          </p>
          {manuallyOmitted.length > 0 && (
            <p className={styles.navigationNote}>
              {manuallyOmitted.length}{" "}
              {manuallyOmitted.length === 1 ? "step was" : "steps were"}{" "}
              manually marked not applicable. Omission does not mean setup was
              completed or a provider requirement was waived. Review these
              choices in Setup steps.
            </p>
          )}
          {next.kind === "blocked" && step && (
            <div className={styles.recoveryInstructions}>
              <h4>Recovery</h4>
              {blockers[step.id]?.reason && (
                <p>
                  <strong>Your blocker:</strong> {blockers[step.id].reason}
                </p>
              )}
              <p>
                {next.supportRestricted
                  ? "Verify in official documentation or with the provider that OAuth is available for your intended integration. Do not register an app, configure credentials or redirects, choose scopes, or execute a flow until support is established. If OAuth is unavailable, investigate a supported alternative. Your personal checklist status has not been changed."
                  : step.recovery ||
                    "The specific blocker reason was not recorded in this guide. Review this step’s guidance, identify the missing prerequisite or permission, and resolve it with the appropriate account owner or provider. Update the checklist when you can continue."}
              </p>
              <p>
                <strong>Responsible:</strong>{" "}
                {blockers[step.id]?.owner ||
                  step.recoveryOwner ||
                  (step.actor === "provider"
                    ? "Provider decision-maker"
                    : "Developer / relevant account owner")}
              </p>
            </div>
          )}
          {step && next.dependencies.length > 0 && (
            <details
              className={styles.dependencyDetails}
              open={
                next.kind === "blocked" && next.unmetDependencies.length > 0
              }
            >
              <summary>
                {next.unmetDependencies.length
                  ? "Unmet dependencies"
                  : "Dependencies satisfied"}
              </summary>
              <ul>
                {next.dependencies.map((dependency) => (
                  <li key={dependency.id}>
                    <span>{dependency.title}</span>
                    <strong>
                      {dependency.status === "missing"
                        ? "Not recorded"
                        : statuses.find(
                            (status) => status.value === dependency.status,
                          )?.label}
                    </strong>
                  </li>
                ))}
              </ul>
            </details>
          )}
          {step && next.inferredOrder && (
            <p className={styles.navigationNote}>
              This older guide has no explicit dependency map. Checklist order
              is used conservatively; later tasks are not assumed independent.
            </p>
          )}
          {next.supportUnestablished && !next.supportRestricted && step && (
            <p className={styles.navigationNote}>
              OAuth support is not established. Preparation and investigation
              can proceed; OAuth registration and execution tasks remain
              restricted.
            </p>
          )}
          {step?.actor === "provider" && next.kind === "actionable" && (
            <p className={styles.navigationNote}>
              This step requires a provider decision. Review its submission or
              follow-up instructions; AuthPilot cannot approve it.
            </p>
          )}
          {docs?.sources[0] ? (
            <a
              className="button button-primary"
              href={docs.sources[0].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {docs.specific
                ? "Open step documentation"
                : "Open related documentation"}
              <ArrowUpRight size={14} />
            </a>
          ) : (
            <a
              className="button button-primary"
              href={guide.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open provider website
              <ArrowUpRight size={14} />
            </a>
          )}
          {step && !docs?.specific && (
            <p className={styles.navigationNote}>
              No step-specific source was recorded.{" "}
              {docs?.sources.length
                ? "This link supports the related guide section."
                : "The provider website is a starting point, not evidence for this step."}
            </p>
          )}
          {step && (
            <button
              className={styles.inlineAction}
              onClick={() => onRead(step.sectionId)}
            >
              {next.kind === "blocked"
                ? "Read recovery guidance"
                : "Read this step’s guidance"}
              <ArrowRight size={12} />
            </button>
          )}
          {otherBlockers.length > 0 && (
            <details className={styles.dependencyDetails}>
              <summary>
                {otherBlockers.length}{" "}
                {otherBlockers.length === 1
                  ? "other task is"
                  : "other tasks are"}{" "}
                blocked
              </summary>
              <ul>
                {otherBlockers.map((blocked) => (
                  <li key={blocked.id}>
                    <button
                      className={styles.inlineAction}
                      onClick={() => onRead(blocked.sectionId)}
                    >
                      {blocked.title}
                      <ArrowRight size={12} />
                    </button>
                  </li>
                ))}
              </ul>
              <p className={styles.navigationNote}>
                These blockers remain unresolved even if an independent task can
                proceed.
              </p>
            </details>
          )}
          {next.actionableSteps.length > 1 && (
            <details className={styles.dependencyDetails}>
              <summary>Other steps you can continue</summary>
              <ul>
                {next.actionableSteps.slice(1).map((item) => (
                  <li key={item.id}>
                    <button
                      className={styles.inlineAction}
                      onClick={() => onRead(item.sectionId)}
                    >
                      {item.title}
                      <ArrowRight size={12} />
                    </button>
                  </li>
                ))}
              </ul>
              <p className={styles.navigationNote}>
                These steps have no unresolved recorded dependencies. Account
                eligibility and documented conditions still apply.
              </p>
            </details>
          )}
        </>
      )}
    </section>
  );
}

export function GuideView({ guide }: { guide: Guide }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [progress, setProgress] = useState<Record<string, ChecklistStatus>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [storageError, setStorageError] = useState("");
  const [launchPath, setLaunchPath] = useState<LaunchPath>(
    guide.researchContext ?? defaultLaunchPath,
  );
  const [blockerNotes, setBlockerNotes] = useState<BlockerNotes>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const launchPathRef = useRef<HTMLDetailsElement>(null);
  const storageKey = `authpilot:checklist:${guide.id}:v1`;
  const pathKey = `authpilot:launch-path:${guide.id}:v1`;
  const blockersKey = `authpilot:blockers:${guide.id}:v1`;

  useEffect(() => {
    const stored: Record<string, ChecklistStatus> = {};
    let storedPath = guide.researchContext ?? defaultLaunchPath;
    const storedBlockers: BlockerNotes = {};
    let error = "";
    try {
      const raw = localStorage.getItem(storageKey);
      const pathRaw = localStorage.getItem(pathKey);
      if (pathRaw) {
        const parsed = launchPathSchema.safeParse(JSON.parse(pathRaw));
        if (parsed.success) storedPath = parsed.data;
      }
      const blockersRaw = localStorage.getItem(blockersKey);
      if (blockersRaw) {
        const parsed: unknown = JSON.parse(blockersRaw);
        if (parsed && typeof parsed === "object")
          for (const [id, item] of Object.entries(parsed)) {
            if (
              guide.checklist.some((step) => step.id === id) &&
              item &&
              typeof item === "object" &&
              typeof item.reason === "string" &&
              typeof item.owner === "string"
            )
              storedBlockers[id] = {
                reason: item.reason.slice(0, 500),
                owner: item.owner.slice(0, 120),
              };
          }
      }
      if (raw) {
        const value: unknown = JSON.parse(raw);
        if (value && typeof value === "object") {
          for (const [id, status] of Object.entries(value)) {
            const parsed = checklistStatusSchema.safeParse(status);
            if (
              parsed.success &&
              guide.checklist.some((step) => step.id === id)
            )
              stored[id] = parsed.data;
          }
        }
      }
    } catch {
      error =
        "Browser storage is unavailable. Progress will last for this visit only.";
    }
    const frame = requestAnimationFrame(() => {
      setProgress(stored);
      setLaunchPath(storedPath);
      setBlockerNotes(storedBlockers);
      setStorageError(error);
      setStorageReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [
    storageKey,
    pathKey,
    blockersKey,
    guide.checklist,
    guide.researchContext,
  ]);

  function updateLaunchPath(value: LaunchPath) {
    setLaunchPath(value);
    try {
      localStorage.setItem(pathKey, JSON.stringify(value));
    } catch {
      setStorageError(
        "Your launch preferences could not be saved. They will last for this visit only.",
      );
    }
  }
  function updateBlocker(id: string, note: BlockerNote) {
    const next = { ...blockerNotes, [id]: note };
    setBlockerNotes(next);
    try {
      localStorage.setItem(blockersKey, JSON.stringify(next));
    } catch {
      setStorageError(
        "Your blocker notes could not be saved. They will last for this visit only.",
      );
    }
  }

  function updateProgress(id: string, status: ChecklistStatus) {
    const next = { ...progress, [id]: status };
    setProgress(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setStorageError(
        "Your browser could not save progress. Keep this page open or allow local storage.",
      );
    }
  }

  function resetProgress() {
    setProgress({});
    setBlockerNotes({});
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(blockersKey);
      setFeedback("Checklist reset.");
    } catch {
      setStorageError(
        "Progress was reset for this visit, but browser storage could not be updated.",
      );
    }
  }

  function selectTab(value: Tab, scroll = false) {
    setTab(value);
    if (scroll) tabsRef.current?.scrollIntoView({ block: "start" });
    requestAnimationFrame(() =>
      document.getElementById(`tab-${value}`)?.focus({ preventScroll: true }),
    );
  }

  function readSection(sectionId: SectionId) {
    const target: Tab =
      sectionId === "scopes"
        ? "scopes"
        : sectionId === "review" || sectionId === "distribution"
          ? "approval"
          : sectionId === "troubleshooting"
            ? "issues"
            : "steps";
    selectTab(target);
    requestAnimationFrame(() => {
      const section = document.getElementById(`section-${sectionId}`);
      section?.scrollIntoView({ block: "start" });
      section?.focus({ preventScroll: true });
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setFeedback("Guide link copied.");
    } catch {
      setFeedback("Copy this guide’s address from your browser to share it.");
    }
  }

  const applicableSteps = guide.checklist.filter(
    (step) =>
      !getStepApplicability(step, launchPath).excluded &&
      progress[step.id] !== "not-applicable",
  );
  const done = applicableSteps.filter(
    (step) => progress[step.id] === "completed",
  ).length;
  const planning = getPlanningEstimate(guide);
  const blocked = guide.checklist.filter(
    (step) => progress[step.id] === "blocked",
  ).length;
  const prerequisites = guide.sections.find(
    (section) => section.id === "prerequisites",
  );
  const checklistProps = {
    guide,
    progress,
    ready: storageReady,
    onChange: updateProgress,
    onRead: readSection,
    launchPath,
    blockers: blockerNotes,
    onBlockerChange: updateBlocker,
  };

  return (
    <div className={`page-container ${styles.page}`}>
      <div className={styles.toolbar}>
        <Link href="/guides" className={styles.backLink}>
          <ArrowLeft size={15} />
          Back to guides
        </Link>
        <div className={styles.actions}>
          <button
            className="button button-small"
            aria-label="Copy guide link"
            onClick={copyLink}
          >
            <Share2 size={16} />
            Share
          </button>
          <SaveGuideButton guideId={guide.id} />
          <a
            className="button button-small"
            href={`/api/guides/${guide.id}/export`}
            download
          >
            <Download size={16} />
            Export Markdown
          </a>
          <Link
            className="button button-small"
            href={`/research?q=${encodeURIComponent(guide.provider)}`}
          >
            <RotateCcw size={16} />
            Research again
          </Link>
        </div>
      </div>

      <header className={styles.header}>
        <span className={`provider-icon ${styles.providerIcon}`}>
          <ProviderIcon provider={guide.provider} size={35} />
        </span>
        <div className={styles.headerCopy}>
          <h1>{guide.provider} OAuth Integration Guide</h1>
          <p>{guide.description}</p>
          <div className={styles.metadata}>
            <span className={styles.sourceBadge}>
              <FileCheck2 size={12} />
              {guide.origin === "curated"
                ? "Curated guide"
                : "Agent researched"}
            </span>
            <span>
              <FlaskConical size={12} />
              Setup not tested
            </span>
            <span>Updated {dateLabel(guide.updatedAt)}</span>
            <button onClick={() => selectTab("sources", true)}>
              <BookOpen size={12} />
              {guide.sources.length} sources
            </button>
          </div>
        </div>
      </header>
      <div className={styles.feedback} role="status" aria-live="polite">
        {feedback}
      </div>

      <div
        ref={tabsRef}
        className={styles.tabs}
        role="tablist"
        aria-label="Guide sections"
        onKeyDown={(e) => {
          const index = tabs.findIndex((item) => item.id === tab);
          let next = index;
          if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
          else if (e.key === "ArrowLeft")
            next = (index - 1 + tabs.length) % tabs.length;
          else if (e.key === "Home") next = 0;
          else if (e.key === "End") next = tabs.length - 1;
          else return;
          e.preventDefault();
          setTab(tabs[next].id);
          document.getElementById(`tab-${tabs[next].id}`)?.focus();
        }}
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => selectTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {storageError && (
        <div className={`notice error ${styles.storageNotice}`} role="alert">
          <CircleAlert size={17} />
          <p>{storageError}</p>
        </div>
      )}
      <div
        id={`panel-${tab}`}
        className={styles.tabPanel}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
      >
        {tab === "overview" && (
          <>
            {isAuditedFigmaPlanningSnapshot(guide) && (
              <div className="notice">
                <CircleAlert size={18} />
                <div>
                  <strong>
                    Plan amended after manual review · 3 November 2026
                  </strong>
                  <p>
                    The generated publication order was corrected. Choosing an
                    audience, preparing review materials, submitting, and
                    awaiting the provider’s decision are separate steps. The
                    original snapshot is retained.
                  </p>
                  <button
                    className={styles.inlineAction}
                    onClick={() => selectTab("steps", true)}
                  >
                    Read the corrected plan <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}
            {guide.oauthSupport !== "supported" && (
              <div className="notice">
                <CircleAlert size={18} />
                <div>
                  <strong>
                    {guide.oauthSupport === "unsupported"
                      ? "OAuth integration is not established"
                      : "OAuth support needs confirmation"}
                  </strong>
                  <p>
                    Read the findings and unknowns before creating an
                    integration. A researched guide does not establish support
                    for your use case.
                  </p>
                </div>
              </div>
            )}
            <GuideReadiness
              guide={guide}
              progress={progress}
              launchPath={launchPath}
              blockers={blockerNotes}
              ready={storageReady}
              onEditPath={() => {
                if (!launchPathRef.current) return;
                launchPathRef.current.open = true;
                launchPathRef.current.scrollIntoView({ block: "start" });
                launchPathRef.current.querySelector("summary")?.focus();
              }}
              onSteps={() => selectTab("steps", true)}
              onReview={() => selectTab("approval", true)}
              onRead={readSection}
            />
            <div className={styles.overviewGrid}>
              <section
                className={styles.overviewContent}
                aria-labelledby="overview-title"
              >
                <h2 id="overview-title">Overview</h2>
                <p className={styles.overviewIntro}>
                  Your path through {guide.provider} app registration, setup,
                  and distribution. Check the conditions and linked evidence for
                  your integration.
                </p>
                <dl className={styles.facts}>
                  <div className={styles.factRow}>
                    <dt>
                      <GitBranch size={16} />
                      Integration
                    </dt>
                    <dd>
                      OAuth app integration
                      <span className={styles.factDetail}>
                        {guide.oauthSupport === "supported"
                          ? "OAuth support documented"
                          : "OAuth support unconfirmed"}
                      </span>
                    </dd>
                  </div>
                  <div className={styles.factRow}>
                    <dt>
                      <ClipboardList size={16} />
                      Complexity
                    </dt>
                    <dd>
                      {guide.difficulty}
                      <span className={styles.factDetail}>
                        Guide assessment
                      </span>
                    </dd>
                  </div>
                  <div className={`${styles.factRow} ${styles.factNarrative}`}>
                    <dt>
                      <Clock3 size={16} />
                      Hands-on effort
                    </dt>
                    <dd>
                      {!planning.baseline && (
                        <dl className={styles.effortBreakdown}>
                          <div>
                            <dt>Registration</dt>
                            <dd>{formatDuration(planning.registration)}</dd>
                          </div>
                          <div>
                            <dt>Implementation & tests</dt>
                            <dd>{formatDuration(planning.implementation)}</dd>
                          </div>
                        </dl>
                      )}
                      {planning.baseline && (
                        <p>
                          {guide.oauthSupport === "supported"
                            ? guide.effort.text
                            : "Confirm OAuth support before estimating executable setup work."}
                        </p>
                      )}
                      {guide.oauthSupport === "supported" && (
                        <>
                          <p className={styles.planningLabel}>
                            Planning estimate ·{" "}
                            {planning.baseline
                              ? "recorded narrative"
                              : "AI assessment"}{" "}
                            · unmeasured · approval waiting excluded
                          </p>
                          {planning.baseline ? (
                            <p className={styles.navigationNote}>
                              Separate registration and implementation ranges
                              were not recorded. No generic duration has been
                              substituted.
                            </p>
                          ) : (
                            <details className={styles.planningAssumptions}>
                              <summary>Estimate assumptions</summary>
                              <ul>
                                {planning.assumptions.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                              <p>Original research note: {guide.effort.text}</p>
                            </details>
                          )}
                          <ClaimEvidence claim={guide.effort} guide={guide} />
                        </>
                      )}
                    </dd>
                  </div>
                  <div className={`${styles.factRow} ${styles.factNarrative}`}>
                    <dt>
                      <ShieldCheck size={16} />
                      Approval & wait
                    </dt>
                    <dd>
                      <p>{guide.approval.text}</p>
                      <ClaimEvidence claim={guide.approval} guide={guide} />
                    </dd>
                  </div>
                  <div className={styles.factRow}>
                    <dt>
                      <BookOpen size={16} />
                      Documentation
                    </dt>
                    <dd>
                      <a
                        href={guide.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {new URL(guide.website).hostname}
                        <ArrowUpRight size={13} />
                      </a>
                    </dd>
                  </div>
                </dl>
                {prerequisites && (
                  <section className={styles.prerequisites}>
                    <h3>Before you start</h3>
                    <p>{prerequisites.summary}</p>
                    <button
                      className={styles.inlineAction}
                      onClick={() => readSection("prerequisites")}
                    >
                      Read prerequisites
                      <ArrowRight size={13} />
                    </button>
                  </section>
                )}
              </section>
              <div>
                <Checklist {...checklistProps} compact />
                <button
                  className={styles.allStepsButton}
                  onClick={() => selectTab("steps", true)}
                >
                  View all setup steps
                  <ArrowRight size={14} />
                </button>
              </div>
              <aside className={styles.nextRail} aria-label="Your next step">
                <NextStepPanel
                  guide={guide}
                  progress={progress}
                  ready={storageReady}
                  onRead={readSection}
                  launchPath={launchPath}
                  blockers={blockerNotes}
                />
                <section className={styles.reviewPanel}>
                  <h2>
                    <ShieldCheck size={16} />
                    Approval & review
                  </h2>
                  <p>
                    Registration, administrator approval, and distribution can
                    be different steps. Read the requirements for your app’s
                    scope and audience.
                  </p>
                  <button
                    className={styles.inlineAction}
                    onClick={() => selectTab("approval", true)}
                  >
                    View review requirements
                    <ArrowRight size={13} />
                  </button>
                </section>
                <div className={styles.researchBoundary}>
                  <FlaskConical size={15} />
                  <p>
                    Documentation researched.
                    <br />
                    Account setup not attempted.
                  </p>
                </div>
              </aside>
            </div>

            <details
              ref={launchPathRef}
              className={`${styles.disclosure} ${styles.launchPathDisclosure}`}
            >
              <summary>
                <span>
                  <GitBranch size={17} />
                  Your launch path{" "}
                  <span className={styles.pathSummary}>
                    {launchPath.audience === "unsure"
                      ? "Audience not selected"
                      : launchPath.audience === "internal"
                        ? "Internal audience"
                        : "Public audience"}
                  </span>
                </span>
                <ChevronDown size={16} />
              </summary>
              <div className={styles.launchPathBody}>
                <ResearchSnapshotContext guide={guide} />
                <LaunchPathFields
                  value={launchPath}
                  onChange={updateLaunchPath}
                  disabled={!storageReady}
                />
                <p className={styles.navigationNote}>
                  These preferences stay in this browser and adjust explicitly
                  labelled checklist branches. They do not rewrite this shared
                  research snapshot. To investigate different APIs or scopes,
                  use Research again.
                </p>
                {launchPath.audience === "unsure" && (
                  <p className={styles.navigationNote}>
                    Audience is undecided: internal and public requirements
                    remain visible until you choose. Optional marketplace steps
                    are included only when selected.
                  </p>
                )}
              </div>
            </details>

            {guide.blockers.length > 0 && (
              <section className={styles.conditions}>
                <h2>
                  <CircleAlert size={18} />
                  Conditions & blockers
                </h2>
                <p className={styles.sectionSummary}>
                  These can change the path to launch. Review them before you
                  commit to your integration’s scope.
                </p>
                <ul className={styles.claimList}>
                  {guide.blockers.map((claim, i) => (
                    <li key={i}>
                      <p>{claim.text}</p>
                      <ClaimEvidence claim={claim} guide={guide} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <details className={styles.disclosure}>
              <summary>
                <span>
                  <Sparkles size={17} />
                  Agent & developer handoffs
                </span>
                <ChevronDown size={16} />
              </summary>
              <p className={styles.handoffIntro}>
                The agent investigated public documentation. You sign in, choose
                permissions, configure secrets, and execute tests. Provider and
                workspace approvals stay with their decision-makers.
              </p>
              <div className={styles.handoffGrid}>
                <section>
                  <h3>
                    <Sparkles size={16} />
                    The agent can help with
                  </h3>
                  <ul>
                    {guide.automation.canDo.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3>
                    <UserRound size={16} />
                    You take over for
                  </h3>
                  <ul>
                    {guide.automation.requiresHuman.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3>
                    <LockKeyhole size={16} />
                    The agent never does
                  </h3>
                  <ul>
                    {guide.automation.neverDoes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </details>
            {guide.warnings.length > 0 && (
              <details className={styles.disclosure}>
                <summary>
                  <span>
                    <CircleAlert size={17} />
                    Known uncertainties & limitations ({guide.warnings.length})
                  </span>
                  <ChevronDown size={16} />
                </summary>
                <ul className={styles.warningList}>
                  {guide.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}

        {tab === "steps" && (
          <div className={styles.detailGrid}>
            <div>
              <div className={styles.sectionHeading}>
                <div>
                  <h2>Setup steps</h2>
                  <p>
                    Follow the plan, track your progress, and use the evidence
                    to verify each requirement.
                  </p>
                </div>
                <button
                  className="button button-small"
                  onClick={resetProgress}
                  disabled={!Object.keys(progress).length}
                >
                  <RotateCcw size={13} />
                  Reset progress
                </button>
              </div>
              <Checklist {...checklistProps} />
              <details
                className={`${styles.disclosure} ${styles.launchPathDisclosure}`}
              >
                <summary>
                  <span>
                    <GitBranch size={17} />
                    Adjust your launch path
                  </span>
                  <ChevronDown size={16} />
                </summary>
                <div className={styles.launchPathBody}>
                  <ResearchSnapshotContext guide={guide} />
                  <LaunchPathFields
                    value={launchPath}
                    onChange={updateLaunchPath}
                    disabled={!storageReady}
                  />
                  <p className={styles.navigationNote}>
                    Preferences and blocker notes are browser-local. Research
                    again to investigate changed APIs or scopes.
                  </p>
                </div>
              </details>
              <GuideSections guide={guide} ids={setupSections} />
            </div>
            <aside className={styles.sideNote}>
              <h3>
                <UserRound size={16} />
                Your actions, your credentials.
              </h3>
              <p>
                Signing in, registering the app, choosing scopes, and executing
                OAuth tests are developer actions. AuthPilot has not performed
                these steps.
              </p>
              <p>
                {done} of {applicableSteps.length} applicable checklist steps
                marked complete in this browser.{" "}
                {guide.checklist.length - applicableSteps.length} omitted as not
                applicable; omission is not completion.
                {blocked
                  ? ` ${blocked} ${blocked === 1 ? "step is" : "steps are"} blocked.`
                  : ""}
              </p>
              <button
                className={styles.inlineAction}
                onClick={() => selectTab("sources")}
              >
                Inspect supporting sources
                <ArrowRight size={13} />
              </button>
            </aside>
          </div>
        )}
        {tab === "scopes" && <GuideSections guide={guide} ids={["scopes"]} />}
        {tab === "approval" && (
          <GuideSections guide={guide} ids={["review", "distribution"]} />
        )}
        {tab === "issues" && (
          <GuideSections guide={guide} ids={["troubleshooting"]} />
        )}
        {tab === "sources" && (
          <section className={styles.sources}>
            <div className={styles.sourcesHeading}>
              <h2>Trace every requirement.</h2>
              <span>{guide.sources.length} sources</span>
            </div>
            <p className={styles.sourcesIntro}>
              {guide.origin === "curated"
                ? "These official pages were checked while preparing this guide. Retained source summaries are not server-checked quotations; inspect each requirement for any matched source passage."
                : "These URLs were returned by the live web-search tool and matched against the guide’s citations. Evidence summaries are model interpretations, not independently verified quotations."}{" "}
              Retrieval dates describe documentation research, not a completed
              OAuth setup.
            </p>
            <div className={styles.evidenceNotice}>
              <ShieldCheck size={18} />
              <p>
                <strong>Source confirmed does not mean setup tested.</strong> A
                citation supports a documented requirement. Your account,
                configuration, or approval outcome has not been tested by
                AuthPilot.
              </p>
            </div>
            <div className={styles.sourcesList}>
              {guide.sources.map((source) => (
                <article
                  className={styles.sourceItem}
                  id={`source-${source.id}`}
                  key={source.id}
                >
                  <span className={styles.sourceIcon}>
                    <BookOpen size={20} />
                  </span>
                  <div className={styles.sourceBody}>
                    <h3>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.title}
                        <ArrowUpRight size={14} />
                      </a>
                    </h3>
                    <a
                      className={styles.sourceUrl}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.url}
                    </a>
                    <p className={styles.sourceSummaryLabel}>
                      {guide.origin === "researched"
                        ? "AI evidence summary"
                        : "Guide summary"}{" "}
                      · not a quotation
                    </p>
                    <p>{source.excerpt}</p>
                    <div className={styles.sourceMeta}>
                      <span>{source.publisher}</span>
                      <span>Retrieved {dateLabel(source.retrievedAt)}</span>
                    </div>
                  </div>
                  <span className={styles.sourceKind}>
                    {guide.origin === "curated"
                      ? "Official docs"
                      : "Retrieved source"}
                  </span>
                </article>
              ))}
            </div>
            <Link className={styles.inlineAction} href="/methodology#evidence">
              Read the evidence methodology
              <ArrowUpRight size={13} />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
