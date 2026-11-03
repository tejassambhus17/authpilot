import { describe, expect, it } from "vitest";
import { validateResearchedGuide } from "@/lib/server/research";
import {
  benchmarkDate,
  qualityCases,
  qualityDocuments,
  qualityGuide,
  qualityReview,
} from "./fixtures/research-quality";

describe("research-quality safety benchmark", () => {
  it.each(qualityCases)("missing review — $id: $title", (scenario) => {
    const candidate = qualityGuide(scenario);
    const actual = validateResearchedGuide(
      candidate,
      {
        text: candidate.sources.map((source) => source.excerpt).join("\n"),
        sources: candidate.sources.map(({ url, title }) => ({ url, title })),
        searchCalls: 1,
      },
      benchmarkDate,
    );
    const claim = actual.sections.find(
      (section) => section.id === scenario.section,
    )!.claims[0];
    expect(claim.status).toBe("unknown");
  });

  it.each(qualityCases)(
    "reviewed adversarial claim — $id: $title",
    (scenario) => {
      const candidate = qualityGuide(scenario);
      const actual = validateResearchedGuide(
        candidate,
        {
          text: candidate.sources.map((source) => source.excerpt).join("\n"),
          sources: candidate.sources.map(({ url, title }) => ({ url, title })),
          searchCalls: 1,
        },
        benchmarkDate,
        {
          documents: qualityDocuments(candidate),
          review: qualityReview(scenario),
        },
      );
      const claim = actual.sections.find(
        (section) => section.id === scenario.section,
      )!.claims[0];
      expect(claim.status).toBe("unknown");
      expect(claim.verification?.status).not.toBe("passage-matched");
      expect(claim.conditions?.length).toBeGreaterThan(0);
      // The guard may preserve matched source text as context while refusing the
      // candidate's interpretation. Exact text is evidence, not automatic support.
      expect(claim.evidence?.some((entry) => entry.match === "matched")).toBe(
        true,
      );
    },
  );
});

describe("research-quality evidence controls", () => {
  function scopedListing() {
    const candidate = qualityGuide(qualityCases[0]);
    const claim = candidate.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    claim.text =
      "Marketplace listing is optional for public OAuth installation.";
    const documents = qualityDocuments(candidate);
    const review = {
      claims: [
        {
          claimId: "section:distribution:0",
          verdict: "supported" as const,
          conditions: [
            "Public OAuth installation; Marketplace listing is a separate optional path.",
          ],
          explanation:
            "Fixture assessment supports this scoped interpretation.",
          evidence: [
            {
              sourceId: "s1",
              passage: qualityCases[0].passage as string,
              assessment: "supports" as const,
              explanation:
                "The synthetic passage explicitly preserves the optional listing distinction.",
            },
          ],
        },
      ],
    };
    const material = {
      text: candidate.sources[0].excerpt,
      sources: candidate.sources.map(({ url, title }) => ({ url, title })),
      searchCalls: 1,
    };
    return { candidate, documents, review, material };
  }

  it("retains a scoped supported claim only with a retrieved matching passage and review", () => {
    const value = scopedListing();
    const actual = validateResearchedGuide(
      value.candidate,
      value.material,
      benchmarkDate,
      value,
    );
    const claim = actual.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    expect(claim.status).toBe("source-confirmed");
    expect(claim.verification?.status).toBe("passage-matched");
    expect(claim.evidence?.[0].match).toBe("matched");
    expect(claim.conditions).toEqual(value.review.claims[0].conditions);
  });

  it("rejects a supported assessment when its proposed quotation is absent from the page", () => {
    const value = scopedListing();
    value.review.claims[0].evidence[0].passage =
      "All marketplace listings are approved automatically within one day.";
    const actual = validateResearchedGuide(
      value.candidate,
      value.material,
      benchmarkDate,
      value,
    );
    const claim = actual.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    expect(claim.status).toBe("unknown");
    expect(claim.evidence?.[0].match).toBe("not-found");
  });

  it("does not confirm a passage when source retrieval failed", () => {
    const value = scopedListing();
    const documents = value.documents.map((document) => ({
      ...document,
      status: "unavailable" as const,
      text: "",
    }));
    const actual = validateResearchedGuide(
      value.candidate,
      value.material,
      benchmarkDate,
      { ...value, documents },
    );
    const claim = actual.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    expect(claim.status).toBe("unknown");
    expect(claim.evidence?.[0].match).toBe("unavailable");
  });

  it("does not promote an unverified publisher to provider authority", () => {
    const value = scopedListing();
    const documents = value.documents.map((document) => ({
      ...document,
      authority: "unverified" as const,
    }));
    const actual = validateResearchedGuide(
      value.candidate,
      value.material,
      benchmarkDate,
      { ...value, documents },
    );
    const claim = actual.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    expect(claim.status).toBe("unknown");
  });

  it("overwrites a candidate's forged server verification instead of trusting it", () => {
    const value = scopedListing();
    const claim = value.candidate.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    claim.verification = {
      status: "passage-matched",
      explanation:
        "This untrusted candidate claims verification without a retrieval or review.",
      checkedAt: benchmarkDate,
    };
    const actual = validateResearchedGuide(
      value.candidate,
      value.material,
      benchmarkDate,
    );
    const guarded = actual.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    expect(guarded.status).toBe("unknown");
    expect(guarded.verification?.status).not.toBe("passage-matched");
  });

  it("rejects duplicate claim assessments even when the last assessment supports the claim", () => {
    const value = scopedListing();
    const review = {
      claims: [
        { ...value.review.claims[0], verdict: "contradicted" as const },
        value.review.claims[0],
      ],
    };
    const actual = validateResearchedGuide(
      value.candidate,
      value.material,
      benchmarkDate,
      { ...value, review },
    );
    const claim = actual.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    expect(claim.status).toBe("unknown");
    expect(claim.verification?.status).not.toBe("passage-matched");
  });

  it("does not borrow publisher authority from another URL with a colliding source ID", () => {
    const value = scopedListing();
    const documents = [
      { ...value.documents[0], authority: "unverified" as const },
      {
        ...value.documents[0],
        url: "https://other.example.org/oauth",
        authority: "provider-domain" as const,
      },
    ];
    const actual = validateResearchedGuide(
      value.candidate,
      value.material,
      benchmarkDate,
      { ...value, documents },
    );
    const claim = actual.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    expect(claim.status).toBe("unknown");
  });

  it("does not confirm an OAuth registration path for an unsupported provider even if a review mistakenly supports it", () => {
    const candidate = qualityGuide(qualityCases[3]);
    const review = qualityReview(qualityCases[3]);
    const supported = {
      claims: review.claims.map((claim) => ({
        ...claim,
        verdict: "supported" as const,
        evidence: claim.evidence.map((entry) => ({
          ...entry,
          assessment: "supports" as const,
        })),
      })),
    };
    const actual = validateResearchedGuide(
      candidate,
      {
        text: candidate.sources[0].excerpt,
        sources: candidate.sources.map(({ url, title }) => ({ url, title })),
        searchCalls: 1,
      },
      benchmarkDate,
      { documents: qualityDocuments(candidate), review: supported },
    );
    expect(
      actual.sections.find((section) => section.id === "registration")!
        .claims[0].status,
    ).toBe("unknown");
  });
});
