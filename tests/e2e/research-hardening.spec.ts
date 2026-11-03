import { expect, test } from "@playwright/test";

test("private-network provider input is rejected before any research POST", async ({
  page,
  request,
}) => {
  let attempts = 0;
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().endsWith("/api/research"))
      attempts++;
  });
  await page.goto("/research?q=http%3A%2F%2F127.0.0.1");
  await page
    .getByRole("button", { name: "Research provider", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Research needs your attention" }),
  ).toContainText(/private-network/);
  expect(attempts).toBe(0);
  for (const query of [
    "http://localhost",
    "http://127.0.0.1",
    "http://10.0.0.2",
    "http://[::1]",
    "192.168.1.1",
    "http://service.internal",
  ]) {
    const response = await request.post("/api/research", { data: { query } });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.code).toBe("INVALID_INPUT");
    expect(body.requestId).toMatch(/^AP-/);
    expect(response.headers()["x-request-id"]).toBe(body.requestId);
  }
});

test("launch-path exclusions and Not applicable decisions persist without being shared", async ({
  page,
  request,
  browser,
}) => {
  const guide = (await (await request.get("/api/guides")).json()).find(
    (item: { id: string }) => item.id === "slack",
  );
  const listing = guide.checklist.find(
    (step: { applicability?: string }) => step.applicability === "public",
  );
  expect(listing).toBeTruthy();
  await page.goto("/guides/slack");
  await page.locator("summary").filter({ hasText: "Your launch path" }).click();
  await page
    .getByRole("combobox", { name: "App audience", exact: true })
    .selectOption("internal");
  await page.getByRole("tab", { name: "Setup steps", exact: true }).click();
  await expect(
    page.getByRole("combobox", {
      name: `Status for ${listing.title}`,
      exact: true,
    }),
  ).toHaveValue("not-applicable");
  const first = guide.checklist[0];
  await page
    .getByRole("combobox", { name: `Status for ${first.title}`, exact: true })
    .selectOption("not-applicable");
  await expect(
    page.getByText(/does not satisfy a required prerequisite/).first(),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "Setup steps", exact: true }).click();
  await expect(
    page.getByRole("combobox", {
      name: `Status for ${first.title}`,
      exact: true,
    }),
  ).toHaveValue("not-applicable");
  const other = await browser.newContext();
  try {
    const reader = await other.newPage();
    await reader.goto("http://127.0.0.1:3100/guides/slack");
    await reader
      .locator("summary")
      .filter({ hasText: "Your launch path" })
      .click();
    await expect(
      reader.getByRole("combobox", { name: "App audience", exact: true }),
    ).toHaveValue("unsure");
    await reader.getByRole("tab", { name: "Setup steps", exact: true }).click();
    await expect(
      reader.getByRole("combobox", {
        name: `Status for ${first.title}`,
        exact: true,
      }),
    ).toHaveValue("not-started");
  } finally {
    await other.close();
  }
});

test("specific blocker notes survive reload and stay out of Markdown", async ({
  page,
  request,
}) => {
  const guide = (await (await request.get("/api/guides")).json()).find(
    (item: { id: string }) => item.id === "github",
  );
  const first = guide.checklist[0];
  await page.goto("/guides/github");
  await page.getByRole("tab", { name: "Setup steps", exact: true }).click();
  await page
    .getByRole("combobox", { name: `Status for ${first.title}`, exact: true })
    .selectOption("blocked");
  const reason = page.getByLabel(`Blocker reason for ${first.title}`, {
    exact: true,
  });
  await reason.fill("Awaiting the organization owner decision");
  await page
    .getByLabel(`Blocker owner for ${first.title}`, { exact: true })
    .fill("Organization owner");
  await page.reload();
  await page.getByRole("tab", { name: "Setup steps", exact: true }).click();
  await expect(reason).toHaveValue("Awaiting the organization owner decision");
  await expect(
    page.getByLabel(`Blocker owner for ${first.title}`, { exact: true }),
  ).toHaveValue("Organization owner");
  const exported = await request.get("/api/guides/github/export");
  const text = await exported.text();
  expect(text).toContain("Recovery owner:");
  expect(text).toContain("Hands-on registration estimate:");
  expect(text).not.toContain("Awaiting the organization owner decision");
});

test("all curated Markdown exports preserve provenance and separate waiting from effort", async ({
  request,
}) => {
  for (const id of ["github", "slack", "google"]) {
    const response = await request.get(`/api/guides/${id}/export`);
    expect(response.ok()).toBe(true);
    const text = await response.text();
    expect(text).toContain("## Evidence sources");
    expect(text).toContain("- Retrieved:");
    expect(text).toContain("exclude approval waiting");
    expect(text).toContain("## Action checklist");
    expect(text).toContain("- [ ]");
    expect(text).not.toContain("undefined");
  }
});
