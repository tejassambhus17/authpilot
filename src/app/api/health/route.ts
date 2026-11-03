import { assessDeploymentEnvironment } from "@/lib/server/deployment-config";
export const dynamic = "force-dynamic";
export async function GET() {
  const status = assessDeploymentEnvironment(process.env);
  return Response.json(
    {
      ...status,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
