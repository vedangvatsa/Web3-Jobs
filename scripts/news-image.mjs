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
    action: 'query', titles: title, prop: 'imageinfo',
    iiprop: 'url|size|mime|user|extmetadata',
  });
  const pages = j.query.pages;
  const info = pages[Object.keys(pages)[0]].imageinfo;
  return info ? info[0] : null;
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
      const s = await api({ action: 'query', list: 'search', srsearch: q, srnamespace: '6', srlimit: 8 });
      for (const hit of (s.query.search || [])) {
        if (SKIP.test(hit.title)) continue;
        const info = await details(hit.title);
        if (!info || !/^image\/(jpeg|png|webp)$/.test(info.mime || '')) continue;
        if ((info.width || 0) < 900 || (info.height || 0) < 500) continue;
        if (info.width < info.height) continue; // heroes need landscape
        const { short, artist } = licenseOf(info);
        if (!/CC|public domain/i.test(short)) continue;
        console.log(JSON.stringify({
          found: true,
          query: q,
          file: hit.title.replace(/^File:/, ''),
          page: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(hit.title).replace(/%3A/g, ':'),
          url: info.url.split('?')[0],
          width: info.width,
          height: info.height,
          license: short,
          author: artist,
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
