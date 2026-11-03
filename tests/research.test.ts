import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  sectionIds,
  type GuideContent,
  type ResearchEvent,
} from "@/lib/schema";
import {
  extractSearchMaterial,
  guideTextFormat,
  OpenAIResearchTransport,
  researchProvider,
  safeSourceUrl,
  validateResearchedGuide,
  type ResearchMaterial,
  type ResearchTransport,
} from "@/lib/server/research";
import { publicResearchError } from "@/lib/server/errors";

const date = "2026-11-03T10:00:00.000Z";
const url = "https://docs.example.com/oauth";
const material: ResearchMaterial = {
  text: "Official OAuth registration supports authorization code grants.",
  sources: [{ url, title: "Official OAuth guide" }],
  searchCalls: 1,
};
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
function content(): GuideContent {
  return {
    provider: "Example",
    website: "https://example.com",
    description: "An example OAuth provider.",
    category: "Developer tools",
    oauthSupport: "supported",
    difficulty: "Moderate",
    effort: {
      text: "Allow 30–60 minutes for a first setup; a planning estimate.",
      status: "estimate",
      sourceIds: [],
    },
    approval: {
      text: "No reliable approval timing was found. Ask provider support.",
      status: "unknown",
      sourceIds: [],
    },
    sections: sectionIds.map((id) => ({
      id,
      title: id,
      summary: "Check the official documentation.",
      claims: [
        {
          text: "Register an app using the provider portal.",
          status: "source-confirmed",
          sourceIds: ["s1"],
        },
      ],
    })),
    checklist: [
      {
        id: "register",
        title: "Register app",
        description: "Sign in and register an app.",
        actor: "developer",
        sectionId: "registration",
      },
    ],
    sources: [
      {
        id: "s1",
        title: "Official OAuth guide",
        url,
        publisher: "Example",
        excerpt: "Registration is described in the provider documentation.",
        retrievedAt: "2020-01-01T00:00:00.000Z",
      },
    ],
    blockers: [],
    automation: {
      canDo: ["Research docs"],
      requiresHuman: ["Sign in"],
      neverDoes: ["Handle secrets"],
    },
    warnings: ["No setup was executed."],
  };
}

describe("research provenance", () => {
  it("serializes the actual Zod 4 guide schema into strict SDK structured output", () => {
    const format = guideTextFormat();
    expect(format.type).toBe("json_schema");
    expect(format.strict).toBe(true);
    expect(format.schema).toMatchObject({
      type: "object",
      additionalProperties: false,
    });
    expect(() => JSON.stringify(format)).not.toThrow();
    expect(JSON.stringify(format.schema)).not.toContain('"format":"uri"');
    expect(JSON.stringify(format.schema)).toContain('"pattern":"^https://"');
  });
  it("extracts only actual source URLs and output text from hosted search", () => {
    const result = extractSearchMaterial({
      output: [
        {
          type: "web_search_call",
          action: {
            sources: [
              { url, title: "Official OAuth guide" },
              { url: "http://insecure.example.com" },
              { url: "https://localhost/secret" },
            ],
          },
        },
        {
          type: "message",
          content: [
            {
              type: "output_text",
              text: "Research evidence",
              annotations: [
                { type: "url_citation", url, title: "Official OAuth guide" },
              ],
            },
          ],
        },
      ],
    });
    expect(result).toEqual({
      text: "Research evidence",
      searchCalls: 1,
      sources: [{ url, title: "Official OAuth guide" }],
    });
  });

  it("rejects a model-invented citation before persistence", () => {
    const generated = content();
    generated.sources[0].url = "https://invented.example.com/requirements";
    expect(() => validateResearchedGuide(generated, material, date)).toThrow(
      "could not be traced",
    );
  });

  it("replaces model timestamps with actual retrieval time", () => {
    const guide = validateResearchedGuide(content(), material, date);
    expect(guide.sources[0].retrievedAt).toBe(date);
    expect(guide.origin).toBe("researched");
    expect(guide.id).toMatch(/^example-/);
  });

  it.each([
    "It is unknown whether directory listing is required for public installs.",
    "The app review requirements are unclear.",
    "Review requirements are undocumented.",
    "The approval timeline was not verified.",
    "The registration completion time is not established.",
    "The requirement could not be established from the retrieved documentation.",
    "The review requirements are not publicly documented.",
    "No reliable timelines were found.",
    "No published review process for public apps was found.",
    "No published approval timeline or SLA was found.",
    "No app review process is documented in these sources.",
  ])("downgrades an explicitly uncertain confirmed claim: %s", text => {
    const generated = content();
    generated.sections[0].claims[0].text = text;
    const guide = validateResearchedGuide(generated, material, date);
    expect(guide.sections[0].claims[0]).toEqual({text, status: "unknown", sourceIds: ["s1"]});
    expect(guide.warnings.some(warning => warning.includes("Conservative evidence labeling"))).toBe(true);
  });

  it("normalizes uncertainty across effort, approval, blockers and sections while retaining supported positive claims", () => {
    const generated = content();
    generated.effort = {text: "Hands-on time is unknown.", status: "source-confirmed", sourceIds: ["s1"]};
    generated.approval = {text: "No published approval timing was found.", status: "source-confirmed", sourceIds: ["s1"]};
    generated.blockers = [{text: "Workspace approval requirements are not established.", status: "source-confirmed", sourceIds: ["s1"]}];
    generated.sections[0].claims[0].text = "It is unclear which app types require verification.";
    generated.sections[1].claims[0].text = "Submit an application for directory listing; listing requires provider review.";
    const guide = validateResearchedGuide(generated, material, date);
    expect([guide.effort, guide.approval, ...guide.blockers, guide.sections[0].claims[0]].every(claim => claim.status === "unknown")).toBe(true);
    expect(guide.sections[1].claims[0]).toEqual(generated.sections[1].claims[0]);
    expect(guide.warnings.filter(warning => warning.includes("Conservative evidence labeling"))).toHaveLength(1);
    expect(guide.warnings.join(" ")).toContain("4 claim(s)");
  });

  it("rejects claimed OAuth execution because no execution tool exists", () => {
    const generated = content();
    generated.sections[0].claims[0].status = "agent-tested";
    expect(() => validateResearchedGuide(generated, material, date)).toThrow(
      "evidence validation",
    );
  });

  it("rejects undocumented source-confirmed claims and duplicate sections", () => {
    const generated = content();
    generated.sections[0].claims[0].sourceIds = [];
    expect(() => validateResearchedGuide(generated, material, date)).toThrow(
      "evidence validation",
    );
    generated.sections[0] = generated.sections[1];
    expect(() => validateResearchedGuide(generated, material, date)).toThrow(
      "evidence validation",
    );
  });

  it.each([
    "https://localhost/a",
    "http://docs.example.com",
    "https://127.0.0.1/",
    "https://[::1]/",
    "https://a.internal/",
    "https://name:password@example.com/",
  ])("rejects unsafe evidence URL %s", (value) => {
    expect(safeSourceUrl(value)).toBeNull();
  });
});

describe("research orchestration", () => {
  function transport(): ResearchTransport {
    return {
      search: vi.fn().mockResolvedValue(material),
      synthesize: vi.fn().mockResolvedValue(content()),
    };
  }
  it("requires a real server API key instead of falling back to a demo generator", () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      expect(() => new OpenAIResearchTransport()).toThrow(
        "Live research needs an OpenAI API key",
      );
    } finally {
      if (previous !== undefined) process.env.OPENAI_API_KEY = previous;
    }
  });
  it("persists only after validation and completes with the saved guide URL ID", async () => {
    const events: ResearchEvent[] = [];
    const save = vi.fn().mockResolvedValue(undefined);
    const guide = await researchProvider("Example", {
      transport: transport(),
      emit: (event) => events.push(event),
      save,
      signal: new AbortController().signal,
    });
    expect(save).toHaveBeenCalledExactlyOnceWith(guide);
    expect(events.map((event) => event.phase)).toEqual([
      "accepted",
      "synthesizing",
      "validating",
      "saving",
      "complete",
    ]);
    expect(events.at(-1)?.guideId).toBe(guide.id);
  });

  it("does not save when the LLM fails", async () => {
    const engine = transport();
    engine.synthesize = vi.fn().mockRejectedValue(new Error("API failed"));
    const save = vi.fn();
    await expect(
      researchProvider("Example", {
        transport: engine,
        emit: vi.fn(),
        save,
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow("API failed");
    expect(save).not.toHaveBeenCalled();
  });

  it("does not emit completion when persistence fails", async () => {
    const events: ResearchEvent[] = [];
    await expect(
      researchProvider("Example", {
        transport: transport(),
        emit: (event) => events.push(event),
        save: vi.fn().mockRejectedValue(new Error("disk full")),
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow("disk full");
    expect(events.some((event) => event.phase === "complete")).toBe(false);
  });

  it("does not synthesize or save a cancelled research run", async () => {
    const engine = transport();
    const abort = new AbortController();
    abort.abort();
    const save = vi.fn();
    await expect(
      researchProvider("Example", {
        transport: engine,
        emit: vi.fn(),
        save,
        signal: abort.signal,
      }),
    ).rejects.toThrow("Aborted");
    expect(engine.synthesize).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("never leaks upstream API details or secrets into public errors", () => {
    expect(
      publicResearchError(new Error("sk-secret upstream details")).message,
    ).not.toContain("sk-secret");
    expect(publicResearchError({ status: 429 }).code).toBe(
      "PROVIDER_RATE_LIMIT",
    );
    expect(publicResearchError({ name: "APIUserAbortError" }).code).toBe(
      "TIMEOUT",
    );
  });
});

describe("installed OpenAI SDK wire compatibility", () => {
  it.each([
    { configured: "", expected: "gpt-5.5", reasoning: true },
    { configured: "gpt-5.5", expected: "gpt-5.5", reasoning: true },
    { configured: "gpt-4.1", expected: "gpt-4.1", reasoning: false },
  ])("sends compatible real SDK requests for configured model '$configured'", async ({configured, expected, reasoning}) => {
    vi.stubEnv("OPENAI_API_KEY", "test-placeholder-not-a-real-api-key");
    vi.stubEnv("OPENAI_MODEL", configured);
    const requests: Record<string, unknown>[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        requests.push(body);
        if (body.stream) {
          const response = {
            status: "completed",
            output: [
              {
                type: "web_search_call",
                action: {
                  type: "search",
                  sources: [{ url, title: "Official OAuth guide" }],
                },
              },
              {
                type: "message",
                content: [
                  {
                    type: "output_text",
                    text: material.text,
                    annotations: [
                      {
                        type: "url_citation",
                        url,
                        title: "Official OAuth guide",
                      },
                    ],
                  },
                ],
              },
            ],
          };
          const events = [
            {
              type: "response.web_search_call.searching",
              sequence_number: 1,
              output_index: 0,
              item_id: "search-test",
            },
            { type: "response.completed", sequence_number: 2, response },
          ];
          return new Response(
            events
              .map(
                (event) =>
                  `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`,
              )
              .join("") + "data: [DONE]\n\n",
            { headers: { "Content-Type": "text/event-stream" } },
          );
        }
        return Response.json({
          id: "response-test",
          object: "response",
          status: "completed",
          output: [
            {
              id: "message-test",
              type: "message",
              status: "completed",
              role: "assistant",
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify(content()),
                  annotations: [],
                },
              ],
            },
          ],
        });
      }),
    );
    const transport = new OpenAIResearchTransport();
    const events: ResearchEvent[] = [];
    const research = await transport.search(
      "Example",
      (event) => events.push(event),
      new AbortController().signal,
    );
    expect(research).toEqual(material);
    expect(events.map((event) => event.phase)).toEqual([
      "searching",
      "source-found",
    ]);
    expect(
      await transport.synthesize(
        "Example",
        research,
        new AbortController().signal,
      ),
    ).toEqual(content());
    expect(requests[0]).toMatchObject({
      tool_choice: "required",
      stream: true,
      store: false,
      tools: [{ type: "web_search" }],
      include: ["web_search_call.action.sources"],
    });
    expect(requests[1]).toMatchObject({
      store: false,
      text: { format: { type: "json_schema", strict: true } },
    });
    expect(JSON.stringify(requests[1])).not.toContain('"format":"uri"');
    // The safety policy must reach both real SDK requests; a schema/provenance
    // check alone cannot catch a valid citation used for the wrong app lifecycle.
    for (const request of requests) {
      expect(request.model).toBe(expected);
      if (reasoning) expect(request.reasoning).toEqual({effort: "low"});
      else expect(request).not.toHaveProperty("reasoning");
      const instructions = String(request.instructions);
      expect(instructions).toMatch(
        /client registration; audience and public installability;/i,
      );
      expect(instructions).toMatch(
        /administrator authorization; provider app verification; commercial distribution; and directory\/marketplace listing/i,
      );
      expect(instructions).toMatch(
        /only state that listing is mandatory for public OAuth installs if official documentation explicitly connects/i,
      );
      expect(instructions).toMatch(
        /do not infer .*immediate registration.*absence of a documented review process/is,
      );
      expect(instructions).toMatch(
        /approval timing must be unknown when there is no cited, published provider timing or SLA/i,
      );
      expect(instructions).toMatch(/missing timing does not mean a missing review process/i);
      expect(instructions).toMatch(/preserve documented listing submission and review requirements even when their timing is unknown/i);
    }
  });
});
