import "server-only";
import { createClient, type Client } from "@libsql/client";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { guideSchema, validateGuideEvidence, type Guide } from "@/lib/schema";
import { seedGuides } from "@/lib/seed-guides";
import { guideForReading } from "@/lib/claim-evidence";
import { ResearchError } from "./errors";
import { assessDeploymentEnvironment } from "./deployment-config";

export function localDatabaseUrl(filename: string): string {
  // libSQL percent-decodes its URI path. Preserve spaces/#/? in real Windows
  // workspace and temp paths rather than interpreting them as URL components.
  return `file:${encodeURI(filename.replaceAll("\\", "/")).replaceAll("#", "%23").replaceAll("?", "%3F")}`;
}

export function databaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  // Bound remote reads/writes as well as research. libSQL accepts a custom
  // Fetch implementation; preserve its request and any existing cancellation.
  const inherited =
    init?.signal || (input instanceof Request ? input.signal : undefined);
  const deadline = AbortSignal.timeout(15_000);
  return fetch(input, {
    ...init,
    signal: inherited ? AbortSignal.any([inherited, deadline]) : deadline,
  });
}

export function createGuideStore(client: Client) {
  let initialized: Promise<void> | undefined;
  const initialize = () =>
    (initialized ??= client
      .batch(
        [
          "CREATE TABLE IF NOT EXISTS guides (id TEXT PRIMARY KEY, document TEXT NOT NULL, created_at TEXT NOT NULL)",
          "CREATE TABLE IF NOT EXISTS research_limits (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL)",
        ],
        "write",
      )
      .then(() => undefined)
      .catch((error) => {
        initialized = undefined;
        throw error;
      }));

  return {
    async getGuides(): Promise<Guide[]> {
      await initialize();
      const result = await client.execute(
        "SELECT document FROM guides ORDER BY created_at DESC LIMIT 200",
      );
      return result.rows.map((row) =>
        guideSchema.parse(JSON.parse(String(row.document))),
      );
    },
    async getGuide(id: string): Promise<Guide | null> {
      await initialize();
      const result = await client.execute({
        sql: "SELECT document FROM guides WHERE id = ?",
        args: [id],
      });
      return result.rows[0]
        ? guideSchema.parse(JSON.parse(String(result.rows[0].document)))
        : null;
    },
    async saveGuide(guide: Guide): Promise<void> {
      const validated = guideSchema.parse(guide);
      validateGuideEvidence(validated);
      await initialize();
      // Immutable research snapshots: a shared URL always identifies the same evidence.
      await client.execute({
        sql: "INSERT INTO guides (id, document, created_at) VALUES (?, ?, ?)",
        args: [validated.id, JSON.stringify(validated), validated.createdAt],
      });
    },
    async consumeRateLimit(
      key: string,
      limit: number,
      windowMs: number,
      now = Date.now(),
    ): Promise<boolean> {
      await initialize();
      // One atomic UPSERT, shared across serverless instances when using Turso.
      const result = await client.execute({
        sql: `INSERT INTO research_limits(bucket, count, expires_at) VALUES (?, 1, ?)
          ON CONFLICT(bucket) DO UPDATE SET count = CASE WHEN expires_at <= ? THEN 1 ELSE count + 1 END,
          expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END
          WHERE expires_at <= ? OR count < ? RETURNING count`,
        args: [key, now + windowMs, now, now, now, limit],
      });
      // Bounded cleanup of expired anonymous buckets; no raw IP addresses are stored.
      await client.execute({
        sql: "DELETE FROM research_limits WHERE expires_at < ?",
        args: [now - windowMs],
      });
      return result.rows.length > 0;
    },
  };
}

export function databaseConfigured(): boolean {
  return assessDeploymentEnvironment(process.env).persistenceConfigured;
}

let storePromise: Promise<ReturnType<typeof createGuideStore>> | undefined;
export function getStore() {
  return (storePromise ??= (async () => {
    const remote = process.env.TURSO_DATABASE_URL;
    if (!databaseConfigured()) {
      throw new ResearchError(
        "DATABASE_NOT_CONFIGURED",
        "Persistent research storage is not configured correctly. Use a public libsql:// or https:// database URL and its server auth token. Both are required on Vercel.",
        503,
      );
    }
    const localDirectory = resolve(process.cwd(), "data");
    if (!remote) await mkdir(localDirectory, { recursive: true });
    const client = createClient({
      url: remote || localDatabaseUrl(resolve(localDirectory, "authpilot.db")),
      authToken: process.env.TURSO_AUTH_TOKEN,
      ...(remote ? { fetch: databaseFetch } : {}),
    });
    return createGuideStore(client);
  })().catch((error) => {
    storePromise = undefined;
    throw error;
  }));
}

export async function getGuides(): Promise<Guide[]> {
  if (!databaseConfigured()) return seedGuides;
  const persisted = await (await getStore()).getGuides();
  const seedIds = new Set(seedGuides.map((guide) => guide.id));
  return [
    ...seedGuides,
    ...persisted.filter((guide) => !seedIds.has(guide.id)).map(guideForReading),
  ];
}

export async function getGuide(id: string): Promise<Guide | null> {
  const seed = seedGuides.find((guide) => guide.id === id);
  if (seed) return seed;
  if (!databaseConfigured()) return null;
  const persisted = await (await getStore()).getGuide(id);
  return persisted ? guideForReading(persisted) : null;
}

export async function saveGuide(guide: Guide): Promise<void> {
  if (seedGuides.some((seed) => seed.id === guide.id))
    throw new Error("Curated guides are immutable.");
  await (await getStore()).saveGuide(guide);
}
