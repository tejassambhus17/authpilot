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
import { publicResearchError, ResearchError } from "@/lib/server/errors";

export const runtime = "nodejs";
export const maxDuration = 180;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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
    const timer = setTimeout(() => abort.abort(), 150_000);
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
