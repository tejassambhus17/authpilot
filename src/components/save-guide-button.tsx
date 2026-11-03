"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedGuides } from "@/lib/saved-guides";

export function SaveGuideButton({
  guideId,
  provider,
  variant = "default",
}: {
  guideId: string;
  provider?: string;
  variant?: "default" | "icon";
}) {
  const { savedIds, toggleSaved, isLoaded, storageError } = useSavedGuides();
  const saved = savedIds.includes(guideId);
  const label = provider
    ? `${saved ? "Unsave" : "Save"} ${provider} guide`
    : saved
      ? "Saved guide"
      : "Save guide";
  return (
    <span className="save-action">
      <button
        type="button"
        className={`${variant === "icon" ? "icon-button" : "button"} ${saved ? "is-saved" : ""}`}
        aria-label={label}
        aria-pressed={saved}
        disabled={!isLoaded}
        onClick={() => toggleSaved(guideId)}
        title={saved ? "Remove from saved guides" : "Save in this browser"}
      >
        {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}{" "}
        {variant === "default" && <span>{saved ? "Saved" : "Save"}</span>}
      </button>
      {storageError && (
        <span role="alert" className="save-error">
          {storageError}
        </span>
      )}
    </span>
  );
}
