import { describe, expect, it } from "vitest";
import { guideCategory } from "@/lib/guide-category";

describe("library display categories", () => {
  it("groups synonymous generated labels without rewriting source data", () => {
    const labels = [
      "Project management / issue tracking",
      "Work management / project management",
      "Productivity / workspace collaboration",
      "Productivity",
      "File storage and collaboration API",
    ];
    expect(labels.map(guideCategory)).toEqual([
      "Project management",
      "Project management",
      "Productivity",
      "Productivity",
      "Storage",
    ]);
    expect(labels[0]).toBe("Project management / issue tracking");
  });
  it("retains unfamiliar categories rather than inventing a classification", () => {
    expect(guideCategory("  Industrial   automation  ")).toBe(
      "Industrial automation",
    );
    expect(guideCategory("Healthcare / records")).toBe("Healthcare / records");
  });
  it("keeps known categories readable and supplies an empty-value fallback", () => {
    expect(guideCategory("developer tools")).toBe("Developer tools");
    expect(guideCategory("Communication")).toBe("Communication");
    expect(guideCategory(" ")).toBe("Other");
  });
});
