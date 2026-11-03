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
  type ChecklistStatus,
  type Claim,
  type Guide,
  type SectionId,
} from "@/lib/schema";
import { ProviderIcon } from "./brand";
import { EvidenceTag } from "./evidence";
import { SaveGuideButton } from "./save-guide-button";
import { EvidenceInspector } from "./evidence-inspector";
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
];
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

type ChecklistProps = {
  guide: Guide;
  progress: Record<string, ChecklistStatus>;
  ready: boolean;
  compact?: boolean;
  onChange: (id: string, status: ChecklistStatus) => void;
  onRead: (sectionId: SectionId) => void;
};

function Checklist({
  guide,
  progress,
  ready,
  compact = false,
  onChange,
  onRead,
}: ChecklistProps) {
  const done = guide.checklist.filter(
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
          {done} / {guide.checklist.length} completed
        </span>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Checklist completion"
        aria-valuemin={0}
        aria-valuemax={guide.checklist.length}
        aria-valuenow={done}
      >
        <span
          style={{ transform: `scaleX(${done / guide.checklist.length})` }}
        />
      </div>
      <ol className={styles.checklistItems} aria-label="Checklist steps">
        {guide.checklist.map((step) => {
          const status = progress[step.id] || "not-started";
          const { dependencies, inferredOrder } = getStepDependencies(
            guide.checklist,
            step,
            progress,
          );
          const unmet = dependencies.filter(
            (item) => item.status !== "completed",
          );
          const documentation = getStepDocumentation(guide, step);
          return (
            <li className={styles.checklistItem} key={step.id}>
              <label
                className={`${styles.stepLabel} ${status === "completed" ? styles.completed : ""}`}
              >
                <input
                  type="checkbox"
                  checked={status === "completed"}
                  disabled={!ready}
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
              {!compact && status === "blocked" && (
                <div className={styles.stepRecovery}>
                  <strong>Blocked — resolve before continuing</strong>
                  <p>
                    {step.recovery ||
                      "You marked this task blocked; its specific reason was not recorded. Review the guidance and documentation, resolve the prerequisite, then update the status when you can continue."}
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
                  disabled={!ready}
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
}: {
  guide: Guide;
  progress: Record<string, ChecklistStatus>;
  ready: boolean;
  onRead: (section: SectionId) => void;
}) {
  const next = getGuideNextStep(guide, progress);
  const step = next.step;
  const docs = step ? getStepDocumentation(guide, step) : null;
  const otherBlockers = next.blockedSteps.filter(
    (blocked) =>
      blocked.id !== (next.kind === "blocked" ? step?.id : undefined),
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
        {next.kind === "blocked" ? "Resolve a blocker" : "Your next step"}
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
                    : "Your checklist is complete. Review your real integration and the current provider requirements before launch.")}
          </p>
          {next.kind === "blocked" && step && (
            <div className={styles.recoveryInstructions}>
              <h4>Recovery</h4>
              <p>
                {next.supportRestricted
                  ? "Verify in official documentation or with the provider that OAuth is available for your intended integration. Do not register an app, configure credentials or redirects, choose scopes, or execute a flow until support is established. If OAuth is unavailable, investigate a supported alternative. Your personal checklist status has not been changed."
                  : step.recovery ||
                    "The specific blocker reason was not recorded in this guide. Review this step’s guidance, identify the missing prerequisite or permission, and resolve it with the appropriate account owner or provider. Update the checklist when you can continue."}
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
                  : "Dependencies completed"}
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
  const tabsRef = useRef<HTMLDivElement>(null);
  const storageKey = `authpilot:checklist:${guide.id}:v1`;

  useEffect(() => {
    const stored: Record<string, ChecklistStatus> = {};
    let error = "";
    try {
      const raw = localStorage.getItem(storageKey);
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
      setStorageError(error);
      setStorageReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey, guide.checklist]);

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
    try {
      localStorage.removeItem(storageKey);
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
    requestAnimationFrame(() =>
      document
        .getElementById(`section-${sectionId}`)
        ?.scrollIntoView({ block: "start" }),
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setFeedback("Guide link copied.");
    } catch {
      setFeedback("Copy this guide’s address from your browser to share it.");
    }
  }

  const done = guide.checklist.filter(
    (step) => progress[step.id] === "completed",
  ).length;
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
                      <p>{guide.effort.text}</p>
                      <ClaimEvidence claim={guide.effort} guide={guide} />
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
                {done} of {guide.checklist.length} checklist steps marked
                complete in this browser.
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
