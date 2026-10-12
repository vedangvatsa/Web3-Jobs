import { createHash } from 'node:crypto';
import type { Job } from '../../src/types';
import { extractBreezyPostingDate } from '../../src/lib/breezy-posting-date';

export async function fetchBreezyPrimaryDate(job: Job, request: typeof fetch = fetch) {
  try {
    const checkedAt = new Date().toISOString();
    const response = await request(job.link, { signal: AbortSignal.timeout(15000) });
    if (!response.ok || !/text\/html|application\/xhtml\+xml/i.test(response.headers.get('content-type') || '')) return null;
    const html = await response.text();
    if (Buffer.byteLength(html) > 2 * 1024 * 1024) return null;
    return extractBreezyPostingDate(job, html, {
      url: response.url || job.link, checkedAt,
      bodySha256: createHash('sha256').update(html).digest('hex'),
    });
  } catch { return null; }
}
