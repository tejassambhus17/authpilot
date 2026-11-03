import { researchInputSchema, type ResearchEvent } from "@/lib/schema";
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
        },
        { status: 400 },
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
    const abort = new AbortController();
    const cancel = () => abort.abort();
    request.signal.addEventListener("abort", cancel, { once: true });
    if (request.signal.aborted) cancel();
    const timer = setTimeout(() => abort.abort(), RESEARCH_TIMEOUT_MS);
    const encoder = new TextEncoder();
    let closed = false;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const emit = (event: ResearchEvent) => {
          if (closed || request.signal.aborted) return;
          try {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
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
          });
        } catch (error) {
          const failure = publicResearchError(error);
          console.error("AuthPilot research failure", {
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
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const failure = publicResearchError(error);
    return Response.json(
      { error: failure.message, code: failure.code },
      {
        status: failure.status,
        headers: failure.status === 429 ? { "Retry-After": "3600" } : undefined,
      },
    );
  }
}
