import { setTimeout as delay } from 'node:timers/promises';

export async function checkNewsSourceLinks(urls, { fetchFn = fetch, wait = delay, timeoutMs = 15000 } = {}) {
  const errors = [];
  for (const url of urls) {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/.test(parsed.hostname)) throw new Error('Invalid source URL');
    } catch { errors.push(`Source link unavailable: ${url}`); continue; }
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetchFn(url, { headers: { 'User-Agent': 'HashtagWeb3NewsBot/1.0 (+https://hashtagweb3.com)' }, signal: AbortSignal.timeout(timeoutMs) });
        await response.body?.cancel().catch(() => {});
        if (response.status === 200) break;
        const retryAfter = response.headers.get('retry-after');
        const retryMs = retryAfter ? (/^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now()) : 0;
        if (attempt === 1 || ![500, 502, 503, 504].includes(response.status) || (retryAfter && (!Number.isFinite(retryMs) || retryMs > 1000))) {
          errors.push(`Source link HTTP ${response.status}: ${url}`); break;
        }
      } catch {
        if (attempt === 1) { errors.push(`Source link unavailable: ${url}`); break; }
      }
      await wait(1000);
    }
  }
  return errors;
}
