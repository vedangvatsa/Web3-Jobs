#!/usr/bin/env tsx
/**
 * Re-apply human grammar-review corrections to source catalogs (curated + reviewed patches).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import type { Web3Event } from '../src/lib/events';
import { touchEventDescriptionProvenance } from './lib/update-description-sha256';

const GRAMMAR_REVIEW_PATH = path.join(process.cwd(), 'content/events/grammar-review-2026-10-20.json');
const CURATED_PATH = path.join(process.cwd(), 'content/events/sources/curated-events.json');
const REVIEWED_PATH = path.join(process.cwd(), 'content/events/catalog-reviewed-descriptions.json');
const apply = process.argv.includes('--apply');

type GrammarReview = {
  records: Array<{
    id: string;
    beforeDescription: string;
    changes: Array<{ before: string; after: string }>;
  }>;
};

function expectedFromRecord(record: GrammarReview['records'][number]): string {
  let expected = record.beforeDescription;
  for (const edit of record.changes) {
    expected = expected.replace(edit.before, edit.after);
  }
  return expected;
}

function main(): void {
  const audit = JSON.parse(fs.readFileSync(GRAMMAR_REVIEW_PATH, 'utf8')) as GrammarReview;
  const expectedById = new Map(audit.records.map((r) => [r.id, expectedFromRecord(r)]));

  let touched = 0;
  if (fs.existsSync(CURATED_PATH)) {
    const events = JSON.parse(fs.readFileSync(CURATED_PATH, 'utf8')) as Web3Event[];
    let curatedTouched = 0;
    for (let i = 0; i < events.length; i += 1) {
      const expected = expectedById.get(events[i].id);
      if (!expected || events[i].description === expected) continue;
      events[i] = touchEventDescriptionProvenance(events[i], expected);
      curatedTouched += 1;
    }
    touched += curatedTouched;
    if (apply && curatedTouched > 0) {
      fs.writeFileSync(CURATED_PATH, `${JSON.stringify(events, null, 2)}\n`);
    }
  }

  for (const source of EVENT_SOURCES) {
    const filePath = path.join(process.cwd(), 'content/events/sources', source.file);
    const events = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Web3Event[];
    let sourceTouched = 0;
    for (let i = 0; i < events.length; i += 1) {
      const expected = expectedById.get(events[i].id);
      if (!expected || events[i].description === expected) continue;
      events[i] = touchEventDescriptionProvenance(events[i], expected);
      sourceTouched += 1;
    }
    touched += sourceTouched;
    if (apply && sourceTouched > 0) {
      fs.writeFileSync(filePath, `${JSON.stringify(events, null, 2)}\n`);
    }
  }

  if (fs.existsSync(REVIEWED_PATH)) {
    const reviewed = JSON.parse(fs.readFileSync(REVIEWED_PATH, 'utf8')) as Record<string, Partial<Web3Event>>;
    for (const [id, expected] of expectedById) {
      const patch = reviewed[id];
      if (!patch?.description || patch.description === expected) continue;
      reviewed[id] = {
        ...patch,
        description: expected,
        descriptionSource: patch.descriptionSource
          ? { ...patch.descriptionSource, sha256: createHash('sha256').update(expected).digest('hex') }
          : patch.descriptionSource,
      };
      touched += 1;
    }
    if (apply) fs.writeFileSync(REVIEWED_PATH, `${JSON.stringify(reviewed, null, 2)}\n`);
  }

  console.log(`Grammar-reviewed descriptions: ${touched} patches${apply ? ' applied' : ' (dry run)'}.`);
}

main();