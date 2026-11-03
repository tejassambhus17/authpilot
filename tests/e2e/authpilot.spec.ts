import { expect, test } from "@playwright/test";

test("find a provider, track setup persistently, share and export the guide", async ({
  page,
  request,
}) => {
  await page.goto("/guides");
  const search = page.getByRole("searchbox", { name: "Search guides" });
  await search.fill("GitHub");
  await page
    .getByRole("link", { name: /GitHub/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/guides\/github/);
  await expect(
    page.getByRole("heading", { name: /GitHub/, level: 1 }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Setup steps", exact: true }).click();
  const firstStatus = page
    .getByRole("combobox", { name: /^Status for / })
    .first();
  await firstStatus.selectOption("blocked");
  await page.reload();
  await page.getByRole("tab", { name: "Setup steps", exact: true }).click();
  await expect(firstStatus).toHaveValue("blocked");
  await firstStatus.selectOption("completed");
  await page.reload();
  await page.getByRole("tab", { name: "Setup steps", exact: true }).click();
  await expect(firstStatus).toHaveValue("completed");

  const markdown = await request.get("/api/guides/github/export");
  expect(markdown.ok()).toBeTruthy();
  expect(markdown.headers()["content-type"]).toContain("text/markdown");
  expect(await markdown.text()).toMatch(/GitHub/);
  expect(await markdown.text()).toMatch(/https:\/\/docs.github.com/);
  await expect(
    page.getByRole("link", { name: "Export Markdown" }),
  ).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Export Markdown" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/github.*\.md$/i);
  await page.getByRole("button", { name: "Copy guide link" }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /Guide link copied|Copy this guide/ })
      .first(),
  ).toBeVisible();

  const theme = page.getByRole("button", { name: "Toggle theme" });
  const before = await page.locator("html").getAttribute("data-theme");
  await theme.click();
  await expect
    .poll(() => page.locator("html").getAttribute("data-theme"))
    .not.toBe(before);
});

test("unmatched providers have a useful empty state", async ({ page }) => {
  await page.goto("/guides");
  await page
    .getByRole("searchbox", { name: "Search guides" })
    .fill("unlisted-provider-xyz");
  await expect(
    page.getByRole("heading", { name: "No guides found" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Research/i }).last(),
  ).toBeVisible();
});

for (const provider of ["GitHub", "Slack", "Google"]) {
  test(`Explore opens the actual ${provider} guide without claiming setup verification`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: `${provider} integration guide`, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: new RegExp(provider), level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(/^Verified$/i)).toHaveCount(0);
    await expect(page.getByText(/^Setup verified$/i)).toHaveCount(0);
    await page.getByRole("tab", { name: "Sources", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Trace every requirement." }),
    ).toBeVisible();
    expect(
      await page.locator('main a[href^="https://"]').count(),
    ).toBeGreaterThan(0);
  });
}

test("Explore validates input and Enter prefills research without spending an API request", async ({
  page,
}) => {
  let researchRequests = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/api/research"))
      researchRequests++;
  });
  await page.goto("/");
  const input = page.getByLabel("Which provider are you integrating?", {
    exact: true,
  });
  await page.getByRole("button", { name: "Research", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await input.fill("Notion");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/research\?q=Notion/);
  await expect(
    page.getByLabel("Which provider are you integrating?", { exact: true }),
  ).toHaveValue("Notion");
  await expect(
    page.getByRole("button", { name: "Research provider", exact: true }),
  ).toBeEnabled();
  expect(researchRequests).toBe(0);
});

test("save, reopen, and unsave a guide across navigation and reload", async ({
  page,
}) => {
  await page.goto("/guides");
  await page.getByRole("searchbox", { name: "Search guides" }).fill("GitHub");
  await page
    .getByRole("button", { name: "Share GitHub guide", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /GitHub guide link copied|copy its browser address/i })
      .first(),
  ).toBeVisible();
  const save = page.getByRole("button", {
    name: "Save GitHub guide",
    exact: true,
  });
  await expect(save).toHaveAttribute("aria-pressed", "false");
  await save.click();
  await expect(
    page.getByRole("button", { name: "Unsave GitHub guide", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Saved", exact: true }).click();
  await expect(page).toHaveURL(/\/saved/);
  const guide = page.getByRole("link", { name: /GitHub.*guide/i }).first();
  await expect(guide).toBeVisible();
  await page.reload();
  await expect(guide).toBeVisible();
  await guide.click();
  await expect(
    page.getByRole("button", { name: "Saved guide", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Saved guide", exact: true }).click();
  await page.getByRole("link", { name: "Saved", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No saved guides yet" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /GitHub.*guide/i })).toHaveCount(
    0,
  );
});

test("Recently generated uses the actual researched subset of the stored library", async ({
  page,
  request,
}) => {
  const guides = await (await request.get("/api/guides")).json();
  const researched = guides.filter(
    (guide: { origin: string }) => guide.origin === "researched",
  );
  await page.goto("/guides");
  await page.getByRole("link", { name: /Recently generated/ }).click();
  await expect(page).toHaveURL(/\/guides\?view=recent/);
  await expect(page.locator(".library-guide")).toHaveCount(researched.length);
  for (const guide of researched) {
    await expect(
      page.locator(`a[href="/guides/${guide.id}"]`).first(),
    ).toBeVisible();
  }
  if (!researched.length) {
    await expect(
      page.getByRole("heading", { name: "No guides found" }),
    ).toBeVisible();
  }
});

test("a shared guide opens in a fresh browser with independent checklist progress", async ({
  page,
  browser,
  request,
}) => {
  const guides = await (await request.get("/api/guides")).json();
  const guide =
    guides.find((item: { origin: string }) => item.origin === "researched") ||
    guides.find((item: { id: string }) => item.id === "github");
  await page.goto(`/guides/${guide.id}`);
  await page.getByRole("tab", { name: "Setup steps", exact: true }).click();
  await page
    .getByRole("combobox", { name: /^Status for / })
    .first()
    .selectOption("blocked");
  const publicUrl = page.url();
  const other = await browser.newContext();
  try {
    const reader = await other.newPage();
    await reader.goto(publicUrl);
    await expect(
      reader.getByRole("heading", {
        name: new RegExp(guide.provider),
        level: 1,
      }),
    ).toBeVisible();
    await reader.getByRole("tab", { name: "Setup steps", exact: true }).click();
    await expect(
      reader.getByRole("combobox", { name: /^Status for / }).first(),
    ).toHaveValue("not-started");
    const exported = await other.request.get(
      `${new URL(publicUrl).origin}/api/guides/${guide.id}/export`,
    );
    expect(exported.ok()).toBe(true);
    expect(await exported.text()).toContain(guide.provider);
  } finally {
    await other.close();
  }
});

test("invalid research requests fail with a recoverable validation error", async ({
  request,
}) => {
  const result = await request.post("/api/research", { data: { query: "" } });
  expect(result.status()).toBe(400);
  expect(await result.text()).not.toMatch(/sk-[a-z0-9]/i);
});

test("unconfigured live research explains the missing key and preserves input", async ({
  page,
  request,
}) => {
  const health = await (await request.get("/api/health")).json();
  if (health.apiKeyConfigured) {
    // A configured production preview must not spend a real API request just
    // to verify missing-configuration UI. These failure fixtures are test-only;
    // on an unconfigured test server the real 503 path is exercised instead.
    await page.route("**/api/health", (route) =>
      route.fulfill({
        json: { ...health, apiKeyConfigured: false, researchReady: false },
      }),
    );
    await page.route("**/api/research", (route) =>
      route.fulfill({
        status: 503,
        json: {
          error:
            "Live research needs an OpenAI API key. Add OPENAI_API_KEY to .env.local and restart the app. The existing guides are ready to use.",
          code: "API_KEY_MISSING",
        },
      }),
    );
  }
  await page.goto("/research");
  await expect(
    page.getByText(/Live research needs OPENAI_API_KEY/),
  ).toBeVisible();
  await page.getByLabel("Which provider are you integrating?").fill("Notion");
  await page
    .getByRole("button", { name: "Research provider", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Research needs your attention" }),
  ).toContainText(/OPENAI_API_KEY/);
  await expect(
    page.getByLabel("Which provider are you integrating?"),
  ).toHaveValue("Notion");
  await expect(
    page.getByRole("link", { name: /local setup instructions/ }),
  ).toBeVisible();
});

test("research UI handles rate-limit failure, retry, NDJSON events, and guide navigation", async ({
  page,
}) => {
  // HTTP fixtures are confined to this test. Production always calls the real research API.
  // This covers the stream consumer; SQLite and generation are verified in unit tests.
  await page.route("**/api/health", (route) =>
    route.fulfill({
      json: {
        apiKeyConfigured: true,
        persistenceConfigured: true,
        researchReady: true,
        accessTokenRequired: false,
      },
    }),
  );
  let requests = 0;
  await page.route("**/api/research", async (route) => {
    requests++;
    expect(route.request().postDataJSON()).toEqual({ query: "GitHub" });
    if (requests === 1) {
      await route.fulfill({
        status: 429,
        json: {
          error:
            "The research service is rate limited. Wait a moment and retry.",
          code: "PROVIDER_RATE_LIMIT",
        },
      });
      return;
    }
    const events = [
      { phase: "accepted", message: "Research request accepted." },
      {
        phase: "searching",
        message:
          "The web-search tool is researching official provider documentation.",
      },
      {
        phase: "source-found",
        message: "Creating an OAuth app",
        url: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app",
      },
      {
        phase: "synthesizing",
        message: "Documentation returned. Building a structured guide.",
      },
      {
        phase: "validating",
        message: "Checking citation provenance and evidence labels.",
      },
      { phase: "saving", message: "Saving a persistent guide snapshot." },
      { phase: "complete", message: "Your guide is ready.", guideId: "github" },
    ].map((event) => ({ ...event, timestamp: "2026-11-03T12:00:00.000Z" }));
    await route.fulfill({
      contentType: "application/x-ndjson; charset=utf-8",
      body: events.map((event) => JSON.stringify(event)).join("\n") + "\n",
    });
  });
  await page.goto("/research");
  await page.getByLabel("Which provider are you integrating?").fill("GitHub");
  await page
    .getByRole("button", { name: "Research provider", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Research needs your attention" }),
  ).toContainText(/rate limited/);
  await expect(
    page.getByLabel("Which provider are you integrating?"),
  ).toHaveValue("GitHub");
  await page
    .getByRole("button", { name: "Research provider", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Research journal" }),
  ).toBeVisible();
  await page.getByText("View observed events", { exact: true }).click();
  await expect(page.getByTestId("research-events").locator("li")).toHaveCount(
    7,
  );
  await expect(
    page.getByRole("link", { name: "Open source: Creating an OAuth app" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Open your guide" }).click();
  await expect(page).toHaveURL(/\/guides\/github/);
  expect(requests).toBe(2);
});

test("an in-flight request can be cancelled without inventing backend progress", async ({
  page,
}) => {
  let release = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/research", async (route) => {
    await pending;
    await route.abort().catch(() => {});
  });
  try {
    await page.goto("/research");
    await page
      .getByLabel("Which provider are you integrating?")
      .fill("Example Provider");
    await page
      .getByRole("button", { name: "Research provider", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Cancel research" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("list", { name: "Research progress" })
        .locator('[data-state="completed"]'),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Cancel research" }).click();
    release();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Research needs your attention" }),
    ).toContainText(/cancelled/i);
    await expect(
      page.getByLabel("Which provider are you integrating?"),
    ).toHaveValue("Example Provider");
  } finally {
    release();
  }
});

test("a truncated research response does not present an unsaved guide as complete", async ({
  page,
}) => {
  await page.route("**/api/research", (route) =>
    route.fulfill({
      contentType: "application/x-ndjson",
      body:
        JSON.stringify({
          phase: "accepted",
          message: "Research request accepted.",
          timestamp: "2026-11-03T12:00:00.000Z",
        }) + "\n",
    }),
  );
  await page.goto("/research");
  await page
    .getByLabel("Which provider are you integrating?")
    .fill("Example Provider");
  await page
    .getByRole("button", { name: "Research provider", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Research needs your attention" }),
  ).toContainText(/connection ended before the guide was saved/i);
  await expect(page.getByRole("link", { name: "Open your guide" })).toHaveCount(
    0,
  );
});

test("mobile navigation remains usable without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  const navigation = page.getByRole("dialog");
  await expect(navigation).toBeVisible();
  const close = navigation.getByRole("button", { name: "Close navigation" });
  const closeBox = await close.boundingBox();
  expect(closeBox?.width).toBeGreaterThanOrEqual(44);
  expect(closeBox?.height).toBeGreaterThanOrEqual(44);
  await close.click();
  await expect(navigation).toHaveCount(0);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await navigation.getByRole("link", { name: "Guides", exact: true }).click();
  await expect(page).toHaveURL(/\/guides$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("searchbox", { name: "Search guides" }),
  ).toBeVisible();
  await page.goto("/");
  await page.getByLabel("Which provider are you integrating?").fill("Notion");
  await page.getByRole("button", { name: "Research", exact: true }).click();
  await expect(
    page.getByLabel("Which provider are you integrating?"),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("guide tabs support keyboard navigation", async ({ page }) => {
  await page.goto("/guides/github");
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Setup steps", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("combobox", { name: /^Status for / }).first(),
  ).toBeVisible();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Sources", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("heading", { name: "Trace every requirement." }),
  ).toBeVisible();
});
