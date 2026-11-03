"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Link2,
  Share2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { researchInputSchema, type Guide } from "@/lib/schema";
import { ProviderIcon } from "./brand";

export function Directory({ guides }: { guides: Guide[] }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const examples = ["GitHub", "Slack", "Google"]
    .map((name) =>
      guides.find((g) => g.provider === name && g.origin === "curated"),
    )
    .filter((g): g is Guide => Boolean(g));
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = researchInputSchema.safeParse({ query });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message || "Enter a provider name or website.",
      );
      input.current?.focus();
      return;
    }
    setError("");
    setSubmitting(true);
    router.push(`/research?q=${encodeURIComponent(parsed.data.query)}`);
  }
  return (
    <div className="explore-page">
      <section className="explore-hero">
        <span className="hero-label">
          <Sparkles size={14} />
          AI research for OAuth
        </span>
        <h1>
          Your clear path to <span>OAuth</span> setup.
        </h1>
        <p className="hero-description">
          Research providers, understand requirements, and get a
          <br className="desktop-break" /> source-backed setup guide.
        </p>
        <form
          className={`explore-form ${error ? "invalid" : ""}`}
          onSubmit={submit}
        >
          <Link2 size={21} aria-hidden="true" />
          <label htmlFor="explore-provider" className="sr-only">
            Which provider are you integrating?
          </label>
          <input
            ref={input}
            id="explore-provider"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter an app or developer platform (e.g. GitHub, Slack, Google…)"
            maxLength={160}
            autoComplete="off"
            disabled={submitting}
            aria-describedby="explore-help"
            aria-invalid={Boolean(error)}
          />
          <button
            className="button button-primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Opening research…" : "Research"}
            <ArrowRight size={18} />
          </button>
        </form>
        <p
          id="explore-help"
          className={error ? "explore-help input-error" : "explore-help"}
          role={error ? "alert" : undefined}
        >
          {error ||
            "Enter a provider name or public website. Research starts on the next screen."}
        </p>
        <div className="example-providers">
          <h2>Explore an existing guide</h2>
          <div className="example-links">
            {examples.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.id}`}
                className="example-pill"
                aria-label={`${guide.provider} integration guide`}
              >
                <ProviderIcon provider={guide.provider} size={22} />
                {guide.provider}
                <ArrowUpRight size={12} />
              </Link>
            ))}
          </div>
          <Link href="/guides" className="browse-link">
            Browse all {guides.length} guides
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
      <section
        className="explore-features"
        aria-label="What AuthPilot helps you do"
      >
        <Link href="/research" className="feature-summary">
          <span className="feature-symbol">
            <Zap size={24} />
          </span>
          <div>
            <h2>Live research</h2>
            <p>Find current documentation and keep the sources attached.</p>
          </div>
          <ArrowUpRight size={14} />
        </Link>
        <Link href="/guides" className="feature-summary">
          <span className="feature-symbol">
            <BookOpenCheck size={24} />
          </span>
          <div>
            <h2>Actionable setup guides</h2>
            <p>Navigate setup steps, scopes, approvals, and common blockers.</p>
          </div>
          <ArrowUpRight size={14} />
        </Link>
        <Link href="/methodology#evidence" className="feature-summary">
          <span className="feature-symbol">
            <Share2 size={24} />
          </span>
          <div>
            <h2>Shareable results</h2>
            <p>Save a guide, share its URL, or take the Markdown with you.</p>
          </div>
          <ArrowUpRight size={14} />
        </Link>
      </section>
      <div className="explore-trust">
        <ShieldCheck size={15} />
        <span>
          Documentation researched. Estimates labeled. Setup stays in your
          hands.
        </span>
        <Link href="/methodology">
          How it works
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
