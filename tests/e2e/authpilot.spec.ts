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

test("library category grouping filters real guides and clears cleanly", async ({
  page,
}) => {
  await page.goto("/guides");
  const filters = page.getByRole("complementary", { name: "Guide filters" });
  await filters.getByRole("button", { name: /^Productivity\b/ }).click();
  await expect(
    page.getByRole("link", { name: "Google integration guide", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHub integration guide", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Search guides" }).fill("GitHub");
  await expect(
    page.getByRole("heading", { name: "No guides found" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "GitHub integration guide", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search guides" }),
  ).toHaveValue("");
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
    expect(route.request().postDataJSON()).toEqual({
      query: "GitHub",
      launchPath: {
        audience: "internal",
        intendedApis: "Read issues",
        scopes: "read:user",
        accountPermissions: "member",
        marketplaceListing: false,
      },
    });
    if (requests === 1) {
      await route.fulfill({
        status: 429,
        json: {
          error:
            "The research service is rate limited. Wait a moment and retry.",
          code: "PROVIDER_RATE_LIMIT",
          requestId: "AP-test-http-error",
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
        phase: "source-found",
        message: "Creating an OAuth app (campaign link)",
        url: "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app?utm_source=test",
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
    ].map((event) => ({
      ...event,
      requestId: "AP-test-stream-ok",
      timestamp: "2026-11-03T12:00:00.000Z",
    }));
    await route.fulfill({
      contentType: "application/x-ndjson; charset=utf-8",
      body: events.map((event) => JSON.stringify(event)).join("\n") + "\n",
    });
  });
  await page.goto("/research");
  await page.getByLabel("Which provider are you integrating?").fill("GitHub");
  await page
    .getByRole("combobox", { name: "App audience", exact: true })
    .selectOption("internal");
  await page
    .getByRole("combobox", { name: "Your account permissions", exact: true })
    .selectOption("member");
  await page.getByLabel("Intended APIs", { exact: false }).fill("Read issues");
  await page
    .getByLabel("Scopes to investigate", { exact: false })
    .fill("read:user");
  await page
    .getByRole("button", { name: "Research provider", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Research needs your attention" }),
  ).toContainText(/rate limited/);
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Research needs your attention" }),
  ).toContainText("AP-test-http-error");
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
    8,
  );
  await expect(
    page.getByRole("link", { name: "Open source: Creating an OAuth app" }),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Discovered documentation" }).locator("li"),
  ).toHaveCount(1);
  await page.getByRole("link", { name: "Open your guide" }).click();
  await expect(page).toHaveURL(/\/guides\/github/);
  await page.locator("summary").filter({ hasText: "Your launch path" }).click();
  await expect(
    page.getByRole("combobox", { name: "App audience", exact: true }),
  ).toHaveValue("internal");
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

test("evidence inspection exposes legacy limits and restores keyboard focus", async ({
  page,
}) => {
  await page.goto("/guides/github");
  // The retained curated snapshot has source summaries, not checked per-claim
  // passages. The inspector must preserve that distinction instead of turning
  // the old summaries into newly verified quotations.
  const trigger = page
    .getByRole("button", { name: "Why this requirement?", exact: true })
    .nth(1);
  await trigger.focus();
  await page.keyboard.press("Enter");
  const inspector = page.getByRole("dialog", { name: "Why this requirement?" });
  await expect(inspector).toBeVisible();
  await expect(
    inspector.getByRole("heading", { name: "Exact claim", exact: true }),
  ).toBeVisible();
  await expect(
    inspector.getByRole("heading", {
      name: "Applicable conditions",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    inspector.getByRole("heading", {
      name: "Verification status",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    inspector.getByText(
      "No checked source passage was captured for this snapshot.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    inspector.getByText(/Guide summary.*not a quotation/).first(),
  ).toBeVisible();
  await expect(inspector.locator("blockquote")).toHaveCount(0);
  await expect(
    inspector.locator('a[href^="https://docs.github.com/"]').first(),
  ).toBeVisible();
  await expect(inspector.locator("time").first()).toHaveAttribute(
    "datetime",
    /2026-11-03T/,
  );
  await page.keyboard.press("Escape");
  await expect(inspector).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("a blocked prerequisite is resolved before another task becomes actionable", async ({
  page,
}) => {
  await page.goto("/guides/github");
  const firstStatus = page
    .getByRole("combobox", { name: /^Status for / })
    .first();
  const firstStepTitle = (await firstStatus.getAttribute(
    "aria-label",
  ))!.replace(/^Status for /, "");
  await firstStatus.selectOption("blocked");
  const nextStep = page.getByRole("complementary", { name: "Your next step" });
  await expect(
    nextStep.getByRole("heading", { name: "Resolve a blocker", exact: true }),
  ).toBeVisible();
  await expect(
    nextStep.getByRole("heading", { name: firstStepTitle, exact: true }),
  ).toBeVisible();
  await expect(
    nextStep.getByRole("heading", { name: "Your next step", exact: true }),
  ).toHaveCount(0);
  await expect(nextStep).toContainText(/blocked/i);
  await page.reload();
  await expect(firstStatus).toHaveValue("blocked");
  await expect(
    nextStep.getByRole("heading", { name: "Resolve a blocker", exact: true }),
  ).toBeVisible();
  await expect(
    nextStep.getByRole("heading", { name: "Recovery", exact: true }),
  ).toBeVisible();
  await expect(nextStep).toContainText(
    "Ask the product owner which resources and users must be supported.",
  );
  await expect(nextStep).toContainText("Responsible: Integration developer");
  await expect(
    nextStep.getByRole("link", { name: "Open step documentation" }),
  ).toHaveAttribute("href", /^https:\/\/docs\.github\.com\//);
  await nextStep
    .getByRole("button", { name: "Read recovery guidance", exact: true })
    .click();
  await expect(
    page.getByRole("tab", { name: "Setup steps", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#section-prerequisites")).toBeVisible();
  await firstStatus.selectOption("in-progress");
  await page.getByRole("tab", { name: "Overview", exact: true }).click();
  await expect(
    nextStep.getByRole("heading", { name: "Your next step", exact: true }),
  ).toBeVisible();
  await expect(
    nextStep.getByRole("heading", { name: firstStepTitle, exact: true }),
  ).toBeVisible();
});

test("the evidence inspector fits a mobile viewport and has a usable close control", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/guides/github");
  await page
    .getByRole("button", { name: "Why this requirement?", exact: true })
    .first()
    .click();
  const inspector = page.getByRole("dialog", { name: "Why this requirement?" });
  await expect(inspector).toBeVisible();
  const box = await inspector.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  const close = inspector.getByRole("button", {
    name: "Close evidence inspector",
  });
  const closeBox = await close.boundingBox();
  expect(closeBox!.width).toBeGreaterThanOrEqual(44);
  expect(closeBox!.height).toBeGreaterThanOrEqual(44);
  await close.click();
  await expect(inspector).toHaveCount(0);
});
