import { Directory } from "@/components/directory";
import { getGuides } from "@/lib/server/store";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  if ((await searchParams).view === "researched")
    redirect("/guides?view=recent");
  const guides = await getGuides();
  return <Directory guides={guides} />;
}
