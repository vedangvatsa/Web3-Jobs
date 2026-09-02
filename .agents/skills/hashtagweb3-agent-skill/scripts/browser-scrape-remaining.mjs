import fs from 'fs';
import puppeteer from 'puppeteer';

function parseCSV(text) {
  const rows = []; let cur = []; let field = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"' && text[i+1] === '"') { field += '"'; i++; } else if (ch === '"') inQ = false; else field += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { cur.push(field); field = ''; } else if (ch === '\n' || (ch === '\r' && text[i+1] === '\n')) { cur.push(field); field = ''; if (cur.length >= 14) rows.push(cur); cur = []; if (ch === '\r') i++; } else field += ch; }
  }
  if (cur.length >= 14) rows.push(cur);
  return rows;
}

function isAISummary(desc) {
  if (!desc || desc === '-' || desc.length < 50) return false;
  const hasStructure = /\b(responsibilities|requirements|qualifications|what you|about the role|who you are|key duties|minimum|preferred|must have|nice to have|you will|your role|what we)\b/i.test(desc);
  if (hasStructure && desc.length > 500) return false;
  if (desc.length < 400 && desc.split('\n').filter(l=>l.trim()).length <= 5) return true;
  if (/^(The |As a |This role|In this position)/.test(desc) && desc.length < 500) return true;
  return false;
}

function isNavJunk(text) {
  const signals = ['Cryptocurrencies','Buy and sell','Tips & Tutorials','Cookie','Privacy Policy','Terms of Service','Accept all','Sign in','© 20'];
  let hits = 0;
  for (const s of signals) if (text.includes(s)) hits++;
  if (hits >= 2) return true;
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const shortLines = lines.filter(l => l.trim().length < 25);
  if (lines.length > 10 && shortLines.length / lines.length > 0.7 && text.length < 800) return true;
  return false;
}

async function scrapeWithBrowser(page, url) {
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
  try {
    await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 25000 });
    await new Promise(r => setTimeout(r, 3000)); // extra wait for JS rendering
    
    const desc = await page.evaluate(() => {
      // Priority order of selectors for job descriptions
      const selectors = [
        // Specific JD containers
        '[data-qa="job-description"]',
        '[data-automation-id="jobPostingDescription"]',
        '.job-description',
        '#job-description',
        '[class*="job-description"]',
        '[class*="JobDescription"]',
        '[class*="jobDescription"]',
        '.job-details__description',
        '.posting-page .content',
        // Greenhouse
        '#content .body',
        '#content',
        // Revolut specific
        '[class*="PositionContent"]',
        '[class*="position-content"]',
        '[class*="JobContent"]',
        // Stripe
        '[class*="JobListing"]',
        '[class*="listing-content"]',
        // Generic containers
        'article .content',
        'main article',
        'article',
        '.content-wrapper',
        'main',
      ];
      
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.innerText.trim();
          if (text.length > 200) {
            // Verify it looks like a JD not nav
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            const longLines = lines.filter(l => l.trim().length > 40);
            if (longLines.length >= 3) return text;
          }
        }
      }
      
      // Try JSON-LD
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const s of scripts) {
        try {
          const j = JSON.parse(s.textContent);
          if (j.description && j.description.length > 200) return j.description;
        } catch(e) {}
      }
      
      return '';
    });
    
    return desc;
  } catch(e) {
    return '';
  }
}

async function main() {
  const content = fs.readFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', 'utf8');
  const rows = parseCSV(content);
  const header = rows[0];
  const data = rows.slice(1);
  
  // Find remaining AI summaries
  const toScrape = [];
  for (let i = 0; i < data.length; i++) {
    if (isAISummary((data[i][4]||'').trim())) toScrape.push(i);
  }
  
  // Skip LinkedIn (auth-walled, will never work)
  const scrapeable = toScrape.filter(idx => {
    const url = (data[idx][0]||'').toLowerCase();
    return !url.includes('linkedin.com');
  });
  const skipped = toScrape.length - scrapeable.length;
  
  console.log(`${toScrape.length} AI summaries remaining`);
  console.log(`  Skipping ${skipped} LinkedIn (auth-walled)`);
  console.log(`  Scraping ${scrapeable.length} with headless browser\n`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  
  // Use 5 parallel pages
  const PARALLEL = 5;
  let done = 0, success = 0, failed = 0;
  
  for (let i = 0; i < scrapeable.length; i += PARALLEL) {
    const batch = scrapeable.slice(i, i + PARALLEL);
    const pages = await Promise.all(batch.map(() => browser.newPage()));
    
    await Promise.all(batch.map(async (idx, j) => {
      const page = pages[j];
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      const desc = await scrapeWithBrowser(page, data[idx][0]);
      done++;
      
      if (desc && desc.length > 200 && !isNavJunk(desc)) {
        data[idx][4] = desc.replace(/\n{3,}/g, '\n\n').trim();
        success++;
        console.log(`  ✓ ${data[idx][1]} - ${data[idx][3]} (${desc.length} chars)`);
      } else {
        failed++;
        console.log(`  ✗ ${data[idx][1]} - ${data[idx][3]}`);
      }
      
      await page.close().catch(() => {});
    }));
    
    process.stdout.write(`  [${done}/${scrapeable.length}] ✓${success} ✗${failed}\n`);
  }
  
  await browser.close();
  
  // Write
  const esc = v => { const s = String(v||'-'); if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'; return s; };
  const out = [header.map(h => esc(h)).join(',')];
  for (const row of data) out.push(row.map(v => esc(v)).join(','));
  fs.writeFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', out.join('\n'));
  
  const stillAI = data.filter(r => isAISummary((r[4]||'').trim())).length;
  console.log(`\n✅ Done`);
  console.log(`   Browser scraped: ${success}`);
  console.log(`   Still AI summary: ${stillAI} (expired/unreachable)`);
}

main().catch(e => { console.error(e); process.exit(1); });
