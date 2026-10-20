import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import type { Web3Event } from '../src/lib/events';
import { hasEventEnded } from './lib/event-dates.mjs';
import { buildEventsListing } from '../src/lib/events-listing-build';

type GrammarRecord = {
  id: string;
  slug: string;
  beforeSha256: string;
  afterSha256: string;
  beforeDescription: string;
  changes: Array<{ before: string; after: string; reason: string }>;
  facts: Omit<Web3Event, 'description' | 'descriptionSource'>;
};

async function main() {
  const audit = JSON.parse(fs.readFileSync('content/events/grammar-review-2026-10-20.json', 'utf8')) as { reviewed: number; reviewedIds: string[]; records: GrammarRecord[] };
  const runtime = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const rebuilt = await buildEventsListing();
  const hash = (s: string) => createHash('sha256').update(s).digest('hex');
  const numbers = (s: string) => s.match(/\d+(?:[.,:/]\d+)*/g) || [];
  const urls = (s: string) => s.match(/https?:\/\/[^\s)\]]+/g) || [];
  assert.equal(new Set(audit.reviewedIds).size, audit.reviewed);
  let checked = 0;
  for (const record of audit.records) {
    assert.ok(audit.reviewedIds.includes(record.id));
    assert.equal(hash(record.beforeDescription), record.beforeSha256, `${record.slug}: original copy audit`);
    let expected = record.beforeDescription;
    for (const edit of record.changes) {
      assert.equal(expected.split(edit.before).length, 2, `${record.slug}: exact, non-global correction`);
      assert.ok(edit.reason);
      expected = expected.replace(edit.before, edit.after);
    }
    assert.equal(hash(expected), record.afterSha256, `${record.slug}: only approved corrections`);
    assert.deepEqual(numbers(expected), numbers(record.beforeDescription), `${record.slug}: dates, prices and quantities`);
    assert.deepEqual(urls(expected), urls(record.beforeDescription), `${record.slug}: URLs`);
    if (hasEventEnded(record.facts)) continue;
    const event = runtime.find(e => e.id === record.id);
    assert.ok(event, `${record.slug}: current page missing`);
    assert.equal(event.description, expected, `${record.slug}: corrected copy reaches runtime`);
    assert.equal(rebuilt.find(e => e.id === record.id)?.description, expected, `${record.slug}: correction survives regeneration`);
    assert.equal(event.descriptionSource?.sha256, record.afterSha256, `${record.slug}: provenance digest`);
    const { description: _description, descriptionSource: _provenance, ...facts } = event;
    assert.deepEqual(facts, record.facts, `${record.slug}: structured event facts changed during copyediting`);
    checked++;
  }
  const ibw = runtime.find(e => e.slug === 'ibw');
  if (ibw) {
    assert.match(ibw.description, /2026 speaker lineup includes:/);
    assert.match(ibw.description, /Ronak Jethava, UAE head at Startale Group/);
    assert.match(ibw.description, /GM and co-founder of the Monad Foundation/);
    assert.match(ibw.description, /VP of growth at the NEAR Foundation/);
  }
  console.log(`Grammar review: ${audit.reviewed} descriptions audited; ${checked} current corrected pages preserve all structured facts, numbers and URLs.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
