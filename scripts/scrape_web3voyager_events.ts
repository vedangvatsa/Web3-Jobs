import { chromium } from 'playwright';
import * as fs from 'fs';

interface EventInfo {
  title: string;
  slug: string; // relative URL on Web3Voyager
  url: string; // absolute URL on Web3Voyager
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = 'https://web3voyager.com';
  await page.goto(`${base}/events`, { waitUntil: 'networkidle' });

  // Wait for at least one event card to appear
  await page.waitForSelector('article a[href^="/event/"]', { timeout: 15000 }).catch(() => {});

  const events: EventInfo[] = await page.$$eval('article a[href^="/event/"]', (links) => {
    return links.map((link) => {
      const title = link.textContent?.trim() ?? '';
      const slug = link.getAttribute('href') ?? '';
      return {
        title,
        slug,
        url: `${window.location.origin}${slug}`,
      } as any;
    });
  });

  await browser.close();

  const outPath = 'web3voyager_events.json';
  fs.writeFileSync(outPath, JSON.stringify(events, null, 2));
  console.log(`Scraped ${events.length} events, written to ${outPath}`);
})();
