const { chromium } = require('C:/Users/Frank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'carbon-article.js'), 'utf8'), context);
const copy = JSON.parse(vm.runInContext('JSON.stringify(carbonArticleCopy)', context));
const sources = JSON.parse(vm.runInContext('JSON.stringify(carbonArticleSources)', context));
const original = fs.readFileSync('C:/Users/Frank/Documents/Codex/2026-09-16/1-literature-review-x20-github-literature/outputs/why-buildings-and-construction-produce-so-much-co2.md','utf8').trim();
const reconstructed = '# ' + copy.en.title + '\n\n' + copy.en.introduction.trim() + '\n\n' + copy.en.sections.map(s => '## ' + s.title + '\n\n' + s.paragraphs.join('\n\n')).join('\n\n');
assert.equal(reconstructed.replace(/\r/g,''), original.split('## References')[0].trim().replace(/\r/g,''), 'English body must match the supplied article exactly');
assert.equal(sources.length,12);
const originalURLs = [...original.matchAll(/\[[^\]]+\]\((https:\/\/[^)]+)\)/g)].map(m=>m[1]);
assert(originalURLs.every(url=>sources.some(s=>s.url===url)));
(async () => {
  const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const errors=[];
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4173/#home');
    await page.locator('[data-lang="en"]').click();
    await page.locator('.home-impact [data-route="carbon-article"]').click();
    await page.waitForSelector('#carbon-article-content:visible');
    assert.equal(await page.locator('#carbon-article-title').innerText(),copy.en.title);
    assert.equal(await page.locator('#carbon-article-content .learning-sources li').count(),12);
    assert.equal(await page.locator('#carbon-article-content figure').count(),3);
    await page.locator('.carbon-article-photo img').evaluate(img=>img.decode());
    assert.equal(await page.locator('#carbon-article-content .article-placeholder').count(),0);
    const typography=await page.evaluate(()=>['#carbon-article-title','#sustainable-housing-title'].map(s=>{const c=getComputedStyle(document.querySelector(s));return[c.fontFamily,c.fontSize,c.fontWeight]}));
    assert.deepEqual(typography[0],typography[1]);
    await page.screenshot({path:path.join(__dirname,'carbon-article-desktop.png'),fullPage:true});
    await page.locator('[data-lang="fr"]').click();
    assert.equal(await page.locator('#carbon-article-title').innerText(),copy.fr.title);
    assert(!(await page.locator('#carbon-article-content').innerText()).includes('Two carbon stories'));
    for (const lang of ['en','fr']) {
      await page.locator(`[data-lang="${lang}"]`).click();
      await page.setViewportSize({width:390,height:844});
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      assert(overflow<=1,`${lang}: mobile overflow ${overflow}`);
      await page.screenshot({path:path.join(__dirname,`carbon-article-mobile-${lang}.png`),fullPage:true});
    }
    await page.locator('#carbon-article-content [data-route="home"]').click();
    await page.locator('.home-learning [data-route="carbon-article"]').click();
    assert(await page.locator('#carbon-article-content').isVisible());
    assert.deepEqual(errors,[]);
    console.log('PASS: exact English copy, 12 sources, both home links, EN/FR, shared typography, local photo, and mobile overflow.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
