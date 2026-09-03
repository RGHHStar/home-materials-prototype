const { chromium } = require("playwright");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ headless:true, executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const page = await browser.newPage({ viewport:{width:1440,height:1000}, deviceScaleFactor:1 });
  await page.goto("http://127.0.0.1:4173/#house");
  await page.evaluate(() => localStorage.setItem("everdwell-language","en"));
  await page.reload();

  assert.equal(await page.locator("[data-builder-system]").count(),13);
  assert.equal(await page.locator("[data-builder-material]").count(),6);
  assert.equal((await page.locator("#builder-configured-count").innerText()).trim(),"0 / 13");
  assert.equal((await page.locator("#builder-overall-score").innerText()).trim(),"—");
  assert((await page.locator("[data-builder-material='0']").innerText()).includes("CAD $285 / yd³"));
  assert((await page.locator("[data-builder-material='0'] img").getAttribute("src")).includes("001"));
  await page.locator("#builder-system-image").evaluate(node => node.decode());
  assert(await page.locator("#builder-system-image").evaluate(node => node.complete && node.naturalWidth > 0));

  await page.locator("[data-builder-material='0']").click();
  assert.equal((await page.locator("#builder-configured-count").innerText()).trim(),"1 / 13");
  assert.equal((await page.locator("#builder-overall-score").innerText()).trim(),"55");
  assert((await page.locator("#builder-environment-impact").innerText()).includes("75"));
  assert((await page.locator("#builder-health-concern").innerText()).includes("25"));
  assert.notEqual((await page.locator("#builder-estimate-total").innerText()).trim(),"—");
  assert((await page.locator("#builder-estimate-total").innerText()).includes("14,250"));

  await page.locator("[data-builder-system='exterior']").click();
  assert.equal(await page.locator("[data-builder-material]").count(),6);
  await page.locator("[data-builder-material='2']").click();
  assert.equal((await page.locator("#builder-configured-count").innerText()).trim(),"2 / 13");
  assert.notEqual(await page.locator("[data-builder-system='exterior']").evaluate(node => getComputedStyle(node).color),"rgb(255, 255, 255)");
  assert(Number.parseFloat(await page.locator("[data-view='house'] .page-heading h1").evaluate(node => getComputedStyle(node).fontSize)) >= 56);
  await page.screenshot({path:"work/builder-desktop.png",fullPage:true});

  for (const system of ["insulation","roofing","windows","flooring","paint","adhesives","sealants","waterproofing","plumbing","lighting","solar"]) {
    await page.locator(`[data-builder-system='${system}']`).click();
    await page.locator("[data-builder-material='0']").click();
  }
  assert.equal((await page.locator("#builder-configured-count").innerText()).trim(),"13 / 13");
  assert.equal(await page.locator("[data-builder-open-bill]").isEnabled(),true);
  await page.locator("[data-builder-open-bill]").click();
  const modal = page.locator("#detail-modal");
  await modal.waitFor({state:"visible"});
  assert.equal(await modal.locator("table").count(),0);
  assert.equal(await modal.locator(".summary-rating-card").count(),4);
  assert((await modal.innerText()).includes("Your sustainable home summary"));
  assert((await modal.innerText()).includes("Recommended improvements"));
  assert((await modal.innerText()).includes("Overall reference price"));
  assert(!(await modal.innerText()).includes("Selection subtotal"));
  assert(!(await modal.innerText()).includes("Planning contingency"));
  assert.equal(await modal.locator(".summary-total-price > strong").count(),1);
  await page.waitForTimeout(250);
  await page.screenshot({path:"work/builder-bill-desktop.png"});
  await modal.locator("[data-close-modal]").click();

  await page.locator("[data-lang='fr']").click();
  assert((await page.locator("#builder-current-system").innerText()).includes("Énergie"));
  await page.locator("[data-builder-open-bill]").click();
  assert((await modal.innerText()).includes("Bilan de votre maison durable"));
  assert(!(await modal.innerText()).includes("Overall reference price"));
  await modal.locator("[data-close-modal]").click();

  await page.setViewportSize({width:390,height:844});
  await page.locator("[data-lang='en']").click();
  await page.screenshot({path:"work/builder-mobile.png",fullPage:true});
  const layoutColumns = await page.locator(".design-builder-shell").evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ").length);
  assert.equal(layoutColumns,1);

  console.log(JSON.stringify({systems:13,liveScoring:true,environmentalImpact:true,healthConcern:true,linkedPlanData:true,billSummary:true,bilingual:true,responsive:true}));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
