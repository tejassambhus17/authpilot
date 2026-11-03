import { expect, test } from "@playwright/test";

test("find a provider, track setup persistently, share and export the guide", async ({ page, request }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search providers" });
  await search.fill("GitHub");
  await page.getByRole("link", { name: /GitHub/ }).first().click();
  await expect(page).toHaveURL(/\/guides\/github/);
  await expect(page.getByRole("heading", { name: /GitHub/, level: 1 })).toBeVisible();

  await page.getByRole("tab", { name: /Your checklist/ }).click();
  const firstStatus = page.getByRole("combobox", { name: /^Status for / }).first();
  await firstStatus.selectOption("blocked");
  await page.reload();
  await page.getByRole("tab", { name: /Your checklist/ }).click();
  await expect(firstStatus).toHaveValue("blocked");
  await firstStatus.selectOption("completed");
  await page.reload();
  await page.getByRole("tab", { name: /Your checklist/ }).click();
  await expect(firstStatus).toHaveValue("completed");

  const markdown = await request.get("/api/guides/github/export");
  expect(markdown.ok()).toBeTruthy();
  expect(markdown.headers()["content-type"]).toContain("text/markdown");
  expect(await markdown.text()).toMatch(/GitHub/);
  expect(await markdown.text()).toMatch(/https:\/\/docs.github.com/);
  await expect(page.getByRole("link", { name: "Export Markdown" })).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Export Markdown" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/github.*\.md$/i);
  await page.getByRole("button", { name: "Copy guide link" }).click();
  await expect(page.getByRole("status")).toContainText(/Guide link copied|Copy this guide/);

  const theme = page.getByRole("button", { name: "Toggle theme" });
  const before = await page.locator("html").getAttribute("data-theme");
  await theme.click();
  await expect.poll(() => page.locator("html").getAttribute("data-theme")).not.toBe(before);
});

test("unmatched providers have a useful empty state", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search providers" }).fill("unlisted-provider-xyz");
  await expect(page.getByText(/No providers found|No matching providers/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Research/i }).last()).toBeVisible();
});

test("invalid research requests fail with a recoverable validation error", async ({ request }) => {
  const result = await request.post("/api/research", { data: { query: "" } });
  expect(result.status()).toBe(400);
  expect(await result.text()).not.toMatch(/sk-[a-z0-9]/i);
});

test("unconfigured live research explains the missing key and preserves input", async ({ page, request }) => {
  const health = await (await request.get("/api/health")).json();
  test.skip(health.apiKeyConfigured, "This deployment has a real research key configured.");
  await page.goto("/research");
  await expect(page.getByText(/Live research needs OPENAI_API_KEY/)).toBeVisible();
  await page.getByLabel("Which provider are you integrating?").fill("Notion");
  await page.getByRole("button", { name: "Research provider", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Research needs your attention" })).toContainText(/OPENAI_API_KEY/);
  await expect(page.getByLabel("Which provider are you integrating?")).toHaveValue("Notion");
  await expect(page.getByRole("link", { name: /local setup instructions/ })).toBeVisible();
});

test("research UI handles rate-limit failure, retry, NDJSON events, and guide navigation", async ({ page }) => {
  // HTTP fixtures are confined to this test. Production always calls the real research API.
  // This covers the stream consumer; SQLite and generation are verified in unit tests.
  await page.route("**/api/health", route => route.fulfill({ json: {
    apiKeyConfigured: true, persistenceConfigured: true, researchReady: true, accessTokenRequired: false,
  } }));
  let requests = 0;
  await page.route("**/api/research", async route => {
    requests++;
    expect(route.request().postDataJSON()).toEqual({ query: "GitHub" });
    if (requests === 1) {
      await route.fulfill({ status: 429, json: { error: "The research service is rate limited. Wait a moment and retry.", code: "PROVIDER_RATE_LIMIT" } });
      return;
    }
    const events = [
      { phase: "accepted", message: "Research request accepted." },
      { phase: "searching", message: "The web-search tool is researching official provider documentation." },
      { phase: "source-found", message: "Creating an OAuth app", url: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app" },
      { phase: "synthesizing", message: "Documentation returned. Building a structured guide." },
      { phase: "validating", message: "Checking citation provenance and evidence labels." },
      { phase: "saving", message: "Saving a persistent guide snapshot." },
      { phase: "complete", message: "Your guide is ready.", guideId: "github" },
    ].map(event => ({ ...event, timestamp: "2026-11-03T12:00:00.000Z" }));
    await route.fulfill({ contentType: "application/x-ndjson; charset=utf-8", body: events.map(event => JSON.stringify(event)).join("\n") + "\n" });
  });
  await page.goto("/research");
  await page.getByLabel("Which provider are you integrating?").fill("GitHub");
  await page.getByRole("button", { name: "Research provider", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Research needs your attention" })).toContainText(/rate limited/);
  await expect(page.getByLabel("Which provider are you integrating?")).toHaveValue("GitHub");
  await page.getByRole("button", { name: "Research provider", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Research journal" })).toBeVisible();
  await expect(page.locator(".journal-events > li")).toHaveCount(7);
  await expect(page.getByRole("link", { name: /https:\/\/docs.github.com/ })).toBeVisible();
  await page.getByRole("link", { name: "Open your guide" }).click();
  await expect(page).toHaveURL(/\/guides\/github/);
  expect(requests).toBe(2);
});

test("a truncated research response does not present an unsaved guide as complete", async ({ page }) => {
  await page.route("**/api/research", route => route.fulfill({
    contentType: "application/x-ndjson",
    body: JSON.stringify({ phase: "accepted", message: "Research request accepted.", timestamp: "2026-11-03T12:00:00.000Z" }) + "\n",
  }));
  await page.goto("/research");
  await page.getByLabel("Which provider are you integrating?").fill("Example Provider");
  await page.getByRole("button", { name: "Research provider", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Research needs your attention" })).toContainText(/connection ended before the guide was saved/i);
  await expect(page.getByRole("link", { name: "Open your guide" })).toHaveCount(0);
});

test("mobile navigation remains usable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  const navigation = page.getByRole("dialog");
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "Research a provider" }).click();
  await expect(page).toHaveURL(/\/research/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("Which provider are you integrating?")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("guide tabs support keyboard navigation", async ({ page }) => {
  await page.goto("/guides/github");
  await page.getByRole("tab", { name: "Setup guide", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Your checklist/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("combobox", { name: /^Status for / }).first()).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Agent boundaries" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: /A useful agent/ })).toBeVisible();
});
