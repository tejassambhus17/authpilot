import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OpenAIResearchTransport,
  researchProvider,
  validateResearchedGuide,
} from "@/lib/server/research";
import {
  evidenceReviewSchema,
  type EvidenceDocument,
  type EvidenceReview,
} from "@/lib/server/evidence";
import type { GuideContent, ResearchEvent } from "@/lib/schema";
import {
  qualityCases,
  qualityDocuments,
  qualityGuide,
} from "./fixtures/research-quality";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("records the actual evidence-check timestamp separately from initial search retrieval", () => {
  const value = scenario();
  const searchedAt = "2026-11-03T14:00:00.000Z";
  const checkedAt = "2026-11-03T14:03:00.000Z";
  const guide = validateResearchedGuide(
    value.content,
    value.material,
    searchedAt,
    { documents: value.documents, review: value.review, checkedAt },
  );
  const claim = guide.sections.find((section) => section.id === "distribution")!
    .claims[0];
  expect(claim.verification?.checkedAt).toBe(checkedAt);
  expect(claim.evidence?.[0].checkedAt).toBe(checkedAt);
  expect(guide.sources[0].retrievedAt).toBe(searchedAt);
  expect(guide.sources[0].retrieval?.checkedAt).toBe(
    value.documents[0].fetchedAt,
  );
});

function scenario() {
  const content = qualityGuide(qualityCases[0]);
  content.sections.find(
    (section) => section.id === "distribution",
  )!.claims[0].text =
    "Marketplace listing is optional for public OAuth installation.";
  const documents = qualityDocuments(content);
  const review: EvidenceReview = {
    claims: [
      {
        claimId: "section:distribution:0",
        verdict: "supported",
        conditions: [
          "Public OAuth installation; optional marketplace listing.",
        ],
        explanation:
          "Fixture assessment: this scoped interpretation is supported.",
        evidence: [
          {
            sourceId: "s1",
            passage: qualityCases[0].passage,
            assessment: "supports",
            explanation:
              "The authored fixture explicitly makes marketplace listing optional.",
          },
        ],
      },
    ],
  };
  const material = {
    text: content.sources[0].excerpt,
    sources: content.sources.map(({ url, title }) => ({ url, title })),
    searchCalls: 1,
  };
  return { content, documents, review, material };
}

function sdkResponse(value: unknown) {
  return Response.json({
    id: "fixture-evidence-response",
    object: "response",
    status: "completed",
    output: [
      {
        id: "fixture-evidence-message",
        type: "message",
        status: "completed",
        role: "assistant",
        content: [
          { type: "output_text", text: JSON.stringify(value), annotations: [] },
        ],
      },
    ],
  });
}

describe("installed SDK evidence-review wire contract", () => {
  it("uses the real strict parser, server-only request settings, and only supplied retrieved page text", async () => {
    const value = scenario();
    vi.stubEnv("OPENAI_API_KEY", "test-placeholder-not-a-real-api-key");
    vi.stubEnv("OPENAI_MODEL", "gpt-5.5");
    const requests: Record<string, unknown>[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requests.push(
          JSON.parse(String(init?.body)) as Record<string, unknown>,
        );
        return sdkResponse(value.review);
      }),
    );
    const transport = new OpenAIResearchTransport();
    const reviewed = await transport.reviewEvidence(
      value.content,
      [
        ...value.documents,
        {
          ...value.documents[0],
          sourceId: "unavailable-page",
          status: "unavailable",
          text: "UNAVAILABLE_PAGE_TEXT_MUST_NOT_ENTER_REVIEW",
        },
      ],
      new AbortController().signal,
    );
    expect(reviewed).toEqual(value.review);
    expect(evidenceReviewSchema.parse(reviewed)).toEqual(value.review);
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      model: "gpt-5.5",
      store: false,
      reasoning: { effort: "low" },
      text: {
        format: {
          type: "json_schema",
          strict: true,
          schema: { additionalProperties: false },
        },
      },
    });
    expect(requests[0]).not.toHaveProperty("tools");
    const input = JSON.parse(String(requests[0].input));
    expect(input.documents).toEqual(
      value.documents.map(({ sourceId, url, text }) => ({
        sourceId,
        url,
        text,
      })),
    );
    expect(JSON.stringify(input)).not.toContain(
      "UNAVAILABLE_PAGE_TEXT_MUST_NOT_ENTER_REVIEW",
    );
    expect(String(requests[0].instructions)).toMatch(/UNTRUSTED DATA/);
    expect(String(requests[0].instructions)).toMatch(/EXACTLY/);
    expect(String(requests[0].instructions)).toMatch(
      /marketplace listing cannot establish mandatory approval/i,
    );
  });

  it("rejects a malformed reviewer response through the installed SDK parser", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-placeholder-not-a-real-api-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        sdkResponse({
          claims: [
            { claimId: "section:distribution:0", verdict: "looks-fine" },
          ],
        }),
      ),
    );
    const value = scenario();
    const transport = new OpenAIResearchTransport();
    await expect(
      transport.reviewEvidence(
        value.content,
        value.documents,
        new AbortController().signal,
      ),
    ).rejects.toThrow();
  });
});

describe("research evidence orchestration", () => {
  it("retrieves, independently assesses, and saves a matched claim before reporting completion", async () => {
    const value = scenario();
    const order: string[] = [];
    const events: ResearchEvent[] = [];
    const retrieveDocuments = vi.fn(async () => {
      order.push("retrieve");
      return value.documents;
    });
    const transport = {
      search: vi.fn(async () => {
        order.push("search");
        return value.material;
      }),
      synthesize: vi.fn(async () => {
        order.push("synthesize");
        return value.content;
      }),
      reviewEvidence: vi.fn(async () => {
        order.push("review");
        return value.review;
      }),
    };
    const save = vi.fn(async () => {
      order.push("save");
    });
    const signal = new AbortController().signal;
    const result = await researchProvider("Synthetic Benchmark Provider", {
      transport,
      retrieveDocuments,
      save,
      signal,
      emit: (event) => events.push(event),
    });
    expect(order).toEqual([
      "search",
      "synthesize",
      "retrieve",
      "review",
      "save",
    ]);
    expect(retrieveDocuments).toHaveBeenCalledOnce();
    expect(transport.reviewEvidence).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledExactlyOnceWith(result);
    const claim = result.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    expect(claim.status).toBe("source-confirmed");
    expect(claim.verification?.status).toBe("passage-matched");
    expect(claim.evidence?.[0].match).toBe("matched");
    expect(result.sources[0].retrieval?.status).toBe("retrieved");
    expect(events.some((event) => event.message.includes("1 of 1"))).toBe(true);
    expect(events.at(-1)).toMatchObject({
      phase: "complete",
      guideId: result.id,
    });
  });

  it("preserves a valid guide with unknown claims when the reviewer API fails", async () => {
    const value = scenario();
    const save = vi.fn().mockResolvedValue(undefined);
    const result = await researchProvider("Synthetic Benchmark Provider", {
      transport: {
        search: vi.fn().mockResolvedValue(value.material),
        synthesize: vi.fn().mockResolvedValue(value.content),
        reviewEvidence: vi
          .fn()
          .mockRejectedValue(new Error("PRIVATE_UPSTREAM_FAILURE_DETAIL")),
      },
      retrieveDocuments: vi.fn().mockResolvedValue(value.documents),
      save,
      signal: new AbortController().signal,
      emit: vi.fn(),
    });
    expect(save).toHaveBeenCalledExactlyOnceWith(result);
    expect(
      result.sections.find((section) => section.id === "distribution")!
        .claims[0].status,
    ).toBe("unknown");
    expect(result.warnings).toContainEqual(
      expect.stringContaining("separate evidence assessment did not complete"),
    );
    expect(JSON.stringify(result)).not.toContain(
      "PRIVATE_UPSTREAM_FAILURE_DETAIL",
    );
  });

  it("never promotes an invented source ID returned by the reviewer", async () => {
    const value = scenario();
    value.review.claims[0].evidence[0].sourceId = "invented-source";
    const result = await researchProvider("Synthetic Benchmark Provider", {
      transport: {
        search: vi.fn().mockResolvedValue(value.material),
        synthesize: vi.fn().mockResolvedValue(value.content),
        reviewEvidence: vi.fn().mockResolvedValue(value.review),
      },
      retrieveDocuments: vi.fn().mockResolvedValue(value.documents),
      save: vi.fn().mockResolvedValue(undefined),
      signal: new AbortController().signal,
      emit: vi.fn(),
    });
    expect(result.sources.map((source) => source.id)).toEqual(["s1"]);
    const claim = result.sections.find(
      (section) => section.id === "distribution",
    )!.claims[0];
    expect(claim.status).toBe("unknown");
    expect(claim.evidence?.[0].match).toBe("unavailable");
  });

  it("does not review or save after cancellation during page retrieval", async () => {
    const value = scenario();
    const abort = new AbortController();
    const reviewEvidence = vi.fn().mockResolvedValue(value.review);
    const save = vi.fn();
    const events: ResearchEvent[] = [];
    await expect(
      researchProvider("Synthetic Benchmark Provider", {
        transport: {
          search: vi.fn().mockResolvedValue(value.material),
          synthesize: vi.fn().mockResolvedValue(value.content),
          reviewEvidence,
        },
        retrieveDocuments: vi.fn(async () => {
          abort.abort(
            new DOMException("Cancelled during retrieval", "AbortError"),
          );
          throw abort.signal.reason;
        }),
        save,
        signal: abort.signal,
        emit: (event) => events.push(event),
      }),
    ).rejects.toThrow("Cancelled during retrieval");
    expect(reviewEvidence).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(
      events.some(
        (event) => event.phase === "saving" || event.phase === "complete",
      ),
    ).toBe(false);
  });

  it("does not save when cancellation interrupts the independent assessment", async () => {
    const value = scenario();
    const abort = new AbortController();
    const save = vi.fn();
    const events: ResearchEvent[] = [];
    await expect(
      researchProvider("Synthetic Benchmark Provider", {
        transport: {
          search: vi.fn().mockResolvedValue(value.material),
          synthesize: vi.fn().mockResolvedValue(value.content),
          reviewEvidence: vi.fn(
            async (
              _content: GuideContent,
              _documents: EvidenceDocument[],
              signal: AbortSignal,
            ) => {
              abort.abort(
                new DOMException("Cancelled during review", "AbortError"),
              );
              expect(signal.aborted).toBe(true);
              throw abort.signal.reason;
            },
          ),
        },
        retrieveDocuments: vi.fn().mockResolvedValue(value.documents),
        save,
        signal: abort.signal,
        emit: (event) => events.push(event),
      }),
    ).rejects.toThrow("Cancelled during review");
    expect(save).not.toHaveBeenCalled();
    expect(
      events.some(
        (event) => event.phase === "saving" || event.phase === "complete",
      ),
    ).toBe(false);
  });
});
