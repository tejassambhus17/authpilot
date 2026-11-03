"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Compass,
  ExternalLink,
  FileCheck2,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Search,
  ShieldCheck,
  Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { researchInputSchema, type ResearchEvent } from "@/lib/schema";

type Readiness = {
  apiKeyConfigured: boolean;
  persistenceConfigured: boolean;
  researchReady: boolean;
  accessTokenRequired: boolean;
};
export function ResearchView() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [token, setToken] = useState("");
  const [events, setEvents] = useState<ResearchEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [guideId, setGuideId] = useState("");
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [statusError, setStatusError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setReadiness)
      .catch(() => {
        if (!controller.signal.aborted) setStatusError(true);
      });
    return () => {
      controller.abort();
      abortRef.current?.abort();
    };
  }, []);
  async function research(e: React.FormEvent) {
    e.preventDefault();
    const parsed = researchInputSchema.safeParse({ query });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message || "Enter a provider name or website.",
      );
      inputRef.current?.focus();
      return;
    }
    setError("");
    setGuideId("");
    setEvents([]);
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
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
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
        const event = JSON.parse(line) as ResearchEvent;
        if (!event.phase || !event.message || !event.timestamp)
          throw new Error(
            "The research stream returned an unreadable event. Please retry.",
          );
        setEvents((prev) => [...prev, event]);
        if (event.phase === "error") throw new Error(event.message);
        if (event.phase === "complete" && event.guideId) {
          receivedComplete = true;
          setGuideId(event.guideId);
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
    } catch (err) {
      if (controller.signal.aborted)
        setError(
          "Research cancelled. No completed guide was received. You can start again when you’re ready.",
        );
      else
        setError(
          err instanceof Error
            ? err.message
            : "Research failed. Please try again.",
        );
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }
  return (
    <div className="page-container research-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={13} />
        Provider library
      </Link>
      <h1>
        A new provider.
        <br />A clear way forward.
      </h1>
      <p className="page-lead">
        Point AuthPilot at any app. The agent investigates its official OAuth
        documentation and builds an actionable guide, with the evidence
        attached.
      </p>
      <form className="research-form-panel" onSubmit={research}>
        <label htmlFor="provider-query" className="field-label">
          Which provider are you integrating?
        </label>
        <div className="research-input-row">
          <div className="research-input">
            <Globe2 size={18} />
            <input
              ref={inputRef}
              id="provider-query"
              name="provider"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="A provider name or website, e.g. notion.so"
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
              <LoaderCircle size={15} className="loading-icon" />
            ) : (
              <Compass size={16} />
            )}{" "}
            {running ? "Researching…" : "Research provider"}
            {!running && <ArrowUpRight size={14} />}
          </button>
        </div>
        <p className="field-help" id="provider-help">
          Use a public provider name or URL. Never enter API keys, client
          secrets, or private account information.
        </p>
        <div className="example-providers">
          <span>Try a new path</span>
          {["Notion", "Linear", "Spotify"].map((name) => (
            <button
              type="button"
              key={name}
              disabled={running}
              onClick={() => {
                setQuery(name);
                inputRef.current?.focus();
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <details open={readiness?.accessTokenRequired || undefined}>
          <summary>
            Deployment access token
            {readiness?.accessTokenRequired
              ? " (required for this deployment)"
              : " (if required)"}
          </summary>
          <label htmlFor="research-token" className="sr-only">
            Research access token
          </label>
          <input
            className="token-input"
            id="research-token"
            type="password"
            autoComplete="off"
            placeholder="Access token supplied by the deployment owner"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={running}
          />
          <p className="field-help">
            Used for this request only; never saved in your browser.
          </p>
        </details>
        {readiness && (
          <div className="readiness">
            {readiness.researchReady ? (
              <ShieldCheck size={13} />
            ) : (
              <CircleAlert size={13} />
            )}
            <span>
              {readiness.researchReady
                ? "Live research is configured. Requests use the deployment’s OpenAI account."
                : !readiness.apiKeyConfigured
                  ? "Live research needs OPENAI_API_KEY in .env.local. Existing guides are ready to use."
                  : "Durable database configuration is required before research can be saved."}
            </span>
          </div>
        )}
        {statusError && (
          <p className="field-help">
            Could not check service readiness. You can still try the request or
            refresh the page.
          </p>
        )}
      </form>
      {error && (
        <div className="notice error" style={{ marginTop: 20 }} role="alert">
          <CircleAlert size={18} />
          <div>
            <strong>Research needs your attention</strong>
            <p>{error}</p>
            <p style={{ marginTop: 8 }}>
              {error.includes("OPENAI_API_KEY") ? (
                <Link href="/methodology#setup" className="source-reference">
                  See local setup instructions
                  <ArrowRight size={11} />
                </Link>
              ) : (
                "Your input is preserved. Resolve the issue and select Research provider to retry."
              )}
            </p>
          </div>
        </div>
      )}
      {(events.length > 0 || running) && (
        <section className="research-journal" aria-labelledby="journal-title">
          <div className="journal-header">
            <h2 id="journal-title">
              {running ? (
                <LoaderCircle className="loading-icon" size={18} />
              ) : guideId ? (
                <FileCheck2 size={18} />
              ) : (
                <Search size={18} />
              )}
              Research journal
            </h2>
            {running ? (
              <button
                className="button button-small"
                onClick={() => abortRef.current?.abort()}
              >
                <Square size={11} />
                Cancel research
              </button>
            ) : (
              <span className="evidence-tag">
                {guideId ? "Guide saved" : "Research stopped"}
              </span>
            )}
          </div>
          <p className="journal-intro">
            Events below come from the live tool and application. There are no
            simulated steps or estimated percentages.
          </p>
          <ol
            className="journal-events"
            aria-live="polite"
            aria-relevant="additions"
          >
            {events.map((event, i) => (
              <li
                key={`${event.timestamp}-${i}`}
                className={`journal-event ${event.phase === "error" ? "event-error" : ""}`}
              >
                {event.phase === "error" ? (
                  <CircleAlert size={15} />
                ) : (
                  <Check size={15} />
                )}
                <div>
                  <p>{event.message}</p>
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {event.url}
                      <ExternalLink
                        size={9}
                        style={{ display: "inline", marginLeft: 4 }}
                      />
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
            ))}
          </ol>
          {guideId && (
            <div className="research-complete">
              <p>Your guide has a persistent, shareable URL.</p>
              <Link
                className="button button-primary"
                href={`/guides/${guideId}`}
              >
                Open your guide
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>
      )}
      {!running && !events.length && (
        <section
          className="research-flow-explainer"
          aria-label="The research process"
        >
          <div>
            <span>
              <Search size={20} />
            </span>
            <h3>Find the official story</h3>
            <p>
              Real web search investigates provider docs, app registration, and
              production requirements.
            </p>
          </div>
          <div>
            <span>
              <ShieldCheck size={20} />
            </span>
            <h3>Keep the evidence attached</h3>
            <p>
              Requirements link to retrieved sources. Estimates and missing
              information are labeled.
            </p>
          </div>
          <div>
            <span>
              <FileCheck2 size={20} />
            </span>
            <h3>Leave with a plan</h3>
            <p>
              Get a saved guide, practical checklist, approval blockers, and
              Markdown you can take with you.
            </p>
          </div>
        </section>
      )}
      <section className="research-notice">
        <h3>
          <LockKeyhole size={14} />
          Research, with boundaries.
        </h3>
        <p>
          The agent reads public documentation. It cannot sign into your
          account, register an app, handle your secrets, or get provider
          approval. Research may take a few minutes and uses a paid API when
          configured. If official evidence is unavailable, the guide will say
          so.{" "}
          <Link href="/methodology" className="source-reference">
            How it works
            <ArrowUpRight size={10} />
          </Link>
        </p>
      </section>
    </div>
  );
}
