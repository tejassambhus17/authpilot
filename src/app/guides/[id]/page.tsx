import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuide } from "@/lib/server/store";
import { GuideView } from "@/components/guide-view";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getGuide((await params).id);
  return {
    title: guide
      ? `${guide.provider} OAuth integration guide`
      : "Guide not found",
    description: guide?.description,
  };
}
export default async function GuidePage({ params }: Props) {
  const guide = await getGuide((await params).id);
  if (!guide) notFound();
  return <GuideView guide={guide} />;
}
