import fs from 'fs';
import readline from 'readline';

const CONCURRENCY = 50;
const TIMEOUT = 12000;

function parseLine(line) {
  const fields = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) { if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; } else if (ch === '"') inQ = false; else cur += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { fields.push(cur); cur = ''; } else cur += ch; }
  }
  fields.push(cur); return fields;
}

function cleanHtml(html) {
  let t = html;
  t = t.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  t = t.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  t = t.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<\/p>/gi, '\n\n');
  t = t.replace(/<\/li>/gi, '\n');
  t = t.replace(/<li[^>]*>/gi, '• ');
  t = t.replace(/<\/h[1-6]>/gi, '\n\n');
  t = t.replace(/<[^>]+>/g, ' ');
  t = t.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/&#x27;/g,"'").replace(/&#x2F;/g,'/');
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return t;
}

// ─── ATS-specific fetchers ───

// Greenhouse: boards-api.greenhouse.io/v1/boards/{board}/jobs/{id}
async function fetchGreenhouse(url) {
  // URL patterns:
  // boards.greenhouse.io/company/jobs/123
  // job-boards.greenhouse.io/company/jobs/123
  // job-boards.eu.greenhouse.io/company/jobs/123
  // company.com/jobs?gh_jid=123 (redirect)
  const m = url.match(/greenhouse\.io\/([^\/]+)\/jobs\/(\d+)/i);
  if (!m) return null;
  const [, board, jobId] = m;
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}?content=true`, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.content) return cleanHtml(data.content);
  } catch(e) {}
  return null;
}

// Ashby: API endpoint
async function fetchAshby(url) {
  // jobs.ashbyhq.com/org/jobid
  const m = url.match(/jobs\.ashbyhq\.com\/([^\/]+)\/([a-f0-9-]+)/i);
  if (!m) return null;
  try {
    const res = await fetch('https://api.ashbyhq.com/posting-api/job-posting/' + m[2], {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.descriptionHtml) return cleanHtml(data.descriptionHtml);
    if (data.description) return data.description;
  } catch(e) {}
  return null;
}

// Lever: jobs.lever.co/company/jobid — server-rendered, parse HTML
async function fetchLever(url) {
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
  try {
    const res = await fetch(fullUrl, { signal: AbortSignal.timeout(TIMEOUT), headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const html = await res.text();
    // Lever puts JD in <div class="section page-centered" data-qa="job-description">
    const descMatch = html.match(/<div[^>]*data-qa="job-description"[^>]*>([\s\S]*?)<\/div>/i);
    if (descMatch) {
      const cleaned = cleanHtml(descMatch[1]);
      if (cleaned.length > 50) return cleaned;
    }
    // Fallback: all .section.page-centered content
    const sections = [];
    const sectionRe = /<div[^>]*class="[^"]*section page-centered[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    let sm;
    while ((sm = sectionRe.exec(html)) !== null) sections.push(cleanHtml(sm[1]));
    if (sections.join('\n\n').length > 100) return sections.join('\n\n');
  } catch(e) {}
  return null;
}

// Getro (coinbase.getro.com, jobs.solana.com, etc.) — JS-rendered SPA
// Use their API: GET /api/v1/companies/{company_slug}/jobs/{job_id}
async function fetchGetro(url) {
  // coinbase.getro.com/companies/tactic-2/jobs/76575265-strategic-accounts-manager
  // jobs.solana.com/companies/company/jobs/id
  // jobs.multicoin.capital/companies/company/jobs/id
  const m = url.match(/([^\/]+\.(?:getro\.com|solana\.com|multicoin\.capital|dragonfly\.xyz|arbitrum\.io|avax\.network|paradigm\.xyz|spartangroup\.io))\/companies\/([^\/]+)\/jobs\/([^#\/?]+)/i);
  if (!m) return null;
  const [, host, , jobSlug] = m;
  // Getro embeds job data in script tags — try fetching the page and looking for JSON
  try {
    const fullUrl = `https://${host}/companies/${m[2]}/jobs/${jobSlug}`;
    const res = await fetch(fullUrl, { signal: AbortSignal.timeout(TIMEOUT), headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const html = await res.text();
    // Look for __NEXT_DATA__ or job data in script tags
    const nextData = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (nextData) {
      try {
        const nd = JSON.parse(nextData[1]);
        const job = nd?.props?.pageProps?.job || nd?.props?.pageProps?.jobPosting;
        if (job?.description) return cleanHtml(job.description);
        if (job?.content) return cleanHtml(job.content);
        // Deep search for description field
        const descStr = JSON.stringify(nd).match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (descStr && descStr[1].length > 100) return cleanHtml(JSON.parse('"' + descStr[1] + '"'));
      } catch(e) {}
    }
    // Try Getro API pattern
    const apiUrl = `https://${host}/api/v1/jobs/${jobSlug}`;
    try {
      const apiRes = await fetch(apiUrl, { signal: AbortSignal.timeout(TIMEOUT) });
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.description) return cleanHtml(data.description);
      }
    } catch(e) {}
  } catch(e) {}
  return null;
}

// Workday (circle.wd1.myworkdayjobs.com) — hard to scrape, skip
// LinkedIn — requires auth, skip

// Generic fallback: fetch HTML and try to find JD content
async function fetchGeneric(url) {
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
  try {
    const res = await fetch(fullUrl, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const html = await res.text();
    
    // Try specific selectors in order of specificity
    const selectors = [
      /<div[^>]*class="[^"]*job[-_]?description[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div|<\/section|<\/main|$)/i,
      /<div[^>]*class="[^"]*posting[-_]?description[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class|<\/section|<\/main)/i,
      /<div[^>]*class="[^"]*content[-_]?body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="job[-_]?description"[^>]*>([\s\S]*?)<\/div>/i,
      /<article[^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/article>/i,
    ];
    
    for (const re of selectors) {
      const match = html.match(re);
      if (match && match[1]) {
        const cleaned = cleanHtml(match[1]);
        if (cleaned.length > 100 && !isNavJunk(cleaned)) return cleaned;
      }
    }
    
    // Try meta og:description as last resort  
    const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    if (ogDesc && ogDesc[1] && ogDesc[1].length > 100) return ogDesc[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
    
    const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    if (metaDesc && metaDesc[1] && metaDesc[1].length > 100) return metaDesc[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  } catch(e) {}
  return null;
}

function isNavJunk(text) {
  const junkSignals = ['Cryptocurrencies', 'Buy and sell', 'Tips & Tutorials', 'Crypto basics',
    'Start your crypto journey', 'Cookie', 'Privacy Policy', 'Sign in', 'Log in',
    'Accept all', 'Terms of Service', 'Start here', '© 20'];
  let hits = 0;
  for (const s of junkSignals) if (text.includes(s)) hits++;
  if (hits >= 2) return true;
  // Too many short lines = nav menu
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const shortLines = lines.filter(l => l.trim().length < 30);
  if (lines.length > 10 && shortLines.length / lines.length > 0.7) return true;
  return false;
}

async function fetchDescription(url) {
  const lc = url.toLowerCase();
  
  // Route to ATS-specific fetcher
  if (lc.includes('greenhouse.io')) {
    const r = await fetchGreenhouse(url);
    if (r && r.length > 100 && !isNavJunk(r)) return r;
  }
  if (lc.includes('ashbyhq.com')) {
    const r = await fetchAshby(url);
    if (r && r.length > 100 && !isNavJunk(r)) return r;
  }
  if (lc.includes('lever.co')) {
    const r = await fetchLever(url);
    if (r && r.length > 100 && !isNavJunk(r)) return r;
  }
  if (lc.includes('getro.com') || lc.includes('jobs.solana.com') || lc.includes('multicoin.capital') ||
      lc.includes('dragonfly.xyz') || lc.includes('arbitrum.io') || lc.includes('avax.network') ||
      lc.includes('paradigm.xyz') || lc.includes('spartangroup.io')) {
    const r = await fetchGetro(url);
    if (r && r.length > 100 && !isNavJunk(r)) return r;
  }
  
  // Generic fallback
  const r = await fetchGeneric(url);
  if (r && r.length > 100 && !isNavJunk(r)) return r;
  
  return '';
}

async function main() {
  const rl = readline.createInterface({ input: fs.createReadStream('path/to/local'), crlfDelay: Infinity });
  let ln = 0;
  const rows = [];
  let headers = '';
  
  for await (const line of rl) {
    if (ln === 0) { headers = line.replace(/\r/g, ''); ln++; continue; }
    const f = parseLine(line);
    if (f.length < 15) { ln++; continue; }
    const desc = (f[14]||'').trim();
    rows.push({
      fields: f,
      url: (f[0]||'').trim(),
      desc,
      needsScrape: desc.length < 100 || isNavJunk(desc),
    });
    ln++;
  }
  
  const toScrape = rows.filter(r => r.needsScrape);
  console.log(`Total: ${rows.length} jobs, ${toScrape.length} need scraping (short/empty/junk)`);
  
  let done = 0, success = 0, failed = 0;
  for (let i = 0; i < toScrape.length; i += CONCURRENCY) {
    const batch = toScrape.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (row) => {
      const desc = await fetchDescription(row.url);
      if (desc && desc.length > 100) {
        row.desc = desc;
        row.fields[14] = desc;
        success++;
      } else {
        failed++;
      }
      done++;
    }));
    process.stdout.write(`\r  ${done}/${toScrape.length} (${((done/toScrape.length)*100).toFixed(0)}%) — ✓${success} ✗${failed}`);
  }
  console.log('\n');
  
  // Write updated CSV
  const esc = v => {
    const s = String(v || '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const outRows = [headers];
  for (const row of rows) outRows.push(row.fields.map(f => esc(f)).join(','));
  fs.writeFileSync('path/to/local', outRows.join('\n'));
  
  const finalGood = rows.filter(r => r.desc.length >= 100 && !isNavJunk(r.desc)).length;
  console.log(`✅ Updated path/to/local`);
  console.log(`   Good descriptions: ${finalGood}/${rows.length} (${(finalGood/rows.length*100).toFixed(1)}%)`);
  console.log(`   Newly scraped: ${success}`);
}

main().catch(e => { console.error(e); process.exit(1); });
