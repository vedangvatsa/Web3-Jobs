const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = 'https://web3voyager.com';
  await page.goto(`${base}/events`, { waitUntil: 'networkidle' });

  // Wait for event links to appear
  await page.waitForSelector('article a[href^="/event/"]', { timeout: 15000 }).catch(() => {});

  const events = await page.$$eval('article a[href^="/event/"]', (links) => {
    return links.map((link) => {
      const title = link.textContent?.trim() || '';
      const slug = link.getAttribute('href') || '';
      return {
        title,
        slug,
        url: `${window.location.origin}${slug}`,
      };
    });
  });

  await browser.close();

  const outPath = 'web3voyager_events.json';
  fs.writeFileSync(outPath, JSON.stringify(events, null, 2));
  console.log(`Scraped ${events.length} events, written to ${outPath}`);
})();
