const { chromium } = require("playwright");
const assert = require("node:assert/strict");

(async () => {
  const errors = [];
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  page.on("pageerror", error => errors.push(error.message));

  await page.goto("http://127.0.0.1:4173/#home");
  await page.evaluate(() => localStorage.setItem("everdwell-language", "en"));
  await page.reload();

  assert.equal((await page.locator("#home-impact-title").innerText()).trim(), "Buildings and construction account for about 37% of global CO₂ emissions.");
  assert.equal((await page.locator("#home-assessment-title").innerText()).trim(), "How sustainable is your home?");
  assert((await page.locator("[data-i18n='homeManifestoLineOne']").innerText()).includes("Every home leaves a footprint."));
  assert((await page.locator("[data-i18n='homeManifestoLineTwo']").innerText()).includes("determine how large"));

  for (const selector of [".home-impact", ".home-assessment-feature"]) {
    const box = await page.locator(selector).boundingBox();
    assert(box && box.width / box.height > 2, `${selector} should use a landscape cinematic ratio`);
    const imageReady = await page.locator(`${selector} > img`).evaluate(async image => {
      await image.decode();
      return image.complete && image.naturalWidth > 0;
    });
    assert(imageReady, `${selector} image should load`);
  }

  assert.equal(await page.locator(".home-tool-grid > article").count(), 2);
  assert((await page.locator(".home-tool-grid").innerText()).includes("I’m planning to build"));
  assert((await page.locator(".home-tool-grid").innerText()).includes("Build your own sustainable home"));
  assert.equal(await page.locator(".home-article-row").count(), 3);
  await page.waitForTimeout(350);
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(desktopOverflow <= 1, `Desktop page has ${desktopOverflow}px horizontal overflow`);
  await page.screenshot({ path: "work/homepage-editorial-desktop.png", fullPage: true });

  await page.locator(".home-impact [data-route='carbon-article']").click();
  assert.equal(page.url().split("#")[1], "carbon-article");
  assert(await page.locator(".article-placeholder").isVisible());
  await page.goBack();
  await page.waitForSelector(".home-editorial.active");
  assert.equal(page.url().split("#")[1], "home");

  await page.locator(".home-tool-grid [data-route='build']").click();
  assert.equal(page.url().split("#")[1], "build");
  await page.locator("[data-plan-system='insulation']").click();
  assert.equal(page.url().split("#")[1], "build/insulation");
  assert(await page.locator("#plan-items-view").isVisible());
  await page.goBack();
  assert.equal(page.url().split("#")[1], "build");
  assert(await page.locator("#plan-systems-view").isVisible());

  await page.goto("http://127.0.0.1:4173/#home");
  await page.locator("[data-lang='fr']").click();
  assert((await page.locator("#home-impact-title").innerText()).startsWith("Les bâtiments"));
  assert(!(await page.locator(".home-editorial").innerText()).includes("How sustainable is your home?"));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto("http://127.0.0.1:4173/#home");
  await mobile.evaluate(() => localStorage.setItem("everdwell-language", "en"));
  await mobile.reload();
  await mobile.screenshot({ path: "work/homepage-editorial-mobile.png", fullPage: true });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `Mobile page has ${overflow}px horizontal overflow`);

  assert.deepEqual(errors, []);
  await browser.close();
  console.log("Homepage redesign checks passed.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
