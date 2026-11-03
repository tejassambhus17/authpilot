"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, CircleHelp, FileSearch, X } from "lucide-react";
import type { Claim, Guide } from "@/lib/schema";
import { getPlanningEstimate } from "@/lib/launch-path";
import {
  isAuditedFigmaSnapshot,
  isManualCorrectionClaim,
  isManualCorrectionSource,
} from "@/lib/provider-corrections";
import { EvidenceTag } from "./evidence";
import styles from "./evidence-inspector.module.css";

function retrievalDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

const verificationLabels = {
  "passage-matched": "Source passage matched",
  unverified: "Evidence not verified",
  conflicting: "Conflicting evidence",
  unsupported: "Claim not supported",
};

export function EvidenceInspector({
  claim,
  guide,
}: {
  claim: Claim;
  guide: Guide;
}) {
  const sources = claim.sourceIds
    .map((id) => guide.sources.find((source) => source.id === id))
    .filter((source) => source !== undefined);
  const evidence = claim.evidence || [];
  const compactEstimate =
    claim.status === "estimate" &&
    !sources.length &&
    !evidence.length &&
    !claim.verification;
  const title = compactEstimate
    ? "About this estimate"
    : "Why this requirement?";
  const hasMatchedPassage = evidence.some((item) => item.match === "matched");
  const manualCorrection =
    isAuditedFigmaSnapshot(guide) && isManualCorrectionClaim(claim);
  const verificationCaveat = manualCorrection
    ? "Manual documentation audit; no server-checked quotation or executed OAuth setup. Read the dated amendment and official source."
    : claim.verification?.status === "conflicting"
      ? "The evidence conflicts. This requirement remains unresolved; compare the source statements before acting."
      : claim.verification?.status === "unsupported"
        ? "The available evidence does not support this claim. Treat it as unresolved."
        : claim.status === "unknown"
          ? "This claim remains unknown. A text match does not resolve its interpretation or applicability."
          : claim.verification?.status === "passage-matched"
            ? "Text presence was checked. AI support is an assessment, not independent verification or a tested OAuth setup."
            : claim.verification
              ? "Claim support has not been verified. Inspect the original documentation before acting."
              : "This snapshot retains source summaries, not server-checked quotations.";

  return (
    <Dialog.Root>
      <Dialog.Trigger className={styles.trigger}>
        <CircleHelp size={14} aria-hidden="true" />
        {title}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.dialog}>
          <header className={styles.header}>
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>
                {compactEstimate
                  ? "Understand the assumptions and limits of this planning judgment."
                  : "Inspect the claim, its conditions, and the evidence retained in this guide."}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="icon-button"
              aria-label="Close evidence inspector"
            >
              <X size={20} />
            </Dialog.Close>
          </header>
          <div className={styles.body}>
            {compactEstimate ? (
              <>
                <section
                  className={styles.claim}
                  aria-label="Recorded estimate"
                >
                  <h3>Recorded estimate</h3>
                  <p>{claim.text}</p>
                  <EvidenceTag status="estimate" />
                  <span className={styles.interpretationLabel}>
                    Unmeasured planning judgment
                  </span>
                </section>
                <section className={styles.section}>
                  <h3>Assumptions and exclusions</h3>
                  <ul className={styles.conditions}>
                    {(claim.conditions?.length
                      ? claim.conditions
                      : claim === guide.effort
                        ? getPlanningEstimate(guide).assumptions
                        : [
                            "No separate assumptions were recorded. Confirm the scope and exclusions in the estimate before relying on it.",
                          ]
                    ).map((assumption, index) => (
                      <li key={index}>{assumption}</li>
                    ))}
                  </ul>
                </section>
                <p className={styles.footerNote}>
                  This is not a provider timeline, a measured setup result, or
                  an approval promise. Check approval waiting separately. No
                  supporting quotation or executed OAuth setup is claimed.
                </p>
              </>
            ) : (
              <>
                <section className={styles.claim} aria-label="Exact claim">
                  <h3>Exact claim</h3>
                  <p>{claim.text}</p>
                  <EvidenceTag status={claim.status} />
                  <span className={styles.interpretationLabel}>
                    {manualCorrection
                      ? "Documentation correction"
                      : guide.origin === "researched"
                        ? "AI interpretation"
                        : "Guide interpretation"}
                  </span>
                </section>

                <section className={styles.section}>
                  <h3>Applicable conditions</h3>
                  {claim.conditions?.length ? (
                    <ul className={styles.conditions}>
                      {claim.conditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      No structured conditions were recorded. Preserve any
                      qualifications in the claim, and check the source for your
                      app type, audience, and requested permissions.
                    </p>
                  )}
                </section>

                <section className={styles.section}>
                  <h3>Verification status</h3>
                  <div className={styles.verificationRow}>
                    <p className={styles.verificationTitle}>
                      <FileSearch size={16} aria-hidden="true" />
                      {manualCorrection
                        ? "Manual documentation audit"
                        : claim.verification
                          ? verificationLabels[claim.verification.status]
                          : "Source summary only"}
                    </p>
                    {claim.verification && (
                      <p className={styles.timestamp}>
                        Checked{" "}
                        <time dateTime={claim.verification.checkedAt}>
                          {retrievalDate(claim.verification.checkedAt)} UTC
                        </time>
                      </p>
                    )}
                  </div>
                  <p className={styles.compactCaveat}>{verificationCaveat}</p>
                </section>

                <section className={styles.section}>
                  <h3>Supporting passages</h3>
                  {!hasMatchedPassage && (
                    <p className={styles.missing}>
                      No checked source passage was captured for this snapshot.
                    </p>
                  )}
                  {evidence.map((item, index) => {
                    const source = guide.sources.find(
                      (candidate) => candidate.id === item.sourceId,
                    );
                    return (
                      <article
                        className={styles.passage}
                        key={`${item.sourceId}-${index}`}
                      >
                        <h4>
                          {source?.title || "Referenced document unavailable"}
                        </h4>
                        <p className={styles.passageLabel}>
                          {item.match === "matched"
                            ? "Source statement · passage matched"
                            : "Proposed passage · not verified"}
                        </p>
                        {item.match === "matched" ? (
                          <blockquote>{item.passage}</blockquote>
                        ) : (
                          <p className={styles.unmatched}>{item.passage}</p>
                        )}
                        <p className={styles.assessment}>
                          <strong>AI assessment: {item.assessment}.</strong>{" "}
                          {item.explanation}
                        </p>
                        {item.match && item.match !== "matched" && (
                          <p className={styles.limit}>
                            {item.match === "not-found"
                              ? "The proposed passage was not found in the retrieved page. Do not treat it as a quotation."
                              : "The page could not be retrieved for passage checking. Inspect the documentation manually."}
                          </p>
                        )}
                        {source && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.sourceLink}
                          >
                            {source.retrieval?.authority === "provider-domain"
                              ? "Open provider documentation"
                              : guide.origin === "curated"
                                ? "Open official documentation"
                                : "Open documentation"}
                            <ArrowUpRight size={13} />
                          </a>
                        )}
                      </article>
                    );
                  })}
                  {!sources.length && !evidence.length && (
                    <p>
                      No supporting source was retained for this claim. Treat it
                      as an estimate or unresolved information.
                    </p>
                  )}
                </section>

                <section className={styles.section}>
                  <h3>Assessment details</h3>
                  <p>
                    {claim.verification?.explanation ||
                      "This snapshot retains citation links and summaries, without a server-checked source passage for this claim."}
                  </p>
                  <p className={styles.limit}>
                    A matched passage establishes that text was found in a
                    retrieved document. It does not independently prove the
                    interpretation, provider approval, or a successful OAuth
                    setup.
                  </p>
                </section>

                {sources.length > 0 && (
                  <section className={styles.section}>
                    <h3>Documentation and retained summaries</h3>
                    {sources.map((source) => (
                      <article className={styles.source} key={source.id}>
                        <h4>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {source.title}
                            <ArrowUpRight size={14} />
                          </a>
                        </h4>
                        <a
                          className={styles.sourceUrl}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.url}
                        </a>
                        <p className={styles.timestamp}>
                          {source.publisher} · Retrieved{" "}
                          <time dateTime={source.retrievedAt}>
                            {retrievalDate(source.retrievedAt)} UTC
                          </time>
                        </p>
                        {source.retrieval && (
                          <div className={styles.retrieval}>
                            <p>
                              <strong>
                                {source.retrieval.authority ===
                                "provider-domain"
                                  ? "Matches researched provider domain"
                                  : "Provider-domain identity not established"}
                              </strong>
                            </p>
                            <p>{source.retrieval.detail}</p>
                            <p className={styles.timestamp}>
                              Page{" "}
                              {source.retrieval.status === "retrieved"
                                ? "retrieved"
                                : "retrieval attempted"}{" "}
                              <time dateTime={source.retrieval.checkedAt}>
                                {retrievalDate(source.retrieval.checkedAt)} UTC
                              </time>
                            </p>
                          </div>
                        )}
                        <p className={styles.passageLabel}>
                          {isAuditedFigmaSnapshot(guide) &&
                          isManualCorrectionSource(source)
                            ? "Documentation audit summary"
                            : guide.origin === "researched"
                              ? "AI evidence summary"
                              : "Guide summary"}{" "}
                          · not a quotation
                        </p>
                        <p>
                          {source.excerpt || "No source summary was retained."}
                        </p>
                      </article>
                    ))}
                  </section>
                )}
                <p className={styles.footerNote}>
                  {guide.origin === "curated"
                    ? "The curated guide was reviewed against official documentation. Read the original page for the full context and current requirements."
                    : "Publisher names and interpretations come from research. Check that the linked documentation belongs to the intended provider before acting."}
                </p>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
