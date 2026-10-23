import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { lumaSourcePatch, object } from './luma-source-record';
import type { Web3Event } from '../src/lib/events';

async function main() {
  const report = JSON.parse(fs.readFileSync('content/events/ibw-sheet-audit-2026-10-23.json', 'utf8')) as { entries: Array<{ row: number; status: string; url: string | null }> };
  const runtime = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const results: Array<Record<string, unknown>> = [];
  for (const row of report.entries.filter(row => row.status === 'needs-review' && row.url)) {
    const response = await fetch(row.url!, { signal: AbortSignal.timeout(30_000) });
    const html = await response.text();
    const fetchedAt = new Date().toISOString();
    const $ = load(html);
    const raw = $('#__NEXT_DATA__').text();
    const initial = raw ? object(object(object(object(JSON.parse(raw)).props).pageProps).initialData) : {};
    const data = object(initial.data);
    const event = object(data.event);
    const patch = response.ok && event.api_id ? lumaSourcePatch({ url: row.url!, fetchedAt, method: 'luma-page', data }) : null;
    const publicPatch = patch?.visibility === 'private' ? { name: patch.name, visibility: patch.visibility, sourceVerification: patch.sourceVerification } : patch;
    const result = { row: row.row, url: row.url, finalUrl: response.url, status: response.status, fetchedAt, htmlSha256: createHash('sha256').update(html).digest('hex'), pageTitle: $('title').text(), eventId: event.api_id || null, published: runtime.filter(item => event.api_id && item.sourceVerification?.eventId === event.api_id).map(item => ({ id: item.id, slug: item.slug })), patch: publicPatch };
    results.push(result);
    console.log(JSON.stringify(result, null, 2));
    await new Promise(resolve => setTimeout(resolve, 350));
  }
  fs.writeFileSync('content/events/ibw-sheet-source-checks-2026-10-23.json', JSON.stringify(results, null, 2) + '\n');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
