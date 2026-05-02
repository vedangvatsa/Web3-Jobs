import fs from 'fs';
import puppeteer from 'puppeteer';

const CONCURRENCY = 50;
const TIMEOUT = 15000;

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

function cleanHtml(html) {
  let t = html;
  t = t.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  t = t.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  t = t.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<\/p>/gi, '\n\n');
  t = t.replace(/<\/li>/gi, '\n');
  t = t.replace(/<li[^>]*>/gi, '• ');
  t = t.replace(/<\/h[1-6]>/gi, '\n\n');
  t = t.replace(/<h[1-6][^>]*>/gi, '');
  t = t.replace(/<[^>]+>/g, ' ');
  t = t.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/&#x27;/g,"'").replace(/&#x2F;/g,'/');
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return t;
}

function isAISummary(desc) {
  if (!desc || desc === '-' || desc.length < 50) return false;
  // AI summaries are typically 150-400 chars, no sections
  const hasStructure = /\b(responsibilities|requirements|qualifications|what you|about the role|who you are|key duties|minimum|preferred|must have|nice to have|you will|your role|what we)\b/i.test(desc);
  if (hasStructure && desc.length > 500) return false; // real JD with sections
  // Short paragraph-style summary
  if (desc.length < 400 && desc.split('\n').filter(l=>l.trim()).length <= 5) return true;
  // "The [Title] will..." pattern
  if (/^(The |As a |This role|In this position)/.test(desc) && desc.length < 500) return true;
  return false;
}

async function main() {
  const content = fs.readFileSync('LOCAL_PATH/jobs-extracted.csv', 'utf8');
  const rows = parseCSV(content);
  const header = rows[0];
  const data = rows.slice(1);
  
  // Find AI-summarized descriptions
  const toReplace = [];
  for (let i = 0; i < data.length; i++) {
    const desc = (data[i][4]||'').trim();
    if (isAISummary(desc)) toReplace.push(i);
  }
  console.log(`Found ${toReplace.length} AI-summarized descriptions to replace\n`);
  
  // ─── Phase 1: Bulk Greenhouse API ───
  const ghBoards = new Set();
  const ghJobs = [];
  for (const idx of toReplace) {
    const url = (data[idx][0]||'').trim();
    const m = url.match(/greenhouse\.io\/([^\/]+)\/jobs\/(\d+)/i);
    if (m) { ghBoards.add(m[1]); ghJobs.push({ idx, board: m[1], jobId: m[2] }); }
    // Company-hosted Greenhouse
    const m2 = url.match(/(?:ripple|coinbase|complyadvantage|luno|bitpanda|fireblocks|gemini|bitgo|alchemy|consensys|hedera|okx|robinhood|brave|flowtraders|taxbit|bitpanda|b2c2)\.com.*?(?:jobs|careers).*?\/(\d{5,})/i);
    if (m2 && !m) {
      const slug = url.match(/(ripple|coinbase|complyadvantage|luno|bitpanda|fireblocks|gemini|bitgo|alchemy|consensys|hedera|okx|robinhood|brave|flowtraders|taxbit|b2c2)/i);
      if (slug) { ghBoards.add(slug[1].toLowerCase()); ghJobs.push({ idx, board: slug[1].toLowerCase(), jobId: m2[1] }); }
    }
  }
  
  console.log(`Greenhouse: ${ghJobs.length} jobs across ${ghBoards.size} boards`);
  const ghMap = {};
  await Promise.all([...ghBoards].map(async board => {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`, { signal: AbortSignal.timeout(TIMEOUT) });
      if (!res.ok) return;
      const d = await res.json();
      for (const j of (d.jobs||[])) {
        if (j.content) ghMap[String(j.id)] = cleanHtml(j.content);
      }
      console.log(`  ✓ ${board}: ${d.jobs?.length} jobs`);
    } catch(e) { console.log(`  ✗ ${board}`); }
  }));
  let ghFixed = 0;
  for (const { idx, jobId } of ghJobs) {
    if (ghMap[jobId] && ghMap[jobId].length > 100) { data[idx][4] = ghMap[jobId]; ghFixed++; }
  }
  console.log(`  → Replaced: ${ghFixed}\n`);

  // ─── Phase 2: Bulk Ashby API ───
  const ashbyOrgs = new Map();
  for (const idx of toReplace) {
    const url = (data[idx][0]||'').trim();
    const m = url.match(/jobs\.ashbyhq\.com\/([^\/]+)\/([a-f0-9-]+)/i);
    if (m) {
      if (!ashbyOrgs.has(m[1])) ashbyOrgs.set(m[1], []);
      ashbyOrgs.get(m[1]).push({ idx, jobId: m[2] });
    }
  }
  console.log(`Ashby: ${[...ashbyOrgs.values()].flat().length} jobs across ${ashbyOrgs.size} orgs`);
  const ashbyMap = {};
  await Promise.all([...ashbyOrgs.keys()].map(async org => {
    try {
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${org}`, { signal: AbortSignal.timeout(TIMEOUT) });
      if (!res.ok) return;
      const d = await res.json();
      for (const j of (d.jobs||[])) {
        const desc = j.descriptionPlain || (j.descriptionHtml ? cleanHtml(j.descriptionHtml) : '');
        if (desc.length > 50) ashbyMap[j.id] = desc;
      }
      console.log(`  ✓ ${org}: ${d.jobs?.length} jobs`);
    } catch(e) { console.log(`  ✗ ${org}`); }
  }));
  let ashbyFixed = 0;
  for (const entries of ashbyOrgs.values()) {
    for (const { idx, jobId } of entries) {
      if (ashbyMap[jobId] && ashbyMap[jobId].length > 100) { data[idx][4] = ashbyMap[jobId]; ashbyFixed++; }
    }
  }
  console.log(`  → Replaced: ${ashbyFixed}\n`);

  // ─── Phase 3: Lever (JSON-LD) ───
  const leverJobs = toReplace.filter(idx => {
    return isAISummary((data[idx][4]||'').trim()) && (data[idx][0]||'').includes('lever.co');
  });
  console.log(`Lever: ${leverJobs.length} jobs`);
  let leverFixed = 0;
  for (let i = 0; i < leverJobs.length; i += CONCURRENCY) {
    const batch = leverJobs.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async idx => {
      const url = data[idx][0].startsWith('http') ? data[idx][0] : 'https://' + data[idx][0];
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT), headers: {'User-Agent':'Mozilla/5.0'} });
        if (!res.ok) return;
        const html = await res.text();
        const jsonLd = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
        if (jsonLd) {
          const j = JSON.parse(jsonLd[1]);
          if (j.description && j.description.length > 100) { data[idx][4] = cleanHtml(j.description); leverFixed++; }
        }
      } catch(e) {}
    }));
  }
  console.log(`  → Replaced: ${leverFixed}\n`);

  // ─── Phase 4: Generic fetch for remaining ───
  const remaining = toReplace.filter(idx => isAISummary((data[idx][4]||'').trim()));
  console.log(`Generic: ${remaining.length} remaining`);
  let genFixed = 0;
  for (let i = 0; i < remaining.length; i += CONCURRENCY) {
    const batch = remaining.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async idx => {
      const url = data[idx][0].startsWith('http') ? data[idx][0] : 'https://' + data[idx][0];
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT), headers: {'User-Agent':'Mozilla/5.0'}, redirect: 'follow' });
        if (!res.ok) return;
        const html = await res.text();
        // JSON-LD first
        const jsonLds = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
        if (jsonLds) {
          for (const block of jsonLds) {
            try {
              const inner = block.match(/>([\s\S]*?)<\/script>/i)[1];
              const j = JSON.parse(inner);
              if (j.description && j.description.length > 100) { data[idx][4] = cleanHtml(j.description); genFixed++; return; }
            } catch(e) {}
          }
        }
        // og:description
        const og = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
        if (og && og[1].length > 200) { data[idx][4] = og[1].replace(/&amp;/g,'&').replace(/&quot;/g,'"'); genFixed++; }
      } catch(e) {}
    }));
    process.stdout.write(`\r  ${Math.min(i+CONCURRENCY, remaining.length)}/${remaining.length}`);
  }
  console.log(`\n  → Replaced: ${genFixed}\n`);

  // ─── Phase 5: Puppeteer for stubborn ones ───
  const stubborn = toReplace.filter(idx => isAISummary((data[idx][4]||'').trim()));
  if (stubborn.length > 0 && stubborn.length <= 200) {
    console.log(`Browser: ${stubborn.length} remaining`);
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    let browserFixed = 0;
    for (let i = 0; i < stubborn.length; i += 5) {
      const batch = stubborn.slice(i, i + 5);
      await Promise.all(batch.map(async idx => {
        const url = data[idx][0].startsWith('http') ? data[idx][0] : 'https://' + data[idx][0];
        const page = await browser.newPage();
        try {
          await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
          await new Promise(r => setTimeout(r, 2000));
          const desc = await page.evaluate(() => {
            const sels = ['[data-automation-id="jobPostingDescription"]','.job-description','[class*="job-description"]','[class*="JobDescription"]','article','main'];
            for (const s of sels) { const el = document.querySelector(s); if (el && el.innerText.trim().length > 200) return el.innerText.trim(); }
            const ld = document.querySelectorAll('script[type="application/ld+json"]');
            for (const s of ld) { try { const j = JSON.parse(s.textContent); if (j.description?.length > 100) return j.description; } catch(e){} }
            return '';
          });
          if (desc.length > 200) { data[idx][4] = desc.replace(/\n{3,}/g,'\n\n').trim(); browserFixed++; }
        } catch(e) {}
        await page.close().catch(()=>{});
      }));
      process.stdout.write(`\r  ${Math.min(i+5, stubborn.length)}/${stubborn.length}`);
    }
    await browser.close();
    console.log(`\n  → Replaced: ${browserFixed}\n`);
  }

  // Write
  const esc = v => { const s = String(v||'-'); if (s.includes(',')||s.includes('"')||s.includes('\n')) return '"'+s.replace(/"/g,'""')+'"'; return s; };
  const out = [header.map(h => esc(h)).join(',')];
  for (const row of data) out.push(row.map(v => esc(v)).join(','));
  fs.writeFileSync('LOCAL_PATH/jobs-extracted.csv', out.join('\n'));

  // Final stats
  const stillAI = data.filter(r => isAISummary((r[4]||'').trim())).length;
  const goodDesc = data.filter(r => (r[4]||'').trim().length >= 100 && !isAISummary((r[4]||'').trim())).length;
  console.log(`✅ Updated jobs-extracted.csv`);
  console.log(`   Real JD text: ${goodDesc}/${data.length} (${(goodDesc/data.length*100).toFixed(1)}%)`);
  console.log(`   Still AI summary: ${stillAI}`);
  console.log(`   No description: ${data.filter(r => (r[4]||'').trim() === '-' || (r[4]||'').trim().length < 100).length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
