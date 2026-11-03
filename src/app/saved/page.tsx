import type { Metadata } from "next";
import { GuideLibrary } from "@/components/guide-library";
import { getGuides } from "@/lib/server/store";
export const metadata: Metadata = { title: "Saved guides" };
export const dynamic = "force-dynamic";
export default async function SavedPage() {
  return <GuideLibrary guides={await getGuides()} savedOnly />;
}
