import { expect, test } from "@playwright/test";

test("readiness follows personal launch context while keeping snapshot unknowns visible", async ({
  page,
}) => {
  let researchPosts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/api/research"))
      researchPosts++;
  });
  await page.goto("/guides/github");
  const summary = page.getByRole("region", { name: "Readiness summary" });
  await expect(summary).toContainText("Choose your launch audience");
  await summary.getByRole("button", { name: "Edit launch path" }).click();
  await page
    .getByRole("combobox", { name: "App audience", exact: true })
    .selectOption("internal");
  await page
    .getByRole("combobox", { name: "Your account permissions", exact: true })
    .selectOption("member");
  await page
    .getByLabel("Scopes to investigate", { exact: false })
    .fill("read:user");
  await expect(summary).toContainText("You can continue your setup plan");
  await expect(summary).toContainText("Internal");
  await expect(summary).toContainText("read:user");
  await expect(summary).toContainText("Member (declared)");
  await page.reload();
  await expect(summary).toContainText("read:user");
  await expect(summary).toContainText("Member (declared)");
  await summary
    .locator("summary")
    .filter({ hasText: /unresolved findings? in this research snapshot/ })
    .click();
  await expect(summary).toContainText(
    "Snapshot-wide unknowns, including other launch paths",
  );
  await summary
    .getByRole("button", { name: "Inspect guidance", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("tab", { name: "Approval & review", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#section-review")).toBeFocused();
  expect(researchPosts).toBe(0);
});

test("readiness keeps personal blockers and omitted prerequisites visible after reload", async ({
  page,
}) => {
  await page.goto("/guides/github");
  await page.getByRole("tab", { name: "Setup steps", exact: true }).click();
  const firstStatus = page
    .getByRole("combobox", { name: /^Status for / })
    .first();
  const title = (await firstStatus.getAttribute("aria-label"))!.replace(
    /^Status for /,
    "",
  );
  await firstStatus.selectOption("blocked");
  await page
    .getByLabel(`Blocker reason for ${title}`, { exact: true })
    .fill("Need product owner to choose the app model");
  await page
    .getByLabel(`Blocker owner for ${title}`, { exact: true })
    .fill("Product owner");
  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  const summary = page.getByRole("region", { name: "Readiness summary" });
  await expect(summary).toContainText("1 blocker needs attention");
  await expect(
    summary.getByRole("button", { name: /1 marked blocked/ }),
  ).toBeVisible();
  await page.reload();
  await expect(summary).toContainText("1 blocker needs attention");
  await summary
    .locator("summary")
    .filter({ hasText: "Blockers to resolve" })
    .click();
  await expect(summary).toContainText(
    "Need product owner to choose the app model",
  );
  await expect(summary).toContainText("Recovery owner: Product owner");
  await summary
    .getByRole("button", { name: "Read recovery and documentation" })
    .click();
  await expect(
    page.getByRole("tab", { name: "Setup steps", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await firstStatus.selectOption("not-applicable");
  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await expect(summary).toContainText("Review omitted prerequisites");
  await expect(summary).toContainText(
    "skipping a required task does not satisfy its dependencies",
  );
  await page.reload();
  await expect(summary).toContainText("Review omitted prerequisites");
  await expect(summary).toContainText(
    "Account access, OAuth setup and approval have not been verified",
  );
});

test("legacy effort retains its original scope and opens a compact assumptions inspector", async ({
  page,
}) => {
  await page.goto("/guides/github");
  await expect(
    page.getByText(/20–40 minutes for registration and a first test/),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("15–45 minutes");
  await expect(page.locator("body")).not.toContainText("2–8 hours");
  const trigger = page
    .getByRole("button", { name: "About this estimate", exact: true })
    .first();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const inspector = page.getByRole("dialog", {
    name: "About this estimate",
    exact: true,
  });
  await expect(inspector).toBeVisible();
  await expect(
    inspector.getByRole("heading", { name: "Recorded estimate", exact: true }),
  ).toBeVisible();
  await expect(
    inspector.getByRole("heading", {
      name: "Assumptions and exclusions",
      exact: true,
    }),
  ).toBeVisible();
  await expect(inspector).toContainText("No numeric fallback is substituted");
  await expect(inspector).toContainText("not a provider timeline");
  await expect(
    inspector.getByRole("heading", {
      name: "Supporting passages",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(inspector).not.toContainText("Source summary only");
  await expect(inspector).not.toContainText("No checked source passage");
  await page.keyboard.press("Escape");
  await expect(inspector).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
