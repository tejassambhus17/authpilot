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

// Fixed diagnostic vocabulary only: no exception messages, request inputs,
// response bodies, URLs, headers, or credentials enter logs.
export function researchDiagnostic(error: unknown) {
  const value =
    error && typeof error === "object"
      ? (error as {
          name?: string;
          status?: number;
          code?: string;
          cause?: { code?: string };
        })
      : {};
  const names = new Set([
    "Error",
    "ZodError",
    "APIError",
    "APIConnectionError",
    "APIConnectionTimeoutError",
    "BadRequestError",
    "AuthenticationError",
    "RateLimitError",
    "InternalServerError",
    "AbortError",
    "TimeoutError",
    "APIUserAbortError",
    "ResearchError",
  ]);
  const codes = new Set([
    "ECONNRESET",
    "ETIMEDOUT",
    "ENOTFOUND",
    "EAI_AGAIN",
    "ECONNREFUSED",
    "UND_ERR_SOCKET",
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_HEADERS_TIMEOUT",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "invalid_json_schema",
    "unsupported_parameter",
    "model_not_found",
    "insufficient_quota",
    "invalid_api_key",
  ]);
  return {
    kind: value.name && names.has(value.name) ? value.name : "OtherError",
    ...(typeof value.status === "number" &&
    value.status >= 400 &&
    value.status <= 599
      ? { upstreamStatus: value.status }
      : {}),
    ...(value.code && codes.has(value.code)
      ? { reason: value.code }
      : value.cause?.code && codes.has(value.cause.code)
        ? { reason: value.cause.code }
        : {}),
  };
}

export function publicResearchError(error: unknown): ResearchError {
  if (error instanceof ResearchError) return error;
  if (error && typeof error === "object") {
    const detail = error as { name?: string; status?: number; code?: string };
    if (detail.code === "insufficient_quota")
      return new ResearchError(
        "PROVIDER_QUOTA",
        "The research service has no available quota. Ask the application owner to check the API account budget. Nothing was saved.",
        503,
      );
    if (detail.name === "APIConnectionTimeoutError")
      return new ResearchError(
        "RESEARCH_SERVICE_TIMEOUT",
        "A request to the research service timed out. Nothing was saved. Your input is preserved; retry with the provider's official website.",
        504,
      );
    if (detail.name === "APIConnectionError")
      return new ResearchError(
        "RESEARCH_CONNECTION",
        "The connection to the research service was interrupted. Nothing was saved. Your input is preserved; please retry.",
        502,
      );
    if (detail.status === 400)
      return new ResearchError(
        "RESEARCH_CONFIGURATION",
        "The research service rejected the server request configuration. Ask the application owner to check the configured model and request settings. Nothing was saved.",
        503,
      );
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
