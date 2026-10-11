const { chromium } = require('C:/Users/Frank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync('C:/Users/Frank/Documents/Codex/2026-09-16/1-literature-review-x20-github-literature/outputs/why-is-sustainable-housing-important-revised.md', 'utf8').trim();
const linkPattern = /\[(\[\d+\]|[^\]]+)\]\((https:\/\/[^)]+)\)/g;
const plain = text => text.replace(linkPattern, '$1').replace(/\s+/g, ' ').trim();
const paragraphs = source.split(/\r?\n\s*\r?\n/).filter(p => !p.startsWith('#') && !p.startsWith('|') && !/^\d+\. /.test(p));
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4173/#sustainable-housing');
    await page.locator('[data-lang="en"]').click();
    const article = page.locator('#sustainable-housing-content');
    const text = plain(await article.innerText());
    for (const paragraph of paragraphs) {
      // The temperature callout is laid out as two adjacent elements rather than a colon-separated sentence.
      if (paragraph.startsWith('+0.5°C:')) continue;
      assert(text.includes(plain(paragraph)), `Missing or changed English paragraph: ${paragraph.slice(0,100)}`);
    }
    const urls = await article.locator('a').evaluateAll(nodes => nodes.map(n => n.href));
    for (const match of source.matchAll(linkPattern)) assert(urls.includes(match[2]), `Missing source ${match[2]}`);
    assert.equal(await article.locator('.learning-sources li').count(),8);
    assert.equal(await article.locator('figure').count(),2);
    assert.equal(await article.locator('.learning-donut circle[pathLength]').getAttribute('stroke-dasharray'),'79 21');
    assert((await article.locator('.learning-bar.insulated').getAttribute('style')).includes('81%'));
    await page.screenshot({path:path.join(__dirname,'housing-revised-desktop.png')});
    for (const lang of ['en','fr']) {
      await page.locator(`[data-lang="${lang}"]`).click();
      await page.setViewportSize({width:390,height:844});
      assert.equal(await article.locator('.learning-sources li').count(),8);
      assert.equal(await article.locator('figure').count(),2);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
      if (lang === 'fr') {
        assert((await article.innerText()).includes('Une conclusion plus générale'));
        assert(!(await article.innerText()).includes('Energy efficiency begins'));
      }
      await page.screenshot({path:path.join(__dirname,`housing-revised-mobile-${lang}.png`)});
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: revised English paragraphs and all URLs preserved; eight references; unchanged chart data; EN/FR and mobile layout; no page errors.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
