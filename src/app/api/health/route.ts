import { databaseConfigured } from "@/lib/server/store";
export const dynamic = "force-dynamic";
export async function GET() {
  const apiKeyConfigured = Boolean(process.env.OPENAI_API_KEY);
  const persistenceConfigured = databaseConfigured();
  return Response.json(
    {
      apiKeyConfigured,
      persistenceConfigured,
      researchReady: apiKeyConfigured && persistenceConfigured,
      accessTokenRequired: Boolean(process.env.RESEARCH_ACCESS_TOKEN),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
