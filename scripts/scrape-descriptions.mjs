import fs from 'fs';
import readline from 'readline';

const CONCURRENCY = 50;
const TIMEOUT = 10000;

function parseLine(line) {
  const fields = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) { if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; } else if (ch === '"') inQ = false; else cur += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { fields.push(cur); cur = ''; } else cur += ch; }
  }
  fields.push(cur); return fields;
}

function extractDescription(html) {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Try to find job description in common containers
  const selectors = [
    // Greenhouse
    /<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>\s*(?:<div|$)/i,
    /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    // Ashby
    /<div[^>]*class="[^"]*ashby-job-posting-brief-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*ashby-job-posting-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    // Lever  
    /<div[^>]*class="[^"]*posting-page[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    // Generic
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
  ];
  
  for (const re of selectors) {
    const match = html.match(re);
    if (match && match[1]) {
      const cleaned = cleanHtml(match[1]);
      if (cleaned.length > 100) return cleaned;
    }
  }
  
  // Fallback: try meta description
  const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  if (metaDesc && metaDesc[1] && metaDesc[1].length > 100) return metaDesc[1];
  
  // Fallback: try og:description
  const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
  if (ogDesc && ogDesc[1] && ogDesc[1].length > 100) return ogDesc[1];
  
  // Last resort: extract all paragraph text from body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const body = cleanHtml(bodyMatch[1]);
    if (body.length > 100) return body.slice(0, 3000);
  }
  
  return '';
}

function cleanHtml(html) {
  let text = html;
  // Convert common HTML elements to readable text
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<li[^>]*>/gi, '• ');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<h[1-6][^>]*>/gi, '');
  // Remove all remaining tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode HTML entities
  text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/');
  // Clean whitespace
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();
  return text;
}

async function fetchDescription(url) {
  const fullUrl = url.startsWith('http') ? url : 'https://' + url;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(fullUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) return '';
    const html = await res.text();
    return extractDescription(html);
  } catch (e) {
    return '';
  }
}

async function main() {
  // Read CSV
  const rl = readline.createInterface({ input: fs.createReadStream('path/to/local'), crlfDelay: Infinity });
  let ln = 0;
  const rows = [];
  let headers = '';
  
  for await (const line of rl) {
    if (ln === 0) { headers = line; ln++; continue; }
    const f = parseLine(line);
    if (f.length < 15) { ln++; continue; }
    rows.push({
      raw: line,
      fields: f,
      url: (f[0]||'').trim(),
      desc: (f[14]||'').trim(),
      needsScrape: (f[14]||'').trim().length < 100,
    });
    ln++;
  }
  
  console.log(`Total: ${rows.length} jobs, ${rows.filter(r=>r.needsScrape).length} need scraping`);
  
  // Scrape in batches
  const toScrape = rows.filter(r => r.needsScrape);
  let done = 0, success = 0, failed = 0;
  
  for (let i = 0; i < toScrape.length; i += CONCURRENCY) {
    const batch = toScrape.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (row) => {
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
    
    const pct = ((done / toScrape.length) * 100).toFixed(0);
    process.stdout.write(`\r  ${done}/${toScrape.length} (${pct}%) — ✓${success} ✗${failed}`);
  }
  
  console.log('\n');
  
  // Write updated CSV
  const esc = v => {
    const s = String(v || '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  
  const outRows = [headers.replace(/\r/g, '')];
  for (const row of rows) {
    outRows.push(row.fields.map(f => esc(f)).join(','));
  }
  
  fs.writeFileSync('path/to/local', outRows.join('\n'));
  
  // Stats
  const finalGood = rows.filter(r => r.desc.length >= 100).length;
  const finalBad = rows.filter(r => r.desc.length < 100).length;
  console.log(`✅ Updated path/to/local`);
  console.log(`   With real description: ${finalGood} (${(finalGood/rows.length*100).toFixed(1)}%)`);
  console.log(`   Still missing: ${finalBad} (${(finalBad/rows.length*100).toFixed(1)}%)`);
  console.log(`   Scraped successfully: ${success}`);
}

main().catch(e => { console.error(e); process.exit(1); });
