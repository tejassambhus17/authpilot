import { Directory } from "@/components/directory";
import { getGuides } from "@/lib/server/store";
export const dynamic = "force-dynamic";
export default async function Home() {
  const guides = await getGuides();
  return <Directory guides={guides} />;
}
