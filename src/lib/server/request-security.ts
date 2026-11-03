import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { ResearchError } from "./errors";

export function assertResearchAccess(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin) {
    let sameOrigin = false;
    try {
      const actualOrigin = new URL(origin);
      const expected = new URL(request.url);
      const host = request.headers.get("host");
      // Next may expose an internal URL hostname. Host identifies the browser's
      // actual request target; never trust an arbitrary forwarded-host value.
      if (host) {
        if (!/^(?:[a-z0-9.-]+|\[[a-f0-9:.]+\])(?::\d{1,5})?$/i.test(host))
          throw new Error("Invalid request host");
        expected.host = host;
      }
      sameOrigin =
        ["http:", "https:"].includes(actualOrigin.protocol) &&
        actualOrigin.origin === origin &&
        actualOrigin.origin === expected.origin;
    } catch {
      /* Opaque, malformed, and non-HTTP origins are rejected. */
    }
    if (!sameOrigin)
      throw new ResearchError(
        "INVALID_ORIGIN",
        "Research requests must come from this application.",
        403,
      );
  }
  const token = process.env.RESEARCH_ACCESS_TOKEN;
  if (token) {
    const supplied = request.headers.get("x-research-token") || "";
    const expectedHash = createHash("sha256").update(token).digest();
    const suppliedHash = createHash("sha256").update(supplied).digest();
    if (!timingSafeEqual(expectedHash, suppliedHash))
      throw new ResearchError(
        "ACCESS_TOKEN_REQUIRED",
        "This deployment requires a research access token. Ask the owner for the token and enter it in the research form.",
        401,
      );
  }
}

export async function readSmallJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ResearchError(
      "INVALID_BODY",
      "Send a JSON research request.",
      415,
    );
  const reader = request.body?.getReader();
  if (!reader)
    throw new ResearchError(
      "INVALID_BODY",
      "Enter a provider name or website.",
      400,
    );
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2048) {
      await reader.cancel();
      throw new ResearchError(
        "BODY_TOO_LARGE",
        "Research requests must be under 2 KB.",
        413,
      );
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ResearchError(
      "INVALID_BODY",
      "The research request is not valid JSON.",
      400,
    );
  }
}

export function anonymousRateLimitKey(request: Request): string {
  // Trust the platform-sanitized forwarding header only on Vercel. Local callers share a bucket.
  const identifier = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown"
    : "local";
  return createHash("sha256").update(identifier).digest("hex");
}
