import type { Metadata } from "next";
import { ResearchView } from "@/components/research-view";
export const metadata: Metadata = { title: "Research a provider" };
export default function ResearchPage() {
  return <ResearchView />;
}
