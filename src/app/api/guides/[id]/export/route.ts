import { getGuide } from "@/lib/server/store";
import { guideToMarkdown } from "@/lib/server/markdown";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const guide = await getGuide(id);
    if (!guide)
      return Response.json({ error: "Guide not found." }, { status: 404 });
    const filename = `${guide.id.replace(/[^a-zA-Z0-9-]/g, "-")}-oauth-guide.md`;
    return new Response(guideToMarkdown(guide), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "The guide could not be exported. Please retry." },
      { status: 503 },
    );
  }
}
