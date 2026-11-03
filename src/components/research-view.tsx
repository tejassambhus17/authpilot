"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Circle,
  CircleAlert,
  ExternalLink,
  FileCheck2,
  FileSearch,
  FileText,
  Globe2,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Search,
  ShieldCheck,
  Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  defaultLaunchPath,
  researchInputSchema,
  type LaunchPath,
  type ResearchEvent,
  type ResearchPhase,
} from "@/lib/schema";
import {
  getDiscoveredSources,
  getResearchProgress,
  publicEvidenceUrl,
} from "@/lib/research-progress";
import { ProviderIcon } from "./brand";
import { LaunchPathFields } from "./launch-path-fields";
import styles from "./research-view.module.css";

type Readiness = {
  apiKeyConfigured: boolean;
  persistenceConfigured: boolean;
  researchReady: boolean;
  accessTokenRequired: boolean;
};

const phases = new Set<ResearchPhase>([
  "accepted",
  "searching",
  "source-found",
  "synthesizing",
  "validating",
  "saving",
  "complete",
  "error",
]);
const phaseLabels: Record<ResearchPhase, string> = {
  accepted: "Request accepted",
  searching: "Finding documentation",
  "source-found": "Documentation returned",
  synthesizing: "Building your guide",
  validating: "Checking the evidence",
  saving: "Saving your guide",
  complete: "Guide saved",
  error: "Research stopped",
};
const stateLabels = {
  pending: "Pending",
  active: "In progress",
  completed: "Completed",
  failed: "Interrupted",
};

function parseEvent(line: string): ResearchEvent {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new Error(
      "The research stream returned an unreadable event. Please retry.",
    );
  }
  if (!value || typeof value !== "object")
    throw new Error(
      "The research stream returned an unreadable event. Please retry.",
    );
  const event = value as Partial<ResearchEvent>;
  if (
    !event.phase ||
    !phases.has(event.phase) ||
    typeof event.message !== "string" ||
    !event.message ||
    typeof event.timestamp !== "string" ||
    !Number.isFinite(Date.parse(event.timestamp))
  ) {
    throw new Error(
      "The research stream returned an unreadable event. Please retry.",
    );
  }
  if (event.guideId !== undefined && typeof event.guideId !== "string")
    throw new Error(
      "The research stream returned an unreadable guide link. Please retry.",
    );
  if (event.requestId !== undefined && !requestReference(event.requestId))
    throw new Error(
      "The research stream returned an unreadable request reference. Please retry.",
    );
  return event as ResearchEvent;
}

function requestReference(value: unknown): string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{8,80}$/.test(value)
    ? value
    : "";
}

export function ResearchView() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [activeQuery, setActiveQuery] = useState("");
  const [token, setToken] = useState("");
  const [launchPath, setLaunchPath] = useState<LaunchPath>(defaultLaunchPath);
  const [requestId, setRequestId] = useState("");
  const [pathStorageFailed, setPathStorageFailed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [events, setEvents] = useState<ResearchEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState("");
  const [guideId, setGuideId] = useState("");
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [statusError, setStatusError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!running) return;
    const started = Date.now();
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setReadiness)
      .catch(() => {
        if (!controller.signal.aborted) setStatusError(true);
      });
    return () => {
      controller.abort();
      abortRef.current?.abort();
    };
  }, []);

  async function research(event: React.FormEvent) {
    event.preventDefault();
    setRequestId("");
    const parsed = researchInputSchema.safeParse({ query, launchPath });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message || "Enter a provider name or website.",
      );
      inputRef.current?.focus();
      return;
    }
    const input = parsed.data;
    setError("");
    setPathStorageFailed(false);
    setGuideId("");
    setEvents([]);
    setActiveQuery(input.query);
    setAttempted(true);
    setElapsed(0);
    setRunning(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let receivedComplete = false;
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-research-token": token } : {}),
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      setRequestId(requestReference(response.headers.get("X-Request-Id")));
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (requestReference(body?.requestId))
          setRequestId(requestReference(body.requestId));
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : typeof body?.message === "string"
              ? body.message
              : `Research could not start (${response.status}). Please try again.`,
        );
      }
      if (!response.body)
        throw new Error(
          "The server did not return a research stream. Please retry.",
        );
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      function consume(line: string) {
        if (!line.trim()) return;
        const researchEvent = parseEvent(line);
        if (researchEvent.requestId) setRequestId(researchEvent.requestId);
        setEvents((previous) => [...previous, researchEvent]);
        if (researchEvent.phase === "error")
          throw new Error(researchEvent.message);
        if (researchEvent.phase === "complete" && researchEvent.guideId) {
          try {
            localStorage.setItem(
              `authpilot:launch-path:${researchEvent.guideId}:v1`,
              JSON.stringify(input.launchPath),
            );
          } catch {
            setPathStorageFailed(true);
          }
          receivedComplete = true;
          setGuideId(researchEvent.guideId);
        }
      }
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          if (buffer.trim()) consume(buffer);
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        lines.forEach(consume);
      }
      if (!receivedComplete)
        throw new Error(
          "The connection ended before the guide was saved. Please retry your research.",
        );
    } catch (failure) {
      if (controller.signal.aborted)
        setError(
          "Research cancelled. No completed guide was received. You can start again when you’re ready.",
        );
      else
        setError(
          failure instanceof Error
            ? failure.message
            : "Research failed. Please try again.",
        );
    } finally {
      // Stop a partial stream after parsing errors as well as explicit cancellation.
      controller.abort();
      setRunning(false);
      abortRef.current = null;
    }
  }

  const displayQuery =
    activeQuery ||
    (researchInputSchema.safeParse({ query }).success ? query.trim() : "");
  const latest = events.at(-1);
  const sources = getDiscoveredSources(events);
  const steps = getResearchProgress(events, running, Boolean(error));
  const hasActivity = attempted || events.length > 0 || running;
  const status = guideId
    ? "Guide saved"
    : error
      ? "Research needs attention"
      : running
        ? latest
          ? phaseLabels[latest.phase]
          : "Submitting request"
        : "Ready when you are";

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.back}>
        <ArrowLeft size={15} />
        Back to Explore
      </Link>
      <header className={styles.heading}>
        <div className={styles.providerHeading}>
          <span className={styles.providerIcon}>
            <ProviderIcon provider={displayQuery} size={31} />
          </span>
          <div>
            <h1>
              {running
                ? "Researching"
                : guideId
                  ? "Research complete"
                  : "Research a provider"}
              {displayQuery ? (
                <>
                  <span className={styles.colon}>: </span>
                  {displayQuery}
                </>
              ) : null}
            </h1>
            <p>
              Investigate OAuth setup, requirements, and approval paths using
              current documentation.
            </p>
          </div>
        </div>
        <div
          className={`${styles.status} ${error ? styles.errorStatus : ""}`}
          role="status"
          aria-live="polite"
        >
          {running ? (
            <LoaderCircle size={16} className={styles.spinner} />
          ) : guideId ? (
            <FileCheck2 size={16} />
          ) : error ? (
            <CircleAlert size={16} />
          ) : (
            <Search size={16} />
          )}
          {status}
        </div>
      </header>

      <form className={styles.form} onSubmit={research}>
        <label htmlFor="provider-query" className={styles.label}>
          Which provider are you integrating?
        </label>
        <div className={styles.inputRow}>
          <div className={styles.inputWrap}>
            <Link2 size={18} />
            <input
              ref={inputRef}
              id="provider-query"
              name="provider"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Provider name or website, e.g. Notion or notion.so"
              maxLength={160}
              disabled={running}
              aria-describedby="provider-help"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="button button-primary"
            disabled={running}
          >
            {running ? (
              <LoaderCircle size={16} className={styles.spinner} />
            ) : null}
            {running ? "Researching…" : "Research provider"}
            {!running && <ArrowRight size={16} />}
          </button>
          {running && (
            <button
              type="button"
              className="button"
              onClick={() => abortRef.current?.abort()}
            >
              <Square size={12} />
              Cancel research
            </button>
          )}
        </div>
        <p className={styles.fieldHelp} id="provider-help">
          Public names and websites only. Never enter API keys, client secrets,
          or private account information.
        </p>
        <details className={styles.launchDetails} open={!attempted}>
          <summary>
            Your launch path ·{" "}
            {launchPath.audience === "unsure"
              ? "Audience not selected"
              : launchPath.audience === "internal"
                ? "Internal audience"
                : "Public audience"}
          </summary>
          <LaunchPathFields
            value={launchPath}
            onChange={setLaunchPath}
            disabled={running}
          />
        </details>
        <p className={styles.fieldHelp}>
          Use generic API and scope names only. This context informs a public,
          shareable guide; do not include private project details.
        </p>
        <div className={styles.formFooter}>
          {(readiness?.accessTokenRequired || statusError) && (
            <details
              className={styles.accessDetails}
              open={readiness?.accessTokenRequired || undefined}
            >
              <summary>
                Deployment access token
                {readiness?.accessTokenRequired
                  ? " (required)"
                  : " (if required)"}
              </summary>
              <label htmlFor="research-token" className="sr-only">
                Research access token
              </label>
              <input
                className={styles.tokenInput}
                id="research-token"
                type="password"
                autoComplete="off"
                placeholder="Token supplied by the deployment owner"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                disabled={running}
              />
              <p className={styles.fieldHelp}>
                Used for this request only; never saved in your browser.
              </p>
            </details>
          )}
          <div className={styles.readiness}>
            {readiness ? (
              <>
                <ShieldCheck size={13} />
                <span>
                  {readiness.researchReady
                    ? "Live research configured"
                    : !readiness.apiKeyConfigured
                      ? "Live research needs OPENAI_API_KEY in .env.local. Existing guides are ready to use."
                      : "Durable database configuration is required before research can be saved."}
                </span>
              </>
            ) : statusError ? (
              <>
                <CircleAlert size={13} />
                <span>
                  Could not check service readiness. Try the request or refresh
                  this page.
                </span>
              </>
            ) : (
              <>
                <LoaderCircle size={13} className={styles.spinner} />
                <span>Checking research configuration</span>
              </>
            )}
          </div>
        </div>
      </form>

      {running && (
        <p className={styles.requestMeta} aria-live="off">
          Elapsed {Math.floor(elapsed / 60)}:
          {String(elapsed % 60).padStart(2, "0")}. Research may take several
          minutes; the server stops requests after 4 minutes 30 seconds.
          {requestId && (
            <>
              {" "}
              Request reference: <code>{requestId}</code>.
            </>
          )}
        </p>
      )}

      {error && (
        <div className={`notice error ${styles.alert}`} role="alert">
          <CircleAlert size={19} />
          <div>
            <strong>Research needs your attention</strong>
            <p>{error}</p>
            {requestId && (
              <p className={styles.requestMeta}>
                Request reference: <code>{requestId}</code>
              </p>
            )}
            <p className={styles.recovery}>
              {error.includes("OPENAI_API_KEY") ? (
                <Link href="/methodology#setup" className="source-reference">
                  See local setup instructions
                  <ArrowRight size={12} />
                </Link>
              ) : (
                "Your input is preserved. Resolve the issue and select Research provider to retry."
              )}
            </p>
          </div>
        </div>
      )}
      {guideId && (
        <section className={styles.complete} aria-label="Research complete">
          <span className={styles.completeIcon}>
            <FileCheck2 size={23} />
          </span>
          <div>
            <h2>Your guide is ready.</h2>
            <p>
              Saved with its evidence and a persistent URL. Review the sources
              before you configure your app.
              {pathStorageFailed &&
                " Your browser could not retain your launch preferences; choose them again in the guide."}
            </p>
          </div>
          <Link
            href={`/guides/${encodeURIComponent(guideId)}`}
            className="button button-primary"
          >
            Open your guide
            <ArrowRight size={16} />
          </Link>
        </section>
      )}

      <div className={styles.researchGrid}>
        <section
          className={styles.timelinePanel}
          aria-labelledby="workflow-heading"
        >
          <div className={styles.panelLabel}>
            <h2 id="workflow-heading">
              {running
                ? "Research in progress"
                : guideId
                  ? "Research completed"
                  : error && hasActivity
                    ? "Research interrupted"
                    : "The research workflow"}
            </h2>
            <span>
              {hasActivity
                ? "Based on observed events"
                : "Starts when you submit"}
            </span>
          </div>
          <ol className={styles.timeline} aria-label="Research progress">
            {steps.map((step) => (
              <li
                key={step.id}
                className={`${styles.step} ${styles[step.state]}`}
                data-state={step.state}
              >
                <span className={styles.stepIcon} aria-hidden="true">
                  {step.state === "completed" ? (
                    <Check size={15} />
                  ) : step.state === "active" ? (
                    <LoaderCircle size={23} className={styles.spinner} />
                  ) : step.state === "failed" ? (
                    <CircleAlert size={23} />
                  ) : (
                    <Circle size={23} />
                  )}
                </span>
                <div className={styles.stepText}>
                  <div>
                    <h3>{step.title}</h3>
                    <span>{stateLabels[step.state]}</span>
                  </div>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.eventNote}>
            Setup and approval findings are organized together during guide
            generation. AuthPilot does not access provider accounts or test an
            OAuth setup.
          </p>
        </section>

        <section
          className={styles.evidencePanel}
          aria-labelledby="sources-heading"
        >
          <div className={styles.evidenceHeader}>
            <h2 id="sources-heading">
              <FileSearch size={18} />
              Documentation found
            </h2>
            <span className={styles.sourceCount} aria-live="polite">
              {sources.length} {sources.length === 1 ? "source" : "sources"}
            </span>
          </div>
          {sources.length ? (
            <>
              <ul
                className={styles.sourceList}
                aria-label="Discovered documentation"
              >
                {sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open source: ${source.title}`}
                      className={styles.sourceLink}
                    >
                      <span className={styles.sourceIcon}>
                        {source.classification === "Documentation candidate" ? (
                          <FileText size={21} />
                        ) : (
                          <Globe2 size={21} />
                        )}
                      </span>
                      <div className={styles.sourceText}>
                        <h3>{source.title}</h3>
                        <span className={styles.sourceDomain}>
                          {source.domain}
                        </span>
                        <span className={styles.sourceUrl}>{source.url}</span>
                        <span className={styles.classification}>
                          {source.classification}
                        </span>
                      </div>
                      <ArrowUpRight size={16} className={styles.sourceArrow} />
                    </a>
                  </li>
                ))}
              </ul>
              <p className={styles.sourceFootnote}>
                These links were returned by web search. Retrieval alone does
                not verify a requirement; inspect the citations and evidence
                labels in the completed guide.
              </p>
            </>
          ) : (
            <div className={styles.sourceEmpty}>
              <FileSearch size={29} />
              <h3>
                {running
                  ? "Waiting for documentation"
                  : "The evidence will appear here."}
              </h3>
              <p>
                {running
                  ? "Sources appear when the web-search tool returns them. The agent has not returned a source yet."
                  : "Start a real research request to see the returned source titles, domains, and links."}
              </p>
            </div>
          )}
        </section>
      </div>

      {hasActivity && (
        <section className={styles.journal} aria-labelledby="journal-title">
          <div className={styles.journalHeading}>
            <h2 id="journal-title">Research journal</h2>
            <span>
              {events.length} observed{" "}
              {events.length === 1 ? "event" : "events"}
            </span>
          </div>
          <details className={styles.journalDetails}>
            <summary>View observed events</summary>
            {events.length ? (
              <ol
                className={`journal-events ${styles.journalEvents}`}
                data-testid="research-events"
              >
                {events.map((event, index) => {
                  const sourceUrl = publicEvidenceUrl(event.url);
                  return (
                    <li
                      key={`${event.timestamp}-${index}`}
                      className={styles.journalEvent}
                    >
                      <span>
                        {event.phase === "error" ? (
                          <CircleAlert size={14} />
                        ) : (
                          <Check size={14} />
                        )}
                      </span>
                      <div>
                        <p>{event.message}</p>
                        {sourceUrl && (
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {sourceUrl}
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <time dateTime={event.timestamp}>
                        {new Date(event.timestamp).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </time>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className={styles.noEvents}>
                {running
                  ? "The request is in flight. Waiting for the first server event."
                  : "No research events were returned. Resolve the request error and retry."}
              </p>
            )}
          </details>
        </section>
      )}

      <section className={styles.boundaries}>
        <LockKeyhole size={16} />
        <p>
          <strong>Research, with clear boundaries.</strong> The agent reads
          public documentation. You sign in, choose scopes, store credentials,
          and run the integration. Provider approval stays with the provider.
          Research uses the deployment’s paid API and can take a few minutes.{" "}
          <Link href="/methodology">
            How it works
            <ArrowUpRight size={11} />
          </Link>
        </p>
      </section>
    </div>
  );
}
