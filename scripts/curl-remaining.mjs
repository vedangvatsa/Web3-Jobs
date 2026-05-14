import fs from 'fs';

const CONCURRENCY = 20;
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
  let t = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  t = t.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/li>/gi, '\n').replace(/<li[^>]*>/gi, '• ');
  t = t.replace(/<\/h[1-6]>/gi, '\n\n').replace(/<[^>]+>/g, ' ');
  t = t.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ');
  return t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function isNavJunk(text) {
  const signals = ['Cryptocurrencies','Buy and sell','Cookie','Privacy Policy','Terms of Service','Accept all','© 20','Sign in','Log in','navbar','footer'];
  let hits = 0;
  for (const s of signals) if (text.includes(s)) hits++;
  return hits >= 2;
}

async function curlFetch(url) {
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
  try {
    const res = await fetch(fullUrl, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const html = await res.text();
    
    // 1. Try JSON-LD (most reliable)
    const jsonLds = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLds) {
      for (const block of jsonLds) {
        try {
          const inner = block.match(/>([\s\S]*?)<\/script>/i)[1];
          const j = JSON.parse(inner);
          const desc = j.description || j.jobDescription;
          if (desc && desc.length > 200) return cleanHtml(desc);
        } catch(e) {}
      }
    }
    
    // 2. Try __NEXT_DATA__ (Getro, Next.js sites)
    const nextData = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (nextData) {
      try {
        const j = JSON.parse(nextData[1]);
        const props = j?.props?.pageProps;
        if (props?.jobPosting?.descriptionHtml) return cleanHtml(props.jobPosting.descriptionHtml);
        if (props?.jobPosting?.description) return props.jobPosting.description;
        if (props?.job?.description) return cleanHtml(props.job.description);
        // Deep search
        const str = JSON.stringify(props);
        const descMatch = str.match(/"description"\s*:\s*"([^"]{200,})"/);
        if (descMatch) return descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      } catch(e) {}
    }
    
    // 3. Try specific JD selectors in raw HTML
    const jdPatterns = [
      /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*posting-page[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*data-qa="job-description"[^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
    ];
    for (const p of jdPatterns) {
      const m = html.match(p);
      if (m) {
        const cleaned = cleanHtml(m[1]);
        if (cleaned.length > 200 && !isNavJunk(cleaned)) return cleaned;
      }
    }
    
    // 4. Extract <main> or <article> content
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (mainMatch) {
      const cleaned = cleanHtml(mainMatch[1]);
      if (cleaned.length > 300 && !isNavJunk(cleaned)) return cleaned;
    }
    
    // 5. Lever-specific: posting sections
    if (url.includes('lever.co')) {
      const sections = [];
      const re = /<div[^>]*class="[^"]*section[^"]*page-centered[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const c = cleanHtml(m[1]);
        if (c.length > 20) sections.push(c);
      }
      if (sections.join('\n').length > 200) return sections.join('\n\n');
    }
    
    return null;
  } catch(e) {
    return null;
  }
}

async function main() {
  // Read original from git + current
  const { execSync } = await import('child_process');
  const origContent = execSync('git show HEAD:jobs-extracted.csv', { cwd: '', maxBuffer: 50*1024*1024 }).toString();
  const origRows = parseCSV(origContent);
  const origData = origRows.slice(1);
  
  const curContent = fs.readFileSync('process.cwd() + '/jobs-extracted.csv', 'utf8');
  const curRows = parseCSV(curContent);
  const curHeader = curRows[0];
  const curData = curRows.slice(1);
  const curUrls = new Set(curData.map(r => (r[0]||'').trim()));
  
  // Get removed rows (skip LinkedIn - auth-walled)
  const removed = origData.filter(r => {
    const url = (r[0]||'').trim();
    return !curUrls.has(url) && !url.includes('linkedin.com');
  });
  
  console.log(`Curl-fetching ${removed.length} removed jobs (skipping LinkedIn)\n`);
  
  let done = 0, success = 0;
  const recovered = [];
  
  for (let i = 0; i < removed.length; i += CONCURRENCY) {
    const batch = removed.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async row => {
      const url = (row[0]||'').trim();
      const desc = await curlFetch(url);
      done++;
      if (desc && desc.length > 200 && !isNavJunk(desc)) {
        row[4] = desc;
        recovered.push(row);
        success++;
        console.log(`  ✓ ${row[1]} - ${row[3]} (${desc.length} chars)`);
      }
    }));
    process.stdout.write(`\r  ${done}/${removed.length} — ✓${success}\n`);
  }
  
  // Append recovered to current CSV
  const esc = v => { const s = String(v||'-'); if (s.includes(',')||s.includes('"')||s.includes('\n')) return '"'+s.replace(/"/g,'""')+'"'; return s; };
  const lines = curContent.split('\n');
  for (const row of recovered) {
    lines.push(row.map(v => esc(v)).join(','));
  }
  fs.writeFileSync('process.cwd() + '/jobs-extracted.csv', lines.join('\n'));
  
  console.log(`\n✅ Recovered ${success} jobs with real descriptions`);
  console.log(`   Total now: ${curData.length + recovered.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
