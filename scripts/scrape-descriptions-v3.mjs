import fs from 'fs';
import readline from 'readline';

const CONCURRENCY = 50;
const TIMEOUT = 15000;

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
  let t = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style[^>]*>[\s\S]*?<\/style>/gi,'');
  t = t.replace(/<br\s*\/?>/gi,'\n').replace(/<\/p>/gi,'\n\n').replace(/<\/li>/gi,'\n').replace(/<li[^>]*>/gi,'• ');
  t = t.replace(/<\/h[1-6]>/gi,'\n\n').replace(/<[^>]+>/g,' ');
  t = t.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ');
  return t.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
}

// ─── Step 1: Bulk-fetch Greenhouse boards ───
async function buildGreenhouseMap(boardSlugs) {
  const map = {}; // url -> description
  const uniqueBoards = [...new Set(boardSlugs)];
  console.log(`  Fetching ${uniqueBoards.length} Greenhouse boards...`);
  
  await Promise.all(uniqueBoards.map(async (board) => {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`, { signal: AbortSignal.timeout(TIMEOUT) });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.jobs) return;
      for (const job of data.jobs) {
        if (job.content && job.id) {
          // Map both absolute_url and ID
          const desc = cleanHtml(job.content);
          if (desc.length > 50) {
            map[String(job.id)] = desc;
            if (job.absolute_url) map[job.absolute_url.toLowerCase()] = desc;
          }
        }
      }
      console.log(`    ✓ ${board}: ${data.jobs.length} jobs`);
    } catch(e) { console.log(`    ✗ ${board}: ${e.message}`); }
  }));
  return map;
}

// ─── Step 2: Bulk-fetch Ashby boards ───
async function buildAshbyMap(orgSlugs) {
  const map = {};
  const uniqueOrgs = [...new Set(orgSlugs)];
  console.log(`  Fetching ${uniqueOrgs.length} Ashby orgs...`);
  
  await Promise.all(uniqueOrgs.map(async (org) => {
    try {
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${org}`, { signal: AbortSignal.timeout(TIMEOUT) });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.jobs) return;
      for (const job of data.jobs) {
        if (job.descriptionPlain && job.descriptionPlain.length > 50) {
          map[job.id] = job.descriptionPlain;
        } else if (job.descriptionHtml) {
          const desc = cleanHtml(job.descriptionHtml);
          if (desc.length > 50) map[job.id] = desc;
        }
      }
      console.log(`    ✓ ${org}: ${data.jobs.length} jobs`);
    } catch(e) { console.log(`    ✗ ${org}: ${e.message}`); }
  }));
  return map;
}

// ─── Step 3: Lever — server-rendered, individual fetch ───
async function fetchLever(url) {
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
  try {
    const res = await fetch(fullUrl, { signal: AbortSignal.timeout(TIMEOUT), headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const html = await res.text();
    // Lever JSON-LD
    const jsonLd = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLd) {
      try {
        const j = JSON.parse(jsonLd[1]);
        if (j.description && j.description.length > 50) return cleanHtml(j.description);
      } catch(e) {}
    }
    // Lever posting sections
    const sections = [];
    const re = /<div[^>]*class="[^"]*section[^"]*page-centered[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    let m;
    while ((m = re.exec(html)) !== null) { const c = cleanHtml(m[1]); if (c.length > 20) sections.push(c); }
    if (sections.join('\n').length > 100) return sections.join('\n\n');
  } catch(e) {}
  return null;
}

// ─── Step 4: Generic fetch with better extraction ───
async function fetchGeneric(url) {
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
  try {
    const res = await fetch(fullUrl, { signal: AbortSignal.timeout(TIMEOUT), headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    if (!res.ok) return null;
    const html = await res.text();
    // Try JSON-LD first (most reliable)
    const jsonLd = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLd) {
      for (const block of jsonLd) {
        try {
          const inner = block.match(/>([\s\S]*?)<\/script>/i)[1];
          const j = JSON.parse(inner);
          const desc = j.description || j.jobDescription;
          if (desc && desc.length > 100) return cleanHtml(desc);
        } catch(e) {}
      }
    }
    // OG description
    const og = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    if (og && og[1].length > 100) return og[1].replace(/&amp;/g,'&').replace(/&quot;/g,'"');
    const meta = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    if (meta && meta[1].length > 100) return meta[1].replace(/&amp;/g,'&').replace(/&quot;/g,'"');
  } catch(e) {}
  return null;
}

async function main() {
  // Read CSV
  const rl = readline.createInterface({ input: fs.createReadStream('/Users/vedang/Downloads/HashtagWeb3.csv'), crlfDelay: Infinity });
  let ln = 0, headers = '';
  const rows = [];
  for await (const line of rl) {
    if (ln === 0) { headers = line.replace(/\r/g,''); ln++; continue; }
    const f = parseLine(line);
    if (f.length < 15) { ln++; continue; }
    rows.push({ fields: f, url: (f[0]||'').trim(), desc: (f[14]||'').trim() });
    ln++;
  }
  
  const needsScrape = rows.filter(r => r.desc.length < 100);
  console.log(`Total: ${rows.length} jobs, ${needsScrape.length} missing descriptions\n`);
  
  // ─── Greenhouse: extract board slugs and job IDs ───
  const ghBoards = new Set();
  const ghJobs = []; // {row, board, jobId}
  for (const row of needsScrape) {
    const m = row.url.match(/greenhouse\.io\/([^\/]+)\/jobs\/(\d+)/i);
    if (m) { ghBoards.add(m[1]); ghJobs.push({ row, board: m[1], jobId: m[2] }); }
    // Also handle company.com redirects to Greenhouse
    const m2 = row.url.match(/(?:ripple|coinbase|a16z|complyadvantage|luno|bitpanda|fireblocks|gemini|bitgo|alchemy|consensys|hedera)\.com.*?\/(\d{5,})/i);
    if (m2 && !m) {
      const slug = row.url.match(/(ripple|coinbase|a16z|complyadvantage|luno|bitpanda|fireblocks|gemini|bitgo|alchemy|consensys|hedera)/i);
      if (slug) { ghBoards.add(slug[1].toLowerCase()); ghJobs.push({ row, board: slug[1].toLowerCase(), jobId: m2[1] }); }
    }
  }
  console.log(`Greenhouse: ${ghJobs.length} jobs across ${ghBoards.size} boards`);
  const ghMap = await buildGreenhouseMap([...ghBoards]);
  
  let ghFixed = 0;
  for (const { row, jobId } of ghJobs) {
    const desc = ghMap[jobId];
    if (desc && desc.length > 100) { row.desc = desc; row.fields[14] = desc; ghFixed++; }
  }
  console.log(`  → Fixed: ${ghFixed}\n`);
  
  // ─── Ashby: extract org slugs ───
  const ashbyOrgs = new Set();
  const ashbyJobs = [];
  for (const row of needsScrape) {
    const m = row.url.match(/jobs\.ashbyhq\.com\/([^\/]+)\/([a-f0-9-]+)/i);
    if (m) { ashbyOrgs.add(m[1]); ashbyJobs.push({ row, org: m[1], jobId: m[2] }); }
  }
  console.log(`Ashby: ${ashbyJobs.length} jobs across ${ashbyOrgs.size} orgs`);
  const ashbyMap = await buildAshbyMap([...ashbyOrgs]);
  
  let ashbyFixed = 0;
  for (const { row, jobId } of ashbyJobs) {
    const desc = ashbyMap[jobId];
    if (desc && desc.length > 100) { row.desc = desc; row.fields[14] = desc; ashbyFixed++; }
  }
  console.log(`  → Fixed: ${ashbyFixed}\n`);
  
  // ─── Lever: individual fetches ───
  const leverJobs = needsScrape.filter(r => r.desc.length < 100 && r.url.includes('lever.co'));
  console.log(`Lever: ${leverJobs.length} jobs (individual fetch)`);
  let leverFixed = 0;
  for (let i = 0; i < leverJobs.length; i += CONCURRENCY) {
    const batch = leverJobs.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async row => {
      const desc = await fetchLever(row.url);
      if (desc && desc.length > 100) { row.desc = desc; row.fields[14] = desc; leverFixed++; }
    }));
  }
  console.log(`  → Fixed: ${leverFixed}\n`);
  
  // ─── Generic: remaining jobs ───
  const remaining = needsScrape.filter(r => r.desc.length < 100);
  console.log(`Generic: ${remaining.length} remaining jobs`);
  let genFixed = 0;
  for (let i = 0; i < remaining.length; i += CONCURRENCY) {
    const batch = remaining.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async row => {
      const desc = await fetchGeneric(row.url);
      if (desc && desc.length > 100) { row.desc = desc; row.fields[14] = desc; genFixed++; }
    }));
    process.stdout.write(`\r  ${Math.min(i+CONCURRENCY, remaining.length)}/${remaining.length}`);
  }
  console.log(`\n  → Fixed: ${genFixed}\n`);
  
  // ─── Write output ───
  const esc = v => { const s = String(v||''); if (s.includes(',')||s.includes('"')||s.includes('\n')) return '"'+s.replace(/"/g,'""')+'"'; return s; };
  const outRows = [headers];
  for (const row of rows) outRows.push(row.fields.map(f => esc(f)).join(','));
  fs.writeFileSync('/Users/vedang/Downloads/HashtagWeb3.csv', outRows.join('\n'));
  
  const good = rows.filter(r => r.desc.length >= 100).length;
  const bad = rows.filter(r => r.desc.length < 100).length;
  console.log(`✅ Updated /Users/vedang/Downloads/HashtagWeb3.csv`);
  console.log(`   Good descriptions: ${good}/${rows.length} (${(good/rows.length*100).toFixed(1)}%)`);
  console.log(`   Still missing: ${bad} (${(bad/rows.length*100).toFixed(1)}%)`);
  console.log(`   Fixed: GH=${ghFixed} Ashby=${ashbyFixed} Lever=${leverFixed} Generic=${genFixed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
