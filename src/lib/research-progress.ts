import type { ResearchEvent, ResearchPhase } from "@/lib/schema";
import { canonicalSourceUrl } from "@/lib/provider-input";

export const researchSteps = [
  {
    id: "request",
    title: "Request accepted",
    description: "Accepting your provider name or website for research.",
  },
  {
    id: "documentation",
    title: "Find documentation",
    description:
      "Searching the web for provider documentation and OAuth resources.",
  },
  {
    id: "guide",
    title: "Build the integration guide",
    description:
      "Organizing setup, scopes, approval requirements, and unknowns.",
  },
  {
    id: "evidence",
    title: "Check the evidence",
    description:
      "Validating the guide structure, citation provenance, and evidence labels.",
  },
  {
    id: "save",
    title: "Save your guide",
    description:
      "Persisting the research snapshot and preparing its shareable link.",
  },
] as const;

const phaseStep: Partial<Record<ResearchPhase, number>> = {
  accepted: 0,
  searching: 1,
  "source-found": 1,
  synthesizing: 2,
  validating: 3,
  saving: 4,
};

export type ResearchStepState = "pending" | "active" | "completed" | "failed";

export function getResearchProgress(
  events: ResearchEvent[],
  running: boolean,
  failed: boolean,
) {
  const observed = new Set<number>();
  let lastStep = -1;
  const complete = events.some(
    (event) => event.phase === "complete" && Boolean(event.guideId),
  );
  for (const event of events) {
    const index = phaseStep[event.phase];
    if (index !== undefined) {
      observed.add(index);
      lastStep = index;
    }
  }

  return researchSteps.map((step, index) => {
    let state: ResearchStepState = "pending";
    if (observed.has(index)) {
      if (complete || index < lastStep || index === 0) state = "completed";
      else if (failed) state = "failed";
      else if (running) state = "active";
    }
    if (failed && lastStep === -1 && index === 0) state = "failed";
    return { ...step, state };
  });
}

export function publicEvidenceUrl(value: string | undefined): string | null {
  return value ? canonicalSourceUrl(value) : null;
}

export function getDiscoveredSources(events: ResearchEvent[]) {
  const sources = new Map<
    string,
    { url: string; title: string; domain: string; classification: string }
  >();
  for (const event of events) {
    if (event.phase !== "source-found") continue;
    const url = publicEvidenceUrl(event.url);
    if (!url || sources.has(url)) continue;
    const parsed = new URL(url);
    const documentation =
      /(^|\.)(docs?|developers?)\./i.test(parsed.hostname) ||
      /\/(docs?|developers?|reference|oauth)(\/|$)/i.test(parsed.pathname);
    sources.set(url, {
      url,
      title: event.message,
      domain: parsed.hostname.replace(/^www\./, ""),
      classification: documentation
        ? "Documentation candidate"
        : "Retrieved source",
    });
  }
  return [...sources.values()];
}
