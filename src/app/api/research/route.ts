import { researchInputSchema, type ResearchEvent } from "@/lib/schema";
import { randomUUID } from "node:crypto";
import {
  OpenAIResearchTransport,
  researchProvider,
} from "@/lib/server/research";
import { getStore, saveGuide } from "@/lib/server/store";
import {
  anonymousRateLimitKey,
  assertResearchAccess,
  readSmallJson,
} from "@/lib/server/request-security";
import {
  publicResearchError,
  researchDiagnostic,
  ResearchError,
} from "@/lib/server/errors";
import {
  assessDeploymentEnvironment,
  RESEARCH_TIMEOUT_MS,
} from "@/lib/server/deployment-config";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Admission and remote persistence checks consume the same function budget.
  const deadline = Date.now() + RESEARCH_TIMEOUT_MS;
  const requestId = `AP-${randomUUID().slice(0, 12)}`;
  const responseHeaders = {
    "X-Request-Id": requestId,
    "Cache-Control": "no-store",
  };
  try {
    const configuration = assessDeploymentEnvironment(process.env);
    if (!configuration.serverSecretsSafe)
      throw new ResearchError(
        "UNSAFE_SERVER_CONFIGURATION",
        "Research is disabled because a server credential uses a public environment-variable name. Ask the owner to correct the deployment configuration.",
        503,
      );
    assertResearchAccess(request);
    const input = researchInputSchema.safeParse(await readSmallJson(request));
    if (!input.success)
      return Response.json(
        {
          error: input.error.issues[0]?.message || "Invalid provider.",
          code: "INVALID_INPUT",
          requestId,
        },
        { status: 400, headers: responseHeaders },
      );
    if (!configuration.apiKeyConfigured)
      throw new ResearchError(
        "API_KEY_MISSING",
        "Live research needs an OpenAI API key. Add OPENAI_API_KEY to .env.local and restart the app. The existing guides are ready to use.",
        503,
      );
    const transport = new OpenAIResearchTransport();
    const store = await getStore();
    const permitted = await store.consumeRateLimit(
      `client:${anonymousRateLimitKey(request)}`,
      5,
      60 * 60 * 1000,
    );
    if (!permitted)
      throw new ResearchError(
        "RATE_LIMIT",
        "This browser or network has reached the five-research hourly limit. Please try again in an hour.",
        429,
      );
    if (!(await store.consumeRateLimit("deployment:all", 30, 60 * 60 * 1000)))
      throw new ResearchError(
        "RATE_LIMIT",
        "This deployment has reached its hourly research budget. Please try again later.",
        429,
      );
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      throw new ResearchError(
        "TIMEOUT",
        "The request reached its 270-second limit before research could start. Nothing was saved. Please retry later.",
        504,
      );
    const abort = new AbortController();
    const cancel = () => abort.abort();
    request.signal.addEventListener("abort", cancel, { once: true });
    if (request.signal.aborted) cancel();
    const timer = setTimeout(
      () =>
        abort.abort(
          new ResearchError(
            "TIMEOUT",
            "Research reached its 270-second request limit. No completed guide was returned. Your input is preserved; retry with the official provider website. Check the library before retrying if the connection ended while saving.",
            504,
          ),
        ),
      remaining,
    );
    const encoder = new TextEncoder();
    let closed = false;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const emit = (event: ResearchEvent) => {
          if (closed || request.signal.aborted) return;
          try {
            controller.enqueue(
              encoder.encode(`${JSON.stringify({ ...event, requestId })}\n`),
            );
          } catch {
            closed = true;
            abort.abort();
          }
        };
        try {
          await researchProvider(input.data.query, {
            transport,
            emit,
            save: saveGuide,
            signal: abort.signal,
            launchPath: input.data.launchPath,
            deadline,
          });
        } catch (error) {
          const failure = publicResearchError(
            abort.signal.aborted && abort.signal.reason instanceof ResearchError
              ? abort.signal.reason
              : error,
          );
          console.error("AuthPilot research failure", {
            requestId,
            code: failure.code,
            ...researchDiagnostic(error),
          });
          emit({
            phase: "error",
            message: failure.message,
            code: failure.code,
            timestamp: new Date().toISOString(),
          });
        } finally {
          clearTimeout(timer);
          request.signal.removeEventListener("abort", cancel);
          if (!closed) {
            closed = true;
            controller.close();
          }
        }
      },
      cancel() {
        closed = true;
        clearTimeout(timer);
        abort.abort();
        request.signal.removeEventListener("abort", cancel);
      },
    });
    return new Response(stream, {
      headers: {
        ...responseHeaders,
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const failure = publicResearchError(error);
    console.error("AuthPilot research request rejected", {
      requestId,
      code: failure.code,
      ...researchDiagnostic(error),
    });
    return Response.json(
      { error: failure.message, code: failure.code, requestId },
      {
        status: failure.status,
        headers: {
          ...responseHeaders,
          ...(failure.status === 429 ? { "Retry-After": "3600" } : {}),
        },
      },
    );
  }
}
