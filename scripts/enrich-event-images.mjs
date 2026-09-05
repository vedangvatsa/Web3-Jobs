import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const curatedPath = path.join(rootDir, 'content', 'curated-events.json');
const cachePath = path.join(rootDir, 'content', 'events-cache.json');
const publicEventsDir = path.join(rootDir, 'public', 'events');

if (!fs.existsSync(publicEventsDir)) {
  fs.mkdirSync(publicEventsDir, { recursive: true });
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

function isGenericOrBroken(img) {
  if (!img || typeof img !== 'string') return true;
  if (img.includes('unsplash.com')) return true;
  if (img.startsWith('/Users/')) return true;
  if (img.includes('placeholder')) return true;
  return false;
}

function cleanUrl(raw) {
  if (!raw) return null;
  let u = raw.trim();
  if (u.includes('https://lu.ma/https://')) u = u.replace('https://lu.ma/https://', 'https://');
  if (u.includes('https://lu.ma/http://')) u = u.replace('https://lu.ma/http://', 'http://');
  if (!u.startsWith('http')) return null;
  return u;
}

async function extractImageFromUrl(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 1. Meta og:image or twitter:image
    const candidates = [
      $('meta[property="og:image"]').attr('content'),
      $('meta[name="og:image"]').attr('content'),
      $('meta[property="og:image:url"]').attr('content'),
      $('meta[property="twitter:image"]').attr('content'),
      $('meta[name="twitter:image"]').attr('content'),
      $('meta[name="twitter:image:src"]').attr('content'),
      $('link[rel="image_src"]').attr('href'),
    ];

    for (let c of candidates) {
      if (c && typeof c === 'string') {
        c = c.trim();
        if (c.includes('1x1') || c.includes('pixel') || c.length < 15) continue;
        if (!c.startsWith('http')) {
          try {
            c = new URL(c, url).toString();
          } catch {
            continue;
          }
        }
        return c;
      }
    }

    // 2. Next.js / Nuxt hydration state (especially for Luma, Eventbrite, etc.)
    const nextData = $('script#__NEXT_DATA__').html();
    if (nextData) {
      try {
        const parsed = JSON.parse(nextData);
        const str = JSON.stringify(parsed);
        const match = str.match(/https:\/\/[^"'\\]+cover[^"'\\]+\.(jpg|jpeg|png|webp)/i) ||
                      str.match(/https:\/\/[^"'\\]+lumacdn\.com[^"'\\]+/i) ||
                      str.match(/https:\/\/[^"'\\]+banner[^"'\\]+\.(jpg|jpeg|png|webp)/i);
        if (match && match[0]) {
          return match[0].replace(/\\u0026/g, '&');
        }
      } catch {}
    }

    // 3. Schema.org JSON-LD
    const jsonLd = $('script[type="application/ld+json"]');
    for (let i = 0; i < jsonLd.length; i++) {
      try {
        const data = JSON.parse($(jsonLd[i]).text());
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item && item.image) {
            let img = typeof item.image === 'string' ? item.image : (item.image.url || (Array.isArray(item.image) ? item.image[0] : null));
            if (img && typeof img === 'string') {
              img = img.trim();
              if (!img.startsWith('http')) {
                img = new URL(img, url).toString();
              }
              return img;
            }
          }
        }
      } catch {}
    }

    // 4. Hero / banner images in DOM
    const heroImg = $('img[src*="banner"], img[src*="cover"], img[src*="hero"], img[src*="poster"]').first().attr('src');
    if (heroImg) {
      let c = heroImg.trim();
      if (!c.startsWith('http')) {
        try {
          c = new URL(c, url).toString();
        } catch {
          return null;
        }
      }
      return c;
    }

    return null;
  } catch {
    return null;
  }
}

async function verifyImage(imgUrl) {
  if (!imgUrl || !imgUrl.startsWith('http')) return false;
  try {
    const res = await fetch(imgUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    });
    if (!res.ok) return false;
    const type = res.headers.get('content-type') || '';
    return type.startsWith('image/') || type.includes('octet-stream');
  } catch {
    // If HEAD fails, try GET range
    try {
      const res = await fetch(imgUrl, {
        headers: { 'User-Agent': UA, 'Range': 'bytes=0-100' },
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

async function processEventsFile(filePath, label) {
  if (!fs.existsSync(filePath)) return;
  console.log(`\n========================================`);
  console.log(` Processing ${label}: ${filePath}`);
  console.log(`========================================`);

  const events = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const now = new Date();
  
  const toProcess = events.filter(e => {
    const d = e.endDate ? new Date(e.endDate) : new Date(e.startDate);
    const isUpcoming = !isNaN(d.getTime()) && d >= now;
    return isUpcoming && isGenericOrBroken(e.coverImage);
  });

  console.log(`Found ${toProcess.length} upcoming events needing real images.`);

  let updatedCount = 0;
  let failedCount = 0;

  // Process in small batches of 10 to avoid overwhelming connections
  const BATCH_SIZE = 10;
  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(toProcess.length / BATCH_SIZE)}...`);

    await Promise.all(
      batch.map(async (event) => {
        const url = cleanUrl(event.url) || cleanUrl(event.website);
        if (!url) {
          failedCount++;
          return;
        }

        const candidateImage = await extractImageFromUrl(url);
        if (candidateImage) {
          const isValid = await verifyImage(candidateImage);
          if (isValid) {
            console.log(`  ✓ [${event.name}]`);
            console.log(`    From: ${url}`);
            console.log(`    Found: ${candidateImage}`);
            event.coverImage = candidateImage;
            updatedCount++;
            return;
          }
        }
        failedCount++;
      })
    );

    // Save incrementally
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
  console.log(`\nFinished ${label}: Updated ${updatedCount} images. (Failed/Unavailable: ${failedCount})`);
}

async function main() {
  await processEventsFile(curatedPath, 'Curated Events');
  await processEventsFile(cachePath, 'Cached Events');
  console.log('\nAll event image enrichment complete!');
}

main().catch(err => {
  console.error('Fatal error in event image enrichment:', err);
  process.exit(1);
});
