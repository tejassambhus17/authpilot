"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Guide } from "@/lib/schema";
import { ProviderIcon } from "./brand";

export function Directory({ guides }: { guides: Guide[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All providers");
  const [sort, setSort] = useState("recommended");
  const searchRef = useRef<HTMLInputElement>(null);
  const params = useSearchParams();
  const researched = params.get("view") === "researched";
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const categories = [
    "All providers",
    ...new Set(guides.map((g) => g.category)),
  ];
  const filtered = guides
    .filter(
      (g) =>
        (!researched || g.origin === "researched") &&
        (category === "All providers" || g.category === category) &&
        `${g.provider} ${g.description} ${g.category}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "alphabetical"
        ? a.provider.localeCompare(b.provider)
        : sort === "recent"
          ? b.updatedAt.localeCompare(a.updatedAt)
          : 0,
    );
  return (
    <div className="page-container directory-page">
      <section className="directory-intro">
        <div className="intro-copy">
          <h1>
            The path from <br />
            OAuth to <span>connected.</span>
          </h1>
          <p>
            App setup, scopes, and approval. Get a clear path forward, grounded
            in the docs that matter.
          </p>
          <div className="intro-proof">
            <span>
              <ShieldCheck size={15} />
              Source-backed guidance
            </span>
            <span>
              <Check size={15} />
              Human handoffs, made clear
            </span>
          </div>
        </div>
        <div className="research-invitation">
          <div className="invitation-top">
            <span className="compass-symbol">
              <Compass size={23} />
            </span>
          </div>
          <h2>
            Your provider isn’t here? <br />
            Let’s find the way.
          </h2>
          <p>
            Give the agent a name or website. Get a guide researched from
            current official documentation.
          </p>
          <Link href="/research" className="button button-primary">
            Research a provider
            <ArrowUpRight size={17} />
          </Link>
          <span className="invitation-footnote">
            Real sources. No invented certainty.
          </span>
        </div>
      </section>
      <section className="library-section" aria-labelledby="library-heading">
        <div className="section-heading">
          <div>
            <h2 id="library-heading">
              {researched ? "Researched guides" : "Provider library"}
              <span className="count-badge">
                {researched
                  ? guides.filter((g) => g.origin === "researched").length
                  : guides.length}
              </span>
            </h2>
            <p>
              {researched
                ? "Your saved research, ready to revisit and share."
                : "A head start on your next integration. Pick a provider to begin."}
            </p>
          </div>
          <Link href="/methodology#evidence" className="text-link">
            How we verify guides <CircleHelp size={15} />
          </Link>
        </div>
        <div className="directory-tools">
          <div className="search-field">
            <Search size={18} />
            <input
              type="search"
              ref={searchRef}
              aria-label="Search providers"
              placeholder="Search providers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search ? (
              <button
                aria-label="Clear search"
                className="icon-button"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            ) : (
              <kbd>/</kbd>
            )}
          </div>
          <label className="sort-control">
            <ArrowDown size={14} />
            <span className="sr-only">Sort providers</span>
            <select
              aria-label="Sort providers"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="alphabetical">Name: A to Z</option>
              <option value="recent">Recently updated</option>
            </select>
          </label>
        </div>
        <div className="filter-row" aria-label="Provider categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${category === cat ? "selected" : ""}`}
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {filtered.length ? (
          <div className="provider-table">
            <div className="provider-table-head">
              <span>Provider</span>
              <span>Setup complexity</span>
              <span>Guide evidence</span>
              <span />
            </div>
            {filtered.map((guide) => (
              <Link
                href={`/guides/${guide.id}`}
                className="provider-row"
                key={guide.id}
                aria-label={`${guide.provider} integration guide`}
              >
                <div className="provider-identity">
                  <span
                    className={`provider-icon provider-${guide.provider.toLowerCase()}`}
                  >
                    <ProviderIcon provider={guide.provider} />
                  </span>
                  <div>
                    <div className="provider-name">
                      {guide.provider}
                      <span className="provider-category">
                        {guide.category}
                      </span>
                    </div>
                    <p>{guide.description}</p>
                  </div>
                </div>
                <div className="provider-complexity">
                  <span
                    className={`complexity-dot ${guide.difficulty.toLowerCase()}`}
                  />
                  {guide.difficulty}
                </div>
                <div className="provider-evidence">
                  <ShieldCheck size={15} />
                  <span>
                    {guide.sources.length} sources
                    <small>
                      {guide.origin === "curated"
                        ? "Curated guide"
                        : "Agent researched"}
                    </small>
                  </span>
                </div>
                <ChevronRight size={18} className="row-chevron" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={28} />
            <h3>
              {researched && !search
                ? "Your next discovery starts here."
                : "No providers found."}
            </h3>
            <p>
              {researched && !search
                ? "Research a provider to save a source-backed guide in your library."
                : `We don’t have a guide matching “${search}” in this view. The research agent can investigate it.`}
            </p>
            <Link
              className="button button-primary"
              href={`/research${search ? `?q=${encodeURIComponent(search)}` : ""}`}
            >
              Research {search || "a provider"}
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
        <div className="library-footnote">
          <BookOpen size={14} />
          <span>
            Guides are a starting point. Requirements can change; always check
            the linked sources before you ship.
          </span>
        </div>
      </section>
      <section className="directory-bottom">
        <div>
          <div className="bottom-icon">
            <Clock3 size={19} />
          </div>
          <h3>Plan for the work. And the wait.</h3>
          <p>
            Hands-on effort and provider approval are different clocks. Your
            guide makes both visible.
          </p>
          <Link href="/guides/google">
            Explore Google’s approval path <ArrowRight size={14} />
          </Link>
        </div>
        <div>
          <div className="bottom-icon">
            <Sparkles size={19} />
          </div>
          <h3>An agent, with clear boundaries.</h3>
          <p>
            Research and planning can be automated. Account access, secrets, and
            approval decisions stay with you.
          </p>
          <Link href="/methodology#boundaries">
            See what the agent can do <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
