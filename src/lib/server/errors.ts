import "server-only";

export class ResearchError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 500,
  ) {
    super(message);
    this.name = "ResearchError";
  }
}

export function publicResearchError(error: unknown): ResearchError {
  if (error instanceof ResearchError) return error;
  if (error && typeof error === "object") {
    const detail = error as { name?: string; status?: number; code?: string };
    if (
      detail.name === "AbortError" ||
      detail.name === "TimeoutError" ||
      detail.name === "APIUserAbortError"
    ) {
      return new ResearchError(
        "TIMEOUT",
        "Research timed out or was cancelled. Try a more specific provider website.",
        504,
      );
    }
    if (detail.status === 429)
      return new ResearchError(
        "PROVIDER_RATE_LIMIT",
        "The research service is rate limited. Wait a moment and retry.",
        429,
      );
    if (detail.status === 401 || detail.status === 403)
      return new ResearchError(
        "PROVIDER_AUTH",
        "The research service could not authenticate. Ask the application owner to check its server API key and model access.",
        503,
      );
    if (detail.name === "ZodError")
      return new ResearchError(
        "INVALID_GUIDE",
        "The research result did not pass guide validation. Nothing was saved. Please retry.",
        502,
      );
  }
  return new ResearchError(
    "RESEARCH_FAILED",
    "Research could not finish. Nothing was saved. Please retry, or use the provider's official documentation.",
    502,
  );
}
