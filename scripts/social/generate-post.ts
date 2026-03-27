/**
 * Social Media Image Generator — HashtagWeb3
 * Puppeteer → 1080x1080 PNG (Instagram square, 2x retina)
 *
 * Content types:
 *   jobs    — Live positions count with top companies
 *   data    — Bar chart: who is hiring, ranked
 *   insight — Data-backed industry analysis
 *   trend   — Ecosystem update / market intelligence
 *   meme    — Smart Web3/crypto culture humor
 *
 * Themes: light, blue (no dark)
 *
 * Usage:
 *   npx tsx scripts/social/generate-post.ts --type jobs
 *   npx tsx scripts/social/generate-post.ts --type data
 *   npx tsx scripts/social/generate-post.ts --type insight --headline "..." --body "..."
 *   npx tsx scripts/social/generate-post.ts --type trend --headline "..." --body "..."
 *   npx tsx scripts/social/generate-post.ts --type meme --headline "..." --body "..."
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const TEMPLATE = path.join(__dirname, 'templates/post.html');
const LOGO = path.join(ROOT, 'public/logo/HashtagWeb3.png');
const OUTPUT_DIR = path.join(ROOT, 'scripts/social/output');
const CACHE = path.join(ROOT, 'content/jobs-cache.json');

// Parse args
const args = process.argv.slice(2);
const getArg = (name: string) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : '';
};

const postType = getArg('type') || 'jobs';
const customHeadline = getArg('headline');
const customBody = getArg('body');

function getJobStats() {
  try {
    const jobs = JSON.parse(fs.readFileSync(CACHE, 'utf-8'));
    const co: Record<string, number> = {};
    jobs.forEach((j: any) => { co[j.company] = (co[j.company] || 0) + 1; });
    const sorted = Object.entries(co).sort((a, b) => (b[1] as number) - (a[1] as number));
    return { total: jobs.length, companies: sorted.slice(0, 8), uniqueCompanies: Object.keys(co).length };
  } catch {
    return { total: 668, companies: [['Binance', 326], ['Coinbase', 81], ['Robinhood', 59], ['Ripple', 44], ['StreamingFast', 16], ['Fireblocks', 14], ['Offchain Labs', 12], ['BitGo', 10]], uniqueCompanies: 55 };
  }
}

function getTheme(type: string): string {
  switch (type) {
    case 'insight': return 'blue';
    case 'meme': return 'blue';
    default: return 'light';
  }
}

function generateContent(type: string): string {
  const stats = getJobStats();

  switch (type) {
    case 'jobs': {
      const chips = stats.companies.slice(0, 8).map(c =>
        `<div class="company-chip">${c[0]}</div>`
      ).join('');
      return `
        <div class="tag tag-filled">Live Jobs</div>
        <div class="jobs-number">${stats.total}<span>+</span></div>
        <div class="jobs-subtitle">Open Web3 Positions</div>
        <div class="jobs-label">Now Hiring</div>
        <div class="jobs-companies">${chips}</div>
      `;
    }

    case 'data': {
      const max = stats.companies[0][1] as number;
      const bars = stats.companies.slice(0, 6).map(([name, count], i) => {
        const pct = Math.round(((count as number) / max) * 100);
        return `
          <div class="bar-row">
            <div class="bar-rank">${i + 1}</div>
            <div class="bar-info">
              <div class="bar-company">${name}</div>
              <div class="bar-count">${count} positions</div>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width: ${pct}%"></div></div>
          </div>
        `;
      }).join('');
      return `
        <div class="tag tag-outline">Hiring Data</div>
        <div class="headline">Who's Hiring<br>in Web3?</div>
        ${bars}
        <div class="data-total"><strong>${stats.total}+</strong> total positions across <strong>${stats.uniqueCompanies}</strong> companies</div>
      `;
    }

    case 'insight': {
      const headline = customHeadline || `${stats.companies[0][0]} alone has ${stats.companies[0][1]} open roles right now`;
      const body = customBody || `That is more than most Web3 companies have employees. The gap between who is hiring and who is not tells you everything about where this industry is headed.`;
      return `
        <div class="tag tag-outline">Industry Analysis</div>
        <div class="headline">${headline}</div>
        <div class="accent-line"></div>
        <div class="callout-box">${body}</div>
        <div class="data-total" style="margin-top: 24px">Source: hashtagweb3.com / ${stats.total}+ live positions</div>
      `;
    }

    case 'trend': {
      const headline = customHeadline || `Web3 hiring is not slowing down. ${stats.total}+ positions are live today.`;
      const body = customBody || `${stats.uniqueCompanies} companies are actively recruiting. The narrative says crypto winter. The data says otherwise.`;
      return `
        <div class="tag tag-filled">Market Signal</div>
        <div class="headline">${headline}</div>
        <div class="accent-line"></div>
        <div class="callout-box">${body}</div>
        <div class="hashtags">
          <div class="hashtag">#Web3Careers</div>
          <div class="hashtag">#HiringData</div>
        </div>
      `;
    }

    case 'meme': {
      const headline = customHeadline || "Recruiter: Do you have 5 years of Solidity experience?";
      const body = customBody || "Solidity was released in 2015. But sure, let me also add my 10 years of Swift experience from 2012.";
      return `
        <div class="tag tag-outline">Web3 Reality</div>
        <div class="headline">${headline}</div>
        <div class="accent-line"></div>
        <div class="callout-box">${body}</div>
      `;
    }

    default:
      return `<div class="headline">Hashtag Web3</div>`;
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const logoBase64 = fs.readFileSync(LOGO).toString('base64');
  const logoDataUri = `data:image/png;base64,${logoBase64}`;

  let html = fs.readFileSync(TEMPLATE, 'utf-8');
  const content = generateContent(postType);
  const theme = getTheme(postType);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

  html = html.replace('src=""', `src="${logoDataUri}"`);
  html = html.replace('data-theme="light"', `data-theme="${theme}"`);

  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Inject dynamic content
  await page.evaluate((contentHtml) => {
    document.getElementById('content')!.innerHTML = contentHtml;
  }, content);




  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 500));

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${postType}_${timestamp}.png`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  await page.screenshot({
    path: outputPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1080, height: 1080 },
  });

  await browser.close();

  console.log(`Generated: ${outputPath}`);
  console.log(`   Type: ${postType}`);
  console.log(`   Size: 1080x1080 (2x retina = 2160x2160)`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
