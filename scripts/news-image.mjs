/**
 * news-image.mjs — resolve a topical photo for a news story via the
 * Wikimedia Commons API. Prints JSON the news-writing agent can paste
 * straight into front matter (image + imageCaption + imageCreditUrl).
 *
 * Usage: node scripts/news-image.mjs "search terms" [fallback terms ...]
 * Tries each query in order, returns the first usable landscape photo
 * (excludes logos, diagrams, portraits of unrelated subjects).
 * Exits 0 with {"found": false} when nothing qualifies.
 */

const API = 'https://commons.wikimedia.org/w/api.php';
const SKIP = /(logo|icon|diagram|chart|graph|screenshot|map\.|flag of|coat of arms)/i;

async function api(params) {
  const u = API + '?' + new URLSearchParams({ format: 'json', ...params });
  const r = await fetch(u, { headers: { 'User-Agent': 'HashtagWeb3NewsBot/1.0 (+https://hashtagweb3.com)' }, signal: AbortSignal.timeout(20000) });
  return r.json();
}

async function details(title) {
  const j = await api({
    action: 'query', titles: title, prop: 'imageinfo|categories|globalusage',
    iiprop: 'url|size|mime|user|extmetadata', cllimit: 20, gulimit: 10,
  });
  const pages = j.query.pages;
  const page = pages[Object.keys(pages)[0]];
  if (!page.imageinfo) return null;
  return { info: page.imageinfo[0], categories: (page.categories || []).map((c) => c.title), usage: (page.globalusage || []).length };
}

// Relevance: query terms must appear in the file description, categories,
// or depicts statements — keyword search alone returns wrong companies,
// PDFs, and unrelated files.
function relevance(query, title, info, categories) {
  const em = info.extmetadata || {};
  const text = [
    title,
    em.ImageDescription ? em.ImageDescription.value.replace(/<[^>]+>/g, ' ') : '',
    (categories || []).join(' '),
  ].join(' ').toLowerCase();
  const terms = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
  if (!terms.length) return 0;
  let hit = 0;
  for (const t of terms) if (text.includes(t)) hit++;
  return hit / terms.length;
}

function licenseOf(info) {
  const em = info.extmetadata || {};
  const short = em.LicenseShortName ? em.LicenseShortName.value : '';
  const artist = em.Artist ? em.Artist.value.replace(/<[^>]+>/g, '') : info.user;
  return { short, artist };
}

async function main() {
  const queries = process.argv.slice(2);
  if (!queries.length) {
    console.log(JSON.stringify({ found: false, reason: 'no query' }));
    return;
  }
  for (const q of queries) {
    try {
      const s = await api({ action: 'query', list: 'search', srsearch: q, srnamespace: '6', srlimit: 10, srfiletype: 'bitmap' });
      const scored = [];
      for (const hit of (s.query.search || [])) {
        if (SKIP.test(hit.title)) continue;
        const d = await details(hit.title);
        if (!d) continue;
        const { info, categories, usage } = d;
        if (!/^image\/(jpeg|png|webp)$/.test(info.mime || '')) continue;
        if ((info.width || 0) < 900 || (info.height || 0) < 500) continue;
        if (info.width < info.height) continue; // heroes need landscape
        const { short, artist } = licenseOf(info);
        if (!/CC|public domain/i.test(short)) continue;
        const rel = relevance(q, hit.title, info, categories);
        if (rel < 0.5) continue; // description must match the query
        scored.push({
          hit, info, categories, usage, rel,
          score: rel * 2 + Math.min(usage, 5) * 0.2 + Math.min(info.width / 4000, 1) * 0.3,
          short, artist,
        });
        await new Promise((r) => setTimeout(r, 800));
      }
      scored.sort((a, b) => b.score - a.score);
      const best = scored[0];
      if (best) {
        console.log(JSON.stringify({
          found: true,
          query: q,
          file: best.hit.title.replace(/^File:/, ''),
          page: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(best.hit.title).replace(/%3A/g, ':'),
          url: best.info.url.split('?')[0],
          width: best.info.width,
          height: best.info.height,
          license: best.short,
          author: best.artist,
          relevance: +best.rel.toFixed(2),
          wikiUsage: best.usage,
        }, null, 2));
        return;
      }
    } catch {
      continue;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log(JSON.stringify({ found: false }));
}

main();
