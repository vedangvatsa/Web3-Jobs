import fs from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import type { Web3Event } from '../src/lib/events';
import { canImportEvent } from './lib/event-retention.mjs';
import tombstones from '../content/event-tombstones.json';

type Review = { decision: string; slug?: string; title?: string; description?: string; note: string; overrides?: Partial<Web3Event> };
type Check = { row: number; url: string; status: number; fetchedAt: string; htmlSha256: string; pageTitle: string; eventId: string; patch: Partial<Web3Event> | null };
const hash = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const write = (file: string, data: unknown) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

async function main() {
  const reviews = JSON.parse(fs.readFileSync('content/events/ibw-sheet-review-2026-10-23.json', 'utf8')) as Record<string, Review>;
  const checksFile = 'content/events/ibw-sheet-source-checks-2026-10-23.json';
  const checks = JSON.parse(fs.readFileSync(checksFile, 'utf8')) as Check[];
  for (const check of checks) if (check.patch?.visibility === 'private') check.patch = { name: check.patch.name, visibility: 'private', sourceVerification: check.patch.sourceVerification };
  write(checksFile, checks);
  fs.mkdirSync('.cache/ibw-sheet-2026-10-23', { recursive: true });
  if (!fs.existsSync('.cache/ibw-sheet-2026-10-23/runtime-before.json')) fs.copyFileSync('content/events-runtime.json', '.cache/ibw-sheet-2026-10-23/runtime-before.json');
  const destination = 'content/events/sources/ibw-side-events.json';
  const stored = JSON.parse(fs.readFileSync(destination, 'utf8')) as Web3Event[];
  const imageReceipts: Array<Record<string, unknown>> = [];
  for (const check of checks) {
    const review = reviews[String(check.row)];
    if (review?.decision !== 'add') continue;
    assert.equal(check.status, 200);
    assert.equal(check.patch?.visibility, 'public');
    assert.ok(review.description && review.slug && review.title && check.patch?.startDate && check.eventId);
    const id = `ibw-sheet-${check.eventId}`;
    assert.ok(!stored.some(event => event.id !== id && event.sourceVerification?.eventId === check.eventId), 'Preserve any existing identity');
    let event: Web3Event = { ...check.patch, ...review.overrides, id, name: review.title, description: review.description, slug: review.slug, url: check.url, location: check.patch.location!, startDate: check.patch.startDate!, source: 'curated-reviewed', sideEventFor: ['ibw', 'devcon'], descriptionSource: { url: check.url, fetchedAt: check.fetchedAt, method: 'reviewed-primary-sources', pageTitle: check.pageTitle, sha256: hash(review.description), evidence: [{ url: check.url, fetchedAt: check.fetchedAt, sha256: check.htmlSha256, retrievedVia: 'Public primary HTTP response', representation: 'html' }] } };
    assert.ok(canImportEvent(event, tombstones), `Retention/hold prevents import: ${id}`);
    if (check.row === 33) event.ticketOffers = event.ticketOffers?.filter(ticket => ticket.name === 'Mumbai In-person Pickup');
    if (check.row === 34) event.ticketOffers = undefined;
    if (check.row === 41) { event.venueName = undefined; event.coordinates = undefined; }
    if (check.patch.coverImage) {
      const imageUrl = new URL(check.patch.coverImage);
      assert.equal(imageUrl.hostname, 'images.lumacdn.com');
      const response = await fetch(imageUrl, { signal: AbortSignal.timeout(30_000) });
      assert.ok(response.ok && response.headers.get('content-type')?.startsWith('image/'));
      const original = Buffer.from(await response.arrayBuffer());
      const optimized = await sharp(original).rotate().resize({ width: 1500, height: 1500, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
      const filename = `/events/${review.slug}-${hash(optimized).slice(0, 8)}.webp`;
      fs.writeFileSync(`public${filename}`, optimized);
      imageReceipts.push({ id, sourceUrl: imageUrl.href, fetchedAt: new Date().toISOString(), sourceSha256: hash(original), path: filename, sha256: hash(optimized), bytes: optimized.length });
      event.coverImage = filename;
    }
    const previous = stored.findIndex(row => row.id === id);
    if (previous < 0) stored.push(event); else stored[previous] = event;
    console.log(`${check.row}: ${event.name} -> /${event.slug}`);
  }
  write(destination, stored);
  write('content/events/ibw-sheet-images-2026-10-23.json', imageReceipts);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
