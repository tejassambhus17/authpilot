"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  Clock3,
  Copy,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Guide } from "@/lib/schema";
import { useSavedGuides } from "@/lib/saved-guides";
import { ProviderIcon } from "./brand";
import { SaveGuideButton } from "./save-guide-button";

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function GuideLibrary({
  guides,
  savedOnly = false,
}: {
  guides: Guide[];
  savedOnly?: boolean;
}) {
  const params = useSearchParams();
  const view = savedOnly
    ? "saved"
    : params.get("view") === "recent"
      ? "recent"
      : "all";
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("updated");
  const [shared, setShared] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const { savedIds, isLoaded, storageError } = useSavedGuides();
  const savedCount = guides.filter((guide) =>
    savedIds.includes(guide.id),
  ).length;
  const researchedCount = guides.filter(
    (guide) => guide.origin === "researched",
  ).length;
  const base = guides.filter((guide) =>
    view === "saved"
      ? savedIds.includes(guide.id)
      : view === "recent"
        ? guide.origin === "researched"
        : true,
  );
  const categories = [...new Set(base.map((guide) => guide.category))].sort();
  const filtered = base
    .filter(
      (guide) =>
        (!tag || guide.category === tag) &&
        `${guide.provider} ${guide.description} ${guide.category}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.provider.localeCompare(b.provider)
        : b.updatedAt.localeCompare(a.updatedAt) ||
          a.provider.localeCompare(b.provider),
    );
  const views = [
    {
      id: "all",
      href: "/guides",
      label: "All guides",
      icon: Layers3,
      count: guides.length,
    },
    {
      id: "saved",
      href: "/saved",
      label: "Saved guides",
      icon: Bookmark,
      count: isLoaded ? savedCount : null,
    },
    {
      id: "recent",
      href: "/guides?view=recent",
      label: "Recently generated",
      icon: Clock3,
      count: researchedCount,
    },
  ];
  async function share(guide: Guide) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/guides/${guide.id}`,
      );
      setShared(guide.id);
      setShareMessage(`${guide.provider} guide link copied.`);
    } catch {
      setShareMessage(
        `Open the ${guide.provider} guide and copy its browser address to share it.`,
      );
    }
  }
  return (
    <div className="page-container library-page">
      <div className="library-header">
        <div>
          <h1>{savedOnly ? "Saved guides" : "My guides"}</h1>
          <p>
            {savedOnly
              ? "The guides you’ve bookmarked in this browser, ready for your next step."
              : "Your source-linked OAuth setup guides, all in one place."}
          </p>
        </div>
        <Link href="/research" className="button button-primary">
          <Sparkles size={15} />
          Research a provider
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="library-layout">
        <aside className="library-sidebar" aria-label="Guide filters">
          <nav aria-label="Library views">
            {views.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`library-filter ${view === item.id ? "active" : ""}`}
                aria-current={view === item.id ? "page" : undefined}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
                <span className="filter-count">{item.count ?? "…"}</span>
              </Link>
            ))}
          </nav>
          <div className="library-tags">
            <h2>Categories</h2>
            <button
              type="button"
              className={`category-filter ${!tag ? "selected" : ""}`}
              aria-pressed={!tag}
              onClick={() => setTag("")}
            >
              <span className="category-dot" />
              All categories<span>{base.length}</span>
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`category-filter ${tag === category ? "selected" : ""}`}
                aria-pressed={tag === category}
                onClick={() => setTag(tag === category ? "" : category)}
              >
                <span className="category-dot" />
                <span className="category-label">{category}</span>
                <span>
                  {base.filter((guide) => guide.category === category).length}
                </span>
              </button>
            ))}
          </div>
          <p className="library-local-note">
            <Bookmark size={14} />
            Bookmarks and checklist progress stay in this browser. Guide URLs
            are shareable.
          </p>
        </aside>
        <section className="library-results" aria-label="Guide results">
          <div className="library-toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                type="search"
                aria-label="Search guides"
                placeholder="Search guides…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Clear guide search"
                  onClick={() => setSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <label className="sort-control">
              <ArrowDownWideNarrow size={15} />
              <span className="sr-only">Sort guides</span>
              <select
                aria-label="Sort guides"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="updated">Recently updated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
          {storageError && (
            <div className="notice error" role="alert">
              {storageError}
            </div>
          )}
          <p className="library-result-count" aria-live="polite">
            {view === "saved" && !isLoaded
              ? "Loading saved guides…"
              : `${filtered.length} ${filtered.length === 1 ? "guide" : "guides"}${tag ? ` in ${tag}` : ""}`}
          </p>
          {view === "saved" && !isLoaded ? (
            <div role="status" aria-label="Loading saved guides">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton library-skeleton" />
              ))}
            </div>
          ) : filtered.length ? (
            <div className="guide-list">
              {filtered.map((guide) => (
                <article className="library-guide" key={guide.id}>
                  <Link
                    href={`/guides/${guide.id}`}
                    className="library-guide-link"
                    aria-label={`${guide.provider} integration guide`}
                  >
                    <span className="provider-icon">
                      <ProviderIcon provider={guide.provider} size={29} />
                    </span>
                    <div className="library-guide-copy">
                      <h2>{guide.provider} OAuth integration guide</h2>
                      <p>
                        Updated {dateLabel(guide.updatedAt)}
                        <span>·</span>
                        {guide.sources.length} sources<span>·</span>
                        {guide.category}
                      </p>
                    </div>
                  </Link>
                  <div className="library-guide-actions">
                    <span
                      className={`research-label ${guide.origin}`}
                      title="Documentation research does not mean OAuth setup was tested"
                    >
                      {guide.origin === "curated" ? (
                        <ShieldCheck size={13} />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      <span>
                        {guide.origin === "curated"
                          ? "Source checked"
                          : "Agent researched"}
                      </span>
                    </span>
                    <SaveGuideButton
                      guideId={guide.id}
                      provider={guide.provider}
                      variant="icon"
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Share ${guide.provider} guide`}
                      title="Copy share link"
                      onClick={() => share(guide)}
                    >
                      {shared === guide.id ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {view === "saved" && !search && !tag ? (
                <Bookmark size={30} />
              ) : (
                <BookOpen size={30} />
              )}
              <h2>
                {view === "saved" && !search && !tag
                  ? "No saved guides yet"
                  : "No guides found"}
              </h2>
              <p>
                {view === "saved" && !search && !tag
                  ? "Save a guide from the library or its detail page. It will be waiting here when you return."
                  : "Try a different search or category, or research a provider that isn’t in your library yet."}
              </p>
              <Link
                href={
                  view === "saved" && !search
                    ? "/guides"
                    : `/research${search ? `?q=${encodeURIComponent(search)}` : ""}`
                }
                className="button button-primary"
              >
                {view === "saved" && !search
                  ? "Browse guides"
                  : "Research a provider"}
                <ArrowRight size={15} />
              </Link>
              {(tag || search) && (
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => {
                    setTag("");
                    setSearch("");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
          <div className="inline-feedback" role="status" aria-live="polite">
            {shareMessage}
          </div>
          <p className="library-evidence-note">
            <ShieldCheck size={14} />
            Research status describes the evidence. No guide claims a completed
            OAuth setup.
          </p>
        </section>
      </div>
    </div>
  );
}
