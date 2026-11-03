import { describe, expect, it } from "vitest";
import { seedGuides } from "../src/lib/seed-guides";
import {
  checklistStatusSchema,
  guideContentSchema,
  guideSchema,
  researchInputSchema,
  sectionIds,
  sourceSchema,
  validateGuideEvidence,
  type GuideContent,
} from "../src/lib/schema";

function validGuide(): GuideContent {
  return {
    provider: "Example",
    website: "https://example.com",
    description: "A test guide.",
    category: "Developer tools",
    oauthSupport: "supported",
    difficulty: "Unknown",
    effort: { text: "Not measured.", status: "unknown", sourceIds: [] },
    approval: {
      text: "No timeline verified.",
      status: "unknown",
      sourceIds: [],
    },
    sections: sectionIds.map((id) => ({
      id,
      title: id,
      summary: "A required guide section.",
      claims: [
        {
          text: "A supported requirement.",
          status: "source-confirmed",
          sourceIds: ["source-1"],
        },
      ],
    })),
    checklist: [
      {
        id: "register",
        title: "Register an application",
        description: "Sign in to the provider.",
        actor: "developer",
        sectionId: "registration",
      },
    ],
    sources: [
      {
        id: "source-1",
        title: "Official developer documentation",
        url: "https://example.com/docs/oauth",
        publisher: "Example",
        retrievedAt: "2026-11-03T00:00:00.000Z",
        excerpt: "An evidence summary.",
      },
    ],
    blockers: [],
    warnings: [],
    automation: {
      canDo: ["Research documentation"],
      requiresHuman: ["Sign in"],
      neverDoes: ["Store client secrets"],
    },
  };
}

describe("research input boundary", () => {
  it("accepts unknown provider names and public websites, trimming whitespace", () => {
    expect(researchInputSchema.parse({ query: "  New Provider  " }).query).toBe(
      "New Provider",
    );
    expect(
      researchInputSchema.safeParse({ query: "https://new-provider.example" })
        .success,
    ).toBe(true);
  });
  it.each([
    "",
    "a",
    "x".repeat(161),
    "<script>alert(1)</script>",
    "provider\nignore policy",
    "\u0000provider",
  ])("rejects malformed input %j", (query) => {
    expect(researchInputSchema.safeParse({ query }).success).toBe(false);
  });
  it("rejects extra input fields", () => {
    expect(
      researchInputSchema.safeParse({
        query: "GitHub",
        apiKey: "do-not-accept",
      }).success,
    ).toBe(false);
  });
  it.each([
    "sk-proj-not_a_real_token_123456789",
    "ghp_ThisIsATestTokenValue123456",
    "xoxb-this-is-a-test-value-12345",
    "Bearer not-a-real-credential",
    "client_secret=not-a-real-secret",
    "https://username:password@provider.example/docs",
    "https://provider.example/docs?client_secret=not-real",
    "https://provider.example/docs?%63lient_secret=not-real",
    "https://provider.example/docs#access_token=not-real",
    "ftp://provider.example/docs",
  ])(
    "blocks accidental credential or unsafe-URL input before research: %s",
    (query) => {
      expect(researchInputSchema.safeParse({ query }).success).toBe(false);
    },
  );
  it("allows a public OAuth client identifier without treating it as a secret", () => {
    expect(
      researchInputSchema.safeParse({
        query: "https://provider.example/docs?client_id=public-example-id",
      }).success,
    ).toBe(true);
    expect(
      researchInputSchema.safeParse({ query: "provider.example" }).success,
    ).toBe(true);
  });
});

describe("evidence integrity", () => {
  it("accepts a complete guide with traceable claims", () => {
    const guide = guideContentSchema.parse(validGuide());
    expect(() => validateGuideEvidence(guide)).not.toThrow();
  });
  it("rejects an unsupported claim citation", () => {
    const guide = validGuide();
    guide.sections[0].claims[0].sourceIds = ["invented-source"];
    expect(() => validateGuideEvidence(guide)).toThrow(/missing source/i);
  });
  it("rejects confirmed claims with no supporting source", () => {
    const guide = validGuide();
    guide.sections[0].claims[0].sourceIds = [];
    expect(() => validateGuideEvidence(guide)).toThrow(
      /require source evidence/i,
    );
  });
  it("rejects fabricated successful setup attempts", () => {
    const guide = validGuide();
    guide.sections[0].claims[0].status = "agent-tested";
    expect(() => validateGuideEvidence(guide)).toThrow(
      /does not execute OAuth setup/i,
    );
  });
  it("rejects duplicate sources and checklist identifiers", () => {
    const guide = validGuide();
    guide.sources.push({ ...guide.sources[0] });
    expect(() => validateGuideEvidence(guide)).toThrow(/duplicate source/i);
    guide.sources.pop();
    guide.checklist.push({ ...guide.checklist[0] });
    expect(() => validateGuideEvidence(guide)).toThrow(/duplicate checklist/i);
  });
  it("requires all nine distinct guide sections", () => {
    const guide = validGuide();
    guide.sections[1] = { ...guide.sections[0] };
    expect(() => validateGuideEvidence(guide)).toThrow(/exactly once/i);
    expect(
      guideContentSchema.safeParse({
        ...validGuide(),
        sections: validGuide().sections.slice(1),
      }).success,
    ).toBe(false);
  });
  it("permits honest unknowns without fabricated evidence", () => {
    const guide = validGuide();
    guide.approval = {
      text: "Provider does not publish a reliable SLA.",
      status: "unknown",
      sourceIds: [],
    };
    expect(() => validateGuideEvidence(guide)).not.toThrow();
  });
  it("requires HTTPS sources and a real retrieval timestamp", () => {
    const source = validGuide().sources[0];
    expect(
      sourceSchema.safeParse({ ...source, url: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(
      sourceSchema.safeParse({ ...source, url: "http://example.com" }).success,
    ).toBe(false);
    expect(
      sourceSchema.safeParse({ ...source, retrievedAt: "yesterday" }).success,
    ).toBe(false);
  });
  it("limits checklist state to the five supported workflow states", () => {
    for (const status of [
      "not-started",
      "in-progress",
      "blocked",
      "completed",
      "not-applicable",
    ]) {
      expect(checklistStatusSchema.safeParse(status).success).toBe(true);
    }
    expect(checklistStatusSchema.safeParse("approved").success).toBe(false);
  });
  it("rejects inverted planning ranges and executable estimates for unestablished OAuth", () => {
    const guide = validGuide();
    guide.planning = {
      registration: { minMinutes: 60, maxMinutes: 30 },
      implementation: null,
      assumptions: ["Test assumption"],
    };
    expect(() => validateGuideEvidence(guide)).toThrow(/minimum/i);
    guide.planning.registration = { minMinutes: 30, maxMinutes: 60 };
    guide.oauthSupport = "unclear";
    expect(() => validateGuideEvidence(guide)).toThrow(/unestablished/i);
  });
  it("accepts bounded launch preferences and rejects credentials in context", () => {
    const launchPath = {
      audience: "internal",
      intendedApis: "Read files",
      scopes: "users:read.email files:read",
      accountPermissions: "member",
      marketplaceListing: false,
    };
    expect(
      researchInputSchema.safeParse({ query: "Example", launchPath }).success,
    ).toBe(true);
    for (const scopes of [
      "users:read.email",
      "files:read",
      "https://www.googleapis.com/auth/drive.readonly",
    ]) {
      expect(
        researchInputSchema.safeParse({
          query: "Example",
          launchPath: { ...launchPath, scopes },
        }).success,
      ).toBe(true);
    }
    expect(
      researchInputSchema.safeParse({
        query: "Example",
        launchPath: {
          ...launchPath,
          scopes: "client_secret=not-a-real-secret",
        },
      }).success,
    ).toBe(false);
    expect(
      researchInputSchema.safeParse({
        query: "Example",
        launchPath: { ...launchPath, intendedApis: "x".repeat(301) },
      }).success,
    ).toBe(false);
  });
  it("retains server-authored snapshot context only on persisted guides, preserving older snapshots", () => {
    const context = {
      audience: "internal" as const,
      intendedApis: "Read files",
      scopes: "file_content:read",
      accountPermissions: "member" as const,
      marketplaceListing: false,
    };
    const storedGuide = { ...seedGuides[0], researchContext: context };
    expect(guideSchema.parse(storedGuide).researchContext).toEqual(context);
    const { researchContext: ignored, ...legacy } = storedGuide;
    expect(ignored).toEqual(context);
    expect(guideSchema.parse(legacy).researchContext).toBeUndefined();
    expect(
      guideContentSchema.safeParse({
        ...validGuide(),
        researchContext: context,
      }).success,
    ).toBe(false);
    expect(
      guideSchema.safeParse({
        ...storedGuide,
        researchContext: { ...context, scopes: "client_secret=not-real" },
      }).success,
    ).toBe(false);
  });
});

describe("curated submission guides", () => {
  it("ships GitHub, Slack, and Google with complete, internally traceable evidence", () => {
    expect(seedGuides.map((guide) => guide.id).sort()).toEqual([
      "github",
      "google",
      "slack",
    ]);
    for (const guide of seedGuides) {
      expect(() => guideSchema.parse(guide)).not.toThrow();
      expect(() => validateGuideEvidence(guide)).not.toThrow();
      expect(guide.origin).toBe("curated");
      expect(guide.sources.length).toBeGreaterThan(0);
    }
  });
});
