import { sectionIds, type GuideContent } from "@/lib/schema";

// Authored, synthetic adversarial examples. These are not provider policies,
// retrieved web pages, paid model outputs, or a production generation fallback.
export const benchmarkDate = "2026-11-03T14:00:00.000Z";
export const benchmarkUrl = "https://docs.example.com/oauth";

export const qualityCases = [
  {
    id: "optional-listing",
    title:
      "Optional marketplace listing is not mandatory public OAuth approval",
    passage:
      "Marketplace listing is optional. Public OAuth integrations can be installed using their authorization URL without a marketplace listing.",
    claim:
      "Marketplace approval is mandatory before any public OAuth installation.",
    section: "distribution" as const,
  },
  {
    id: "administrator-consent",
    title: "Administrator consent is separate from provider review",
    passage:
      "Workspace administrators may require consent before users install an integration. This tenant policy is independent of provider app review.",
    claim:
      "Every OAuth app requires provider approval before a workspace administrator can consent.",
    section: "review" as const,
  },
  {
    id: "missing-timeline",
    title: "A documented review process does not establish a turnaround time",
    passage:
      "Submit your application and scope justification for review. We will contact the registered owner when the review is complete.",
    claim: "Provider approval is guaranteed within five business days.",
    section: "review" as const,
  },
  {
    id: "unsupported-oauth",
    title: "Unsupported OAuth must not become a registration guide",
    passage:
      "This API supports personal API keys only. Third-party OAuth app registration and user authorization are not supported.",
    claim:
      "Register an OAuth client and obtain provider approval to connect users.",
    section: "registration" as const,
    oauthSupport: "unsupported" as const,
  },
  {
    id: "contradictory-documentation",
    title: "Conflicting review requirements remain unresolved",
    passage: "Public integrations require provider review before distribution.",
    conflictingPassage:
      "Public integrations do not require provider review before distribution.",
    claim:
      "Public integrations never require provider review before distribution.",
    section: "review" as const,
  },
] as const;

export function qualityGuide(
  scenario: (typeof qualityCases)[number],
): GuideContent {
  return {
    provider: "Synthetic Benchmark Provider",
    website: "https://example.com",
    description: "Test-only candidate for an evidence safety regression.",
    category: "Benchmark fixture",
    oauthSupport:
      "oauthSupport" in scenario ? scenario.oauthSupport : "supported",
    difficulty: "Unknown",
    effort: {
      text: "Hands-on effort has not been established.",
      status: "unknown",
      sourceIds: [],
    },
    approval: {
      text: "Approval timing has not been established.",
      status: "unknown",
      sourceIds: [],
    },
    sections: sectionIds.map((id) => ({
      id,
      title: id,
      summary: "Test-only evidence scenario.",
      claims: [
        id === scenario.section
          ? {
              text: scenario.claim,
              status: "source-confirmed" as const,
              sourceIds:
                "conflictingPassage" in scenario ? ["s1", "s2"] : ["s1"],
            }
          : {
              text: "This requirement has not been established.",
              status: "unknown" as const,
              sourceIds: [],
            },
      ],
    })),
    checklist: [
      {
        id: "review-evidence",
        title: "Review the source requirements",
        description: "Resolve the test-only uncertainty before taking action.",
        actor: "developer",
        sectionId: scenario.section,
      },
    ],
    sources: [
      {
        id: "s1",
        title: "Synthetic documentation fixture",
        url: benchmarkUrl,
        publisher: "Synthetic Benchmark Provider",
        retrievedAt: benchmarkDate,
        excerpt: scenario.passage,
      },
      ...("conflictingPassage" in scenario
        ? [
            {
              id: "s2",
              title: "Synthetic conflicting documentation fixture",
              url: `${benchmarkUrl}/other-policy`,
              publisher: "Synthetic Benchmark Provider",
              retrievedAt: benchmarkDate,
              excerpt: scenario.conflictingPassage,
            },
          ]
        : []),
    ],
    blockers: [],
    automation: {
      canDo: ["Research public documentation."],
      requiresHuman: ["Resolve uncertain provider requirements."],
      neverDoes: ["Claim provider setup was executed."],
    },
    warnings: ["Synthetic test-only material; not real provider guidance."],
  };
}

export function qualityDocuments(candidate: GuideContent) {
  return candidate.sources.map((source) => ({
    sourceId: source.id,
    url: source.url,
    status: "retrieved" as const,
    text: source.excerpt,
    fetchedAt: benchmarkDate,
    authority: "provider-domain" as const,
    detail:
      "Synthetic fixture page supplied by the test harness; no network request.",
  }));
}

export function qualityReview(scenario: (typeof qualityCases)[number]) {
  return {
    claims: [
      {
        claimId: `section:${scenario.section}:0`,
        verdict:
          scenario.id === "missing-timeline"
            ? ("insufficient" as const)
            : ("contradicted" as const),
        conditions: [
          "Apply only to the lifecycle and actor described in the source; do not generalize to another approval path.",
        ],
        explanation:
          "Fixture review assessment: the candidate overstates or conflicts with the supplied documentation.",
        evidence: [
          {
            sourceId: "s1",
            passage: scenario.passage,
            assessment:
              scenario.id === "missing-timeline"
                ? ("insufficient" as const)
                : ("contradicts" as const),
            explanation:
              "This authored fixture passage does not support the candidate claim.",
          },
          ...("conflictingPassage" in scenario
            ? [
                {
                  sourceId: "s2",
                  passage: scenario.conflictingPassage,
                  assessment: "supports" as const,
                  explanation:
                    "This second authored fixture conflicts with the first; the conflict remains unresolved.",
                },
              ]
            : []),
        ],
      },
    ],
  };
}
