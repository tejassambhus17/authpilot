"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCheck,
  CircleAlert,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  checklistStatusSchema,
  type ChecklistStatus,
  type Claim,
  type Guide,
} from "@/lib/schema";
import { ProviderIcon } from "./brand";
import { EvidenceTag } from "./evidence";

const tabs = [
  { id: "guide", label: "Setup guide" },
  { id: "checklist", label: "Your checklist" },
  { id: "sources", label: "Sources & evidence" },
  { id: "automation", label: "Agent boundaries" },
] as const;
type Tab = (typeof tabs)[number]["id"];
const statuses: { value: ChecklistStatus; label: string }[] = [
  { value: "not-started", label: "Not started" },
  { value: "in-progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
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
    <div className="claim-evidence">
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
            <ArrowUpRight size={10} />
          </a>
        ) : null;
      })}
    </div>
  );
}
export function GuideView({ guide }: { guide: Guide }) {
  const [tab, setTab] = useState<Tab>("guide");
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
        if (value && typeof value === "object")
          for (const [id, status] of Object.entries(value)) {
            const result = checklistStatusSchema.safeParse(status);
            if (result.success && guide.checklist.some((s) => s.id === id))
              stored[id] = result.data;
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
  const done = guide.checklist.filter(
    (s) => progress[s.id] === "completed",
  ).length;
  const blocked = guide.checklist.filter(
    (s) => progress[s.id] === "blocked",
  ).length;
  const nextStep = guide.checklist.find((s) => progress[s.id] !== "completed");
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setFeedback("Guide link copied.");
    } catch {
      setFeedback("Copy this guide’s address from your browser to share it.");
    }
  }
  function selectTab(value: Tab, scroll = false) {
    setTab(value);
    if (scroll)
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="page-container guide-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={13} />
        Provider library
      </Link>
      <div className="guide-heading">
        <div className="guide-title-group">
          <span className="provider-icon">
            <ProviderIcon provider={guide.provider} size={34} />
          </span>
          <div>
            <h1>{guide.provider}</h1>
            <p className="guide-subtitle">OAuth integration guide</p>
          </div>
        </div>
        <div className="guide-actions">
          <button className="button" onClick={copyLink}>
            <Copy size={14} />
            Copy guide link
          </button>
          <a
            className="button"
            href={`/api/guides/${guide.id}/export`}
            download
          >
            <Download size={14} />
            Export Markdown
          </a>
        </div>
      </div>
      <p className="guide-description">{guide.description}</p>
      <div className="guide-meta">
        <span>
          <BookOpen size={13} />
          {guide.origin === "curated"
            ? "Curated & source checked"
            : "Researched by the agent"}
        </span>
        <span>
          <ShieldCheck size={13} />
          {guide.sources.length} documented sources
        </span>
        <span>Updated {dateLabel(guide.updatedAt)}</span>
        <a
          className="source-reference"
          href={guide.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          Provider website
          <ExternalLink size={10} />
        </a>
      </div>
      <div className="inline-feedback" role="status" aria-live="polite">
        {feedback}
      </div>
      <div className="guide-overview">
        <div className="overview-cell">
          <span>
            <ClipboardList size={14} />
            Setup complexity
          </span>
          <p>
            <strong>{guide.difficulty}</strong>
          </p>
          <p style={{ fontSize: 10, marginTop: 5 }}>
            OAuth{" "}
            {guide.oauthSupport === "supported"
              ? "supported"
              : guide.oauthSupport === "unclear"
                ? "support unclear"
                : "not confirmed available"}
          </p>
        </div>
        <div className="overview-cell">
          <span>
            <Clock3 size={14} />
            Hands-on effort
          </span>
          <p>{guide.effort.text}</p>
          <ClaimEvidence guide={guide} claim={guide.effort} />
        </div>
        <div className="overview-cell">
          <span>
            <ShieldCheck size={14} />
            Approval & waiting
          </span>
          <p>{guide.approval.text}</p>
          <ClaimEvidence guide={guide} claim={guide.approval} />
        </div>
      </div>
      <div
        ref={tabsRef}
        className="guide-tabs"
        role="tablist"
        aria-label="Guide sections"
        onKeyDown={(e) => {
          const index = tabs.findIndex((t) => t.id === tab);
          const direction =
            e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          let next = index;
          if (direction) next = (index + direction + tabs.length) % tabs.length;
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
            {item.id === "checklist" && (
              <span>
                {done}/{guide.checklist.length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="guide-body-grid">
        <div className="guide-content">
          <div
            id={`panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="tab-panel"
            tabIndex={0}
          >
            {tab === "guide" && (
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
                        integration. A generated guide is not proof that the
                        provider supports your use case.
                      </p>
                    </div>
                  </div>
                )}
                {guide.blockers.length > 0 && (
                  <div className="notice">
                    <CircleAlert size={18} />
                    <div>
                      <strong>Before you build</strong>
                      {guide.blockers.map((blocker, i) => (
                        <div key={i}>
                          <p>{blocker.text}</p>
                          <ClaimEvidence guide={guide} claim={blocker} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {guide.sections.map((section, i) => (
                  <section
                    className="guide-section"
                    key={section.id}
                    id={`section-${section.id}`}
                  >
                    <div className="guide-section-header">
                      <span className="section-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2>{section.title}</h2>
                    </div>
                    <p className="section-summary">{section.summary}</p>
                    <ul className="claim-list">
                      {section.claims.map((claim, j) => (
                        <li className="claim-item" key={j}>
                          {claim.text}
                          <ClaimEvidence guide={guide} claim={claim} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
                {guide.warnings.length > 0 && (
                  <div className="notice neutral">
                    <CircleAlert size={17} />
                    <div>
                      <strong>What remains uncertain</strong>
                      {guide.warnings.map((warning, i) => (
                        <p key={i}>{warning}</p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {tab === "checklist" && (
              <>
                <div className="checklist-header">
                  <div>
                    <h2>Make the next step a small one.</h2>
                    <p>
                      Your checklist is saved in this browser. Shared guides
                      start with a fresh checklist for each reader.
                    </p>
                  </div>
                  <button
                    className="button button-small"
                    onClick={resetProgress}
                    disabled={!Object.keys(progress).length}
                  >
                    <RotateCcw size={12} />
                    Reset progress
                  </button>
                </div>
                {storageError && (
                  <div className="notice error" role="alert">
                    <CircleAlert size={16} />
                    <p>{storageError}</p>
                  </div>
                )}
                <div className="checklist-items">
                  {guide.checklist.map((step, i) => (
                    <div className="checklist-item" key={step.id}>
                      <span
                        className={`step-check ${progress[step.id] || "not-started"}`}
                      >
                        {progress[step.id] === "completed" ? (
                          <Check size={13} />
                        ) : (
                          String(i + 1).padStart(2, "0")
                        )}
                      </span>
                      <div className="checklist-item-body">
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                        <div className="checklist-item-meta">
                          <select
                            className={`status-select ${progress[step.id] || "not-started"}`}
                            disabled={!storageReady}
                            aria-label={`Status for ${step.title}`}
                            value={progress[step.id] || "not-started"}
                            onChange={(e) =>
                              updateProgress(
                                step.id,
                                e.target.value as ChecklistStatus,
                              )
                            }
                          >
                            {statuses.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          <span>
                            {step.actor === "developer" ? (
                              <UserRound size={11} />
                            ) : step.actor === "agent" ? (
                              <Sparkles size={11} />
                            ) : (
                              <ShieldCheck size={11} />
                            )}{" "}
                            {step.actor === "developer"
                              ? "Your action"
                              : step.actor === "agent"
                                ? "Agent can assist"
                                : "Provider decision"}
                          </span>
                          <button
                            className="source-reference"
                            style={{
                              border: 0,
                              background: "none",
                              padding: 0,
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              selectTab("guide");
                              requestAnimationFrame(() =>
                                document
                                  .getElementById(`section-${step.sectionId}`)
                                  ?.scrollIntoView({ behavior: "smooth" }),
                              );
                            }}
                          >
                            Read guidance
                            <ArrowUpRight size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab === "sources" && (
              <>
                <h2>Trace every requirement.</h2>
                <p className="sources-intro">
                  {guide.origin === "curated"
                    ? "These official pages were checked while preparing this guide. Excerpts are short supporting quotations; the linked documentation is authoritative."
                    : "These URLs were returned by the live web-search tool and matched against this guide’s citations. Evidence summaries are model interpretations, not independently verified quotations."}{" "}
                  Retrieval dates describe documentation research. No account
                  registration or OAuth exchange was attempted.
                </p>
                <div className="notice neutral">
                  <ShieldCheck size={17} />
                  <div>
                    <strong>Source confirmed ≠ setup tested</strong>
                    <p>
                      Evidence supports a documented requirement. Your specific
                      account, app configuration, or approval outcome has not
                      been tested.
                    </p>
                  </div>
                </div>
                {guide.sources.map((source, i) => (
                  <article
                    className="source-item"
                    key={source.id}
                    id={`source-${source.id}`}
                  >
                    <h3>
                      <span
                        style={{
                          color: "var(--muted)",
                          fontSize: 10,
                          marginRight: 7,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
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
                      className="source-url"
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.url}
                    </a>
                    <p>{source.excerpt}</p>
                    <div className="source-date">
                      <span>{source.publisher}</span>
                      <span>Retrieved {dateLabel(source.retrievedAt)}</span>
                      <span>
                        {guide.origin === "curated"
                          ? "Official documentation"
                          : "Search-returned source"}
                      </span>
                    </div>
                  </article>
                ))}
                <p className="sources-intro">
                  <Link
                    href="/methodology#evidence"
                    className="source-reference"
                  >
                    Read the evidence methodology
                    <ArrowUpRight size={11} />
                  </Link>
                </p>
              </>
            )}
            {tab === "automation" && (
              <>
                <h2>A useful agent. Clear handoffs.</h2>
                <p className="sources-intro">
                  AuthPilot researches public documentation and prepares your
                  plan. It does not access your provider accounts or execute
                  OAuth setup. These boundaries apply to every checklist item.
                </p>
                <section className="boundary-section">
                  <h3>
                    <Sparkles size={18} />
                    The agent can help with
                  </h3>
                  <ul>
                    {guide.automation.canDo.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className="boundary-section">
                  <h3>
                    <UserRound size={18} />
                    You take over for
                  </h3>
                  <ul>
                    {guide.automation.requiresHuman.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className="boundary-section">
                  <h3>
                    <LockKeyhole size={18} />
                    The agent never does
                  </h3>
                  <ul>
                    {guide.automation.neverDoes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>
        </div>
        <aside className="guide-rail" aria-label="Your guide progress">
          <div className="rail-sticky">
            <div className="progress-panel">
              <h3>
                <ClipboardList size={15} />
                Your integration
              </h3>
              <div className="progress-count">
                <strong>
                  {done}
                  <small> / {guide.checklist.length}</small>
                </strong>
                <span>steps complete</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Checklist completion"
                aria-valuemin={0}
                aria-valuemax={guide.checklist.length}
                aria-valuenow={done}
              >
                <span
                  style={{
                    transform: `scaleX(${done / guide.checklist.length})`,
                  }}
                />
              </div>
              <p>
                {blocked
                  ? `${blocked} step${blocked === 1 ? " is" : "s are"} blocked. Review the related guidance.`
                  : "Progress saved in this browser, just for you."}
              </p>
              <div className="next-step">
                <span>{nextStep ? "UP NEXT" : "READY FOR YOUR REVIEW"}</span>
                {nextStep?.title || "All checklist steps completed."}
              </div>
              <button
                className="button"
                onClick={() => selectTab("checklist", true)}
              >
                {done === guide.checklist.length ? (
                  <CheckCheck size={13} />
                ) : (
                  <ArrowRight size={13} />
                )}
                Open your checklist
              </button>
            </div>
            {tab === "guide" && (
              <nav className="rail-nav" aria-label="On this page">
                <strong>IN THIS GUIDE</strong>
                {guide.sections.map((s) => (
                  <a key={s.id} href={`#section-${s.id}`}>
                    {s.title}
                  </a>
                ))}
              </nav>
            )}
            <div className="rail-research-note">
              <ShieldCheck size={13} />
              Documentation researched.
              <br />
              Account setup not tested.
              <br />
              <Link href="/methodology" className="source-reference">
                Understand the evidence
                <ArrowUpRight size={10} />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
