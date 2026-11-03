import { describe, expect, it } from "vitest";
import {
  canonicalSourceUrl,
  isPublicProviderQuery,
} from "@/lib/provider-input";
import { researchInputSchema } from "@/lib/schema";

describe("public provider input", () => {
  it.each([
    "localhost",
    "localhost:3000",
    "http://localhost:3000/docs",
    "https://docs.localhost/oauth",
    "https://127.0.0.1/oauth",
    "127.1",
    "2130706433",
    "0x7f000001",
    "https://0x7f000001/oauth",
    "https://0177.0.0.1/oauth",
    "https://10.0.0.1",
    "192.168.1.1",
    "https://169.254.169.254/latest/meta-data",
    "https://[::1]",
    "https://[::ffff:127.0.0.1]",
    "https://company.internal/oauth",
    "company.lan",
    "https://app.home",
    "https://app.localdomain",
    "https://public.example:8443/docs",
  ])("rejects a non-public website before research: %s", (query) => {
    expect(isPublicProviderQuery(query)).toBe(false);
    expect(researchInputSchema.safeParse({ query }).success).toBe(false);
  });

  it.each([
    "Figma",
    "New Provider",
    "https://developers.figma.com/docs/rest-api/oauth-apps/",
    "figma.com",
    "http://provider.example/docs",
    "https://provider.example/docs?version=v2",
  ])("allows provider names and public website syntax: %s", (query) => {
    expect(isPublicProviderQuery(query)).toBe(true);
    expect(researchInputSchema.safeParse({ query }).success).toBe(true);
  });
});

describe("source URL canonicalization", () => {
  it("removes tracking without dropping meaningful document parameters", () => {
    expect(
      canonicalSourceUrl(
        "https://docs.example.com/oauth?version=v2&utm_source=search&gclid=campaign&scope=read#access",
      ),
    ).toBe("https://docs.example.com/oauth?version=v2&scope=read");
    expect(
      canonicalSourceUrl("https://docs.example.com/oauth?ref=api&lang=en"),
    ).toBe("https://docs.example.com/oauth?ref=api&lang=en");
  });

  it("never turns a credential or private-network URL into a safe link", () => {
    expect(canonicalSourceUrl("https://secret@example.com/oauth")).toBeNull();
    expect(canonicalSourceUrl("https://127.0.0.1/oauth")).toBeNull();
    expect(canonicalSourceUrl("https://app.local/oauth")).toBeNull();
    expect(canonicalSourceUrl("javascript:alert(1)")).toBeNull();
  });
});
