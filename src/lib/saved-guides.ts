"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

const key = "authpilot:saved-guides:v1";
const changed = "authpilot:saved-guides-changed";
const empty = "[]";
const unavailable = "storage-unavailable";

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(changed, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(changed, listener);
  };
}

function snapshot() {
  try {
    return window.localStorage.getItem(key) || empty;
  } catch {
    return unavailable;
  }
}

function parseIds(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter(
              (id): id is string =>
                typeof id === "string" && id.length > 0 && id.length <= 160,
            ),
          ),
        ].slice(0, 2000)
      : [];
  } catch {
    return [];
  }
}

const subscribeHydration = () => () => {};

export function useSavedGuides() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => empty);
  const isLoaded = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const savedIds = useMemo(() => parseIds(raw), [raw]);
  const [writeError, setWriteError] = useState("");
  const toggleSaved = useCallback((id: string) => {
    try {
      const current = parseIds(window.localStorage.getItem(key) || empty);
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id];
      window.localStorage.setItem(key, JSON.stringify(next));
      setWriteError("");
      window.dispatchEvent(new Event(changed));
    } catch {
      setWriteError(
        "This browser could not save your bookmark. Allow local storage and try again.",
      );
    }
  }, []);
  return {
    savedIds,
    isLoaded,
    toggleSaved,
    storageError:
      writeError ||
      (raw === unavailable
        ? "Saved guides need browser storage. Allow local storage and refresh."
        : ""),
  };
}
