import "server-only";
import type { Claim, Guide } from "@/lib/schema";

function claimLine(claim: Claim, guide: Guide): string {
  const links = claim.sourceIds
    .map((id) => guide.sources.find((source) => source.id === id))
    .filter((source) => source !== undefined)
    .map((source) => `[${source.id}](${source.url})`)
    .join(" ");
  return `- **${claim.status}**: ${claim.text}${links ? ` ${links}` : ""}`;
}

export function guideToMarkdown(guide: Guide): string {
  return [
    `# ${guide.provider} OAuth integration guide`,
    "",
    guide.description,
    "",
    `- Provider: ${guide.website}`,
    `- OAuth support: ${guide.oauthSupport}`,
    `- Difficulty: ${guide.difficulty}`,
    `- Guide ID: ${guide.id}`,
    `- Created: ${guide.createdAt}`,
    `- Updated: ${guide.updatedAt}`,
    `- Origin: ${guide.origin}`,
    "",
    "## Effort and approval",
    "",
    claimLine(guide.effort, guide),
    claimLine(guide.approval, guide),
    "",
    ...guide.sections.flatMap((section) => [
      `## ${section.title}`,
      "",
      section.summary,
      "",
      ...section.claims.map((claim) => claimLine(claim, guide)),
      "",
    ]),
    "## Action checklist",
    "",
    ...guide.checklist.map(
      (step) =>
        `- [ ] **${step.title}** (${step.actor}; ${step.sectionId}) — ${step.description}`,
    ),
    "",
    "Checklist boxes are intentionally blank: progress belongs to the current browser, not the shared guide.",
    "",
    "## Blockers",
    "",
    ...(guide.blockers.length
      ? guide.blockers.map((claim) => claimLine(claim, guide))
      : [
          "No additional blockers were identified. This is not a guarantee of approval.",
        ]),
    "",
    "## What the agent can do",
    "",
    ...guide.automation.canDo.map((item) => `- ${item}`),
    "",
    "## Requires a person or provider",
    "",
    ...guide.automation.requiresHuman.map((item) => `- ${item}`),
    "",
    "## What AuthPilot never does",
    "",
    ...guide.automation.neverDoes.map((item) => `- ${item}`),
    "",
    "## Warnings and unknowns",
    "",
    ...(guide.warnings.length
      ? guide.warnings.map((item) => `- ${item}`)
      : ["- No additional warnings recorded."]),
    "",
    "## Evidence sources",
    "",
    ...guide.sources.flatMap((source) => [
      `### ${source.id}: ${source.title}`,
      "",
      `- URL: ${source.url}`,
      `- Publisher: ${source.publisher}`,
      `- Retrieved: ${source.retrievedAt}`,
      `- Supporting evidence summary: ${source.excerpt}`,
      "",
    ]),
    "## Evidence methodology",
    "",
    "Source-confirmed means documentation-backed, not a successful setup attempt. Evidence excerpts are supporting summaries unless explicitly described as quotations. Agent-tested would require an actual recorded execution; AuthPilot does not execute OAuth setup and never emits that status. Estimates are planning judgments, and unknowns are unresolved. Retrieval dates identify the research snapshot, not the provider's publication date.",
    "",
  ].join("\n");
}
