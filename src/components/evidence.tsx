import { CircleHelp, FlaskConical, ShieldCheck, Timer } from "lucide-react";
import type { EvidenceStatus } from "@/lib/schema";
export const evidenceLabels: Record<EvidenceStatus, string> = {
  "source-confirmed": "Source confirmed",
  "agent-tested": "Agent tested",
  estimate: "Planning estimate",
  unknown: "Not verified",
};
export function EvidenceTag({ status }: { status: EvidenceStatus }) {
  const Icon =
    status === "source-confirmed"
      ? ShieldCheck
      : status === "estimate"
        ? Timer
        : status === "agent-tested"
          ? FlaskConical
          : CircleHelp;
  return (
    <span className={`evidence-tag ${status}`}>
      <Icon size={10} />
      {evidenceLabels[status]}
    </span>
  );
}
