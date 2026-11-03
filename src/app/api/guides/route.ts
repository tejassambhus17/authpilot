import { getGuides } from "@/lib/server/store";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(await getGuides(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "The guide library could not be loaded. Please retry." },
      { status: 503 },
    );
  }
}
