"use client";

import { useId } from "react";
import type { LaunchPath } from "@/lib/schema";
import styles from "./launch-path-fields.module.css";

export function LaunchPathFields({
  value,
  onChange,
  disabled = false,
}: {
  value: LaunchPath;
  onChange: (value: LaunchPath) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <fieldset className={styles.fields} disabled={disabled}>
      <legend>Your launch path</legend>
      <p className={styles.help}>
        Select your intended use. These preferences tailor the plan; they do not
        establish provider eligibility or grant permissions.
      </p>
      <div className={styles.grid}>
        <label htmlFor={`${id}-audience`}>
          App audience
          <select
            id={`${id}-audience`}
            value={value.audience}
            onChange={(e) =>
              onChange({
                ...value,
                audience: e.target.value as LaunchPath["audience"],
              })
            }
          >
            <option value="unsure">Not decided yet</option>
            <option value="internal">Internal / my organization</option>
            <option value="public">Public / external users</option>
          </select>
        </label>
        <label htmlFor={`${id}-permissions`}>
          Your account permissions
          <select
            id={`${id}-permissions`}
            value={value.accountPermissions}
            onChange={(e) =>
              onChange({
                ...value,
                accountPermissions: e.target
                  .value as LaunchPath["accountPermissions"],
              })
            }
          >
            <option value="unknown">Not checked yet</option>
            <option value="admin">Owner / administrator</option>
            <option value="member">Member / need an administrator</option>
          </select>
        </label>
        <label htmlFor={`${id}-apis`}>
          Intended APIs <span>(optional)</span>
          <input
            id={`${id}-apis`}
            maxLength={300}
            value={value.intendedApis}
            placeholder="e.g. read design files"
            onChange={(e) =>
              onChange({ ...value, intendedApis: e.target.value })
            }
          />
        </label>
        <label htmlFor={`${id}-scopes`}>
          Scopes to investigate <span>(optional)</span>
          <input
            id={`${id}-scopes`}
            maxLength={300}
            value={value.scopes}
            placeholder="Scope names, if known"
            onChange={(e) => onChange({ ...value, scopes: e.target.value })}
          />
        </label>
      </div>
      <label className={styles.check}>
        <input
          type="checkbox"
          checked={value.marketplaceListing}
          onChange={(e) =>
            onChange({ ...value, marketplaceListing: e.target.checked })
          }
        />
        Include optional marketplace / directory listing
      </label>
      {value.audience === "internal" && value.marketplaceListing && (
        <p className={styles.conflict} role="status">
          Internal audience and marketplace listing may conflict. Both internal
          and public steps remain visible until you confirm the intended
          distribution.
        </p>
      )}
      <p className={styles.help}>
        Public OAuth distribution, marketplace listing, and administrator
        consent are separate paths. Never enter credentials or confidential
        details.
      </p>
    </fieldset>
  );
}
