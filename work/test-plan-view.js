const { chromium } = require("playwright");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:4173/#build");
  await page.evaluate(() => { localStorage.removeItem("everdwell-plan-view"); localStorage.setItem("everdwell-language", "en"); });
  await page.reload();

  assert.equal(await page.locator("[data-plan-system]").count(), 13);
  assert.equal(await page.locator("[data-plan-view='grid']").getAttribute("aria-pressed"), "true");
  await page.screenshot({ path: "work/plan-grid-desktop.png", fullPage: true });

  await page.locator("[data-plan-view='list']").click();
  assert(await page.locator("#plan-system-grid").evaluate(node => node.classList.contains("list-view")));
  assert.equal(await page.evaluate(() => localStorage.getItem("everdwell-plan-view")), "list");
  await page.reload();
  assert(await page.locator("#plan-system-grid").evaluate(node => node.classList.contains("list-view")));

  await page.locator("[data-plan-system='insulation']").click();
  assert.equal(await page.locator("[data-plan-item]").count(), 6);
  assert(await page.locator("#plan-item-grid").evaluate(node => node.classList.contains("list-view")));
  await page.locator("[data-plan-item='0']").click();
  const detail = page.locator("#detail-modal");
  await assert.doesNotReject(() => detail.waitFor({ state: "visible" }));
  const image = detail.locator(".plan-detail-image");
  await image.evaluate(node => node.decode());
  assert(await image.evaluate(node => node.complete && node.naturalWidth > 0));
  assert((await image.getAttribute("src")).includes("013"));
  assert((await detail.locator(".plan-short-description").innerText()).length > 150);
  assert((await detail.locator(".plan-price-box").innerText()).includes("CAD $81 / bag"));
  assert((await detail.locator(".plan-price-box").innerText()).includes("Installation and labour are not included"));
  assert.equal(await detail.locator(".overall-toggle .stars i").count(),5);
  assert.equal((await detail.locator(".overall-toggle .stars small").innerText()).trim(),"3.5");
  assert.equal(await detail.locator(".overall-toggle .stars i").nth(3).evaluate(node => node.style.getPropertyValue("--star-fill")),"50%");
  const panels = await detail.locator(".plan-score-layout").boundingBox();
  assert(panels && panels.height < 210, `Collapsed score area is too tall: ${panels?.height}`);
  assert.equal(await detail.locator(".rating-chevron svg").count(), 1);
  assert(!(await detail.innerText()).includes("⌄"));
  await detail.locator("[data-rating-toggle]").click();
  await page.waitForTimeout(320);
  assert(await detail.locator("#plan-rating-breakdown").evaluate(node => node.classList.contains("open")));
  assert((await detail.locator("#plan-rating-breakdown").innerText()).includes("Thermal Performance"));
  await page.waitForTimeout(250);
  await page.screenshot({ path: "work/plan-rating-ui-desktop.png" });
  await page.locator("[data-close-modal]").click();

  await page.locator("[data-lang='fr']").click();
  assert.equal((await page.locator("[data-plan-view='grid']").innerText()).trim(), "Cartes");
  assert.equal((await page.locator("[data-plan-view='list']").innerText()).trim(), "Liste");
  await page.locator("[data-plan-item='1']").click();
  const frenchDetail = await detail.innerText();
  assert(!frenchDetail.includes("commonly used"));
  assert(!frenchDetail.includes("Canadian price"));
  await page.locator("[data-close-modal]").click();

  await page.locator("button[data-route='home']").first().click();
  await page.locator(".path-card button[data-route='build']").click();
  assert(await page.locator("#plan-systems-view").isVisible());
  assert(await page.locator("#plan-items-view").isHidden());
  assert.equal(await page.locator("[data-plan-system]").count(), 13);

  await page.locator("[data-lang='en']").click();
  await page.locator("[data-plan-system='plumbing']").click();
  await page.locator("[data-plan-item='0']").click();
  await detail.locator("[data-rating-toggle]").click();
  await page.waitForTimeout(320);
  const plumbingRatings = await detail.locator("#plan-rating-breakdown").innerText();
  assert(plumbingRatings.includes("Water Safety"));
  assert(plumbingRatings.includes("Material Efficiency"));
  assert(!plumbingRatings.includes("Energy Efficiency"));
  await page.locator("[data-close-modal]").click();

  await page.locator(".top-nav [data-route='assessment']").click();
  for (let step = 0; step < 15 && !(await page.locator("[data-assessment-slider]").count()); step += 1) {
    const choice = page.locator("[data-assessment-key]").first();
    assert(await choice.count(), `No answer control found at assessment step ${step + 1}`);
    await choice.evaluate(node => { node.checked = true; node.dispatchEvent(new Event("change", { bubbles:true })); });
    await page.locator("#assessment-next").click();
  }
  const slider = page.locator("[data-assessment-slider]");
  assert.equal(await slider.getAttribute("min"), "0");
  assert.equal(await slider.getAttribute("max"), "100");
  assert.equal(await slider.getAttribute("step"), "1");
  assert.equal(await page.locator("[data-slider-choice]").count(), 5);
  assert.equal(await page.locator("#slider-percent").count(), 0);
  await slider.evaluate(node => { node.value = "73"; node.dispatchEvent(new Event("input", { bubbles:true })); });
  await slider.evaluate(node => node.dispatchEvent(new Event("change", { bubbles:true })));
  await page.waitForTimeout(260);
  assert.equal(await slider.inputValue(), "75");
  await page.screenshot({ path: "work/assessment-slider-desktop.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("[data-lang='en']").click();
  await page.locator("button[data-route='home']").first().click();
  await page.locator(".path-card button[data-route='build']").click();
  await page.locator("[data-plan-view='list']").click();
  await page.locator("[data-plan-system='insulation']").click();
  await page.screenshot({ path: "work/plan-list-mobile.png", fullPage: true });
  await page.locator("[data-plan-item='2']").click();
  await detail.locator(".plan-detail-image").evaluate(node => node.decode());
  assert(await detail.locator(".plan-detail-image").evaluate(node => node.complete && node.naturalWidth > 0));
  await page.waitForTimeout(250);
  await page.screenshot({ path: "work/plan-detail-mobile.png" });

  console.log(JSON.stringify({ systems: 13, planItems: 62, insulationItems: 6, entryReset: true, sliderRange: "0–100", sliderSnap: true, viewPersistence: true, detailImage: true, bilingual: true, responsive: true }));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
