import "server-only";
import { setTimeout as delay } from "node:timers/promises";
import type { ResearchEvent } from "@/lib/schema";
import { ResearchError } from "./errors";

export function transientResearchFailure(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const detail = error as {
    name?: string;
    status?: number;
    code?: string;
    cause?: { code?: string };
  };
  if (
    [
      "insufficient_quota",
      "invalid_api_key",
      "invalid_json_schema",
      "unsupported_parameter",
      "model_not_found",
      "invalid_prompt",
      "content_policy_violation",
      "context_length_exceeded",
      "max_output_tokens",
    ].includes(detail.code || "")
  )
    return false;
  if (error instanceof ResearchError)
    return [
      "SEARCH_INCOMPLETE",
      "GENERATION_INCOMPLETE",
      "EVIDENCE_REVIEW_INCOMPLETE",
      "RESEARCH_UPSTREAM_TEMPORARY",
      "RESEARCH_RATE_LIMIT_TEMPORARY",
    ].includes(error.code);
  return (
    ["server_error", "rate_limit_exceeded"].includes(detail.code || "") ||
    ["APIConnectionError", "APIConnectionTimeoutError"].includes(
      detail.name || "",
    ) ||
    [408, 409, 429, 500, 502, 503, 504].includes(detail.status || 0) ||
    [
      "ECONNRESET",
      "ETIMEDOUT",
      "EAI_AGAIN",
      "UND_ERR_SOCKET",
      "UND_ERR_CONNECT_TIMEOUT",
      "UND_ERR_HEADERS_TIMEOUT",
    ].includes(detail.code || detail.cause?.code || "")
  );
}

function retryDelay(error: unknown): number | null {
  const headers = (
    error as { headers?: { get?: (key: string) => string | null } }
  )?.headers;
  const header = headers?.get?.("retry-after");
  if (!header) return 1000;
  const seconds = Number(header);
  const ms = Number.isFinite(seconds)
    ? seconds * 1000
    : Date.parse(header) - Date.now();
  // Do not ignore an upstream request to wait longer than this request can own.
  return Number.isFinite(ms) && ms >= 0 && ms <= 5000
    ? Math.max(1000, ms)
    : null;
}

export async function runResearchStage<T>(
  operation: () => Promise<T>,
  options: {
    phase: ResearchEvent["phase"];
    label: string;
    emit: (event: ResearchEvent) => void;
    signal: AbortSignal;
    deadline: number;
  },
): Promise<T> {
  options.signal.throwIfAborted();
  try {
    return await operation();
  } catch (error) {
    options.signal.throwIfAborted();
    const wait = retryDelay(error);
    if (
      !transientResearchFailure(error) ||
      wait === null ||
      options.deadline - Date.now() < wait + 10_000
    )
      throw error;
    options.emit({
      phase: options.phase,
      message: `${options.label} was interrupted by a temporary service failure. Retrying once; no guide has been saved.`,
      timestamp: new Date().toISOString(),
    });
    await delay(wait, undefined, { signal: options.signal });
    options.signal.throwIfAborted();
    // Exactly one explicit retry. Never retry validation or database writes.
    return await operation();
  }
}
