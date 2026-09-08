import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Luma's "add a cover photo" grey placeholder masquerades as a real image.
// Treat it as missing so og:image enrichment fills in the actual event art.
export function isLumaDefaultPlaceholder(img) {
  return !!img && typeof img === 'string' && /images\.lumacdn\.com\/social-images\/default-\d+\.png/i.test(img);
}

// Rewrite any image on images.lumacdn.com through their cdn-cgi resizer at a
// canonical high-res 16:9 crop so self-hosted copies stay crisp in heroes.
export function canonicalLumaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const u = url.startsWith('http') ? url : `https:${url}`;
  if (!/images\.lumacdn\.com/.test(u)) return u;
  const m = u.match(/^https:\/\/images\.lumacdn\.com\/(?:cdn-cgi\/image\/[^/]+\/)?(.+)$/);
  if (!m || !m[1]) return u;
  return `https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=85,width=1600,height=900/${m[1]}`;
}

export function safeFileStem(id) {
  const base = (id || 'event')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  return base || 'event';
}

function extensionOf(url) {
  const m = /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.exec(url);
  if (m && m[1].toLowerCase() === 'jpeg') return 'jpg';
  return m ? m[1].toLowerCase() : 'jpg';
}

export function localCoverPath(event, eventsDir) {
  const hash = crypto
    .createHash('md5')
    .update(`${event.id || ''}|${event.url || ''}|${event.startDate || ''}`)
    .digest('hex')
    .slice(0, 8);
  return `/events/${safeFileStem(event.id)}-${hash}.${extensionOf(event.coverImage || '')}`;
}

function looksLikeImage(bytes, contentType) {
  if (contentType && /^image\//i.test(contentType)) return true;
  const sig = bytes[0];
  return (
    sig === 0xff || // JPEG
    (sig === 0x89 && bytes[1] === 0x50) || // PNG
    (bytes[0] === 0x77 && bytes[1] === 0x45) || // WebP
    (sig === 0x47 && bytes[1] === 0x49) // GIF
  );
}

// Download a remote cover image to public/events and return the local path.
// Returns null on failure, 'rate_limited' if Luma throttled us (retry later).
export async function downloadCover(event, eventsDir, log = () => {}) {
  if (!event.coverImage || !event.coverImage.startsWith('http')) return null;
  const local = localCoverPath(event, eventsDir);
  const dest = path.join(eventsDir, path.basename(local));
  if (fs.existsSync(dest)) {
    const stale = Date.now() - fs.statSync(dest).mtimeMs > 7 * 24 * 60 * 60 * 1000;
    if (!stale) return local;
  }

  const url = canonicalLumaUrl(event.coverImage);

  for (let attempt = 0; attempt < 5; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let res;
    try {
      res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*' },
        signal: controller.signal,
        redirect: 'follow',
      });
    } catch {
      clearTimeout(timeout);
      return null;
    }
    clearTimeout(timeout);

    if (res.status === 429) {
      if (attempt === 4) {
        log(`⏳ Rate limited (429), deferring: ${event.name}`);
        return 'rate_limited';
      }
      await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 10_000) {
      log(`✗ Too small/suspect (${buf.length}b): ${event.name}`);
      return null;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!looksLikeImage(buf, contentType)) return null;

    fs.mkdirSync(eventsDir, { recursive: true });
    fs.writeFileSync(dest, buf);
    log(`  ✓ Saved ${path.basename(dest)} (${Math.round(buf.length / 1024)}KB) ${event.name}`);
    return local;
  }
  return null;
}

export async function enrichLocalCovers(events, { eventsDir, concurrency = 6, log = console.log } = {}) {
  if (!fs.existsSync(eventsDir)) fs.mkdirSync(eventsDir, { recursive: true });
  const candidates = events.filter((e) => e.coverImage && e.coverImage.startsWith('http'));
  let okCount = 0;
  let rateLimited = 0;
  let failed = 0;
  for (let i = 0; i < candidates.length; i += concurrency) {
    const batch = candidates.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (e) => {
        const r = await downloadCover(e, eventsDir, log);
        if (r === 'rate_limited') return 'rate_limited';
        if (typeof r === 'string') {
          e.coverImage = r;
          return 'ok';
        }
        return 'failed';
      })
    );
    for (const r of results) {
      if (r === 'ok') okCount++;
      else if (r === 'rate_limited') rateLimited++;
      else failed++;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return { okCount, rateLimited, failed };
}