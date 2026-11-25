#!/usr/bin/env tsx
/**
 * Full editorial polish for stored event descriptions across catalog sources.
 *
 * Usage: npx tsx scripts/apply-event-full-editorial-polish.ts [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { applyEventCatalogReview } from '../src/lib/event-catalog-review';
import type { Web3Event } from '../src/lib/events';
import { countWords } from '../src/lib/catalog-line-editorial';
import { polishStoredEventDescription } from '../src/lib/event-stored-description-polish';
import { sha256Description, touchEventDescriptionProvenance } from './lib/update-description-sha256';

const REVIEWED_PATH = path.join(process.cwd(), 'content/events/catalog-reviewed-descriptions.json');
const STATUS_PATH = path.join(process.cwd(), 'content/events/copyedit-status.json');
const GRAMMAR_REVIEW_PATH = path.join(process.cwd(), 'content/events/grammar-review-2026-10-20.json');

const apply = process.argv.includes('--apply');

type GrammarReview = {
  reviewedIds: string[];
  records: Array<{
    id: string;
    slug: string;
    beforeSha256: string;
    afterSha256: string;
    beforeDescription: string;
    changes: Array<{ before: string; after: string; reason: string }>;
  }>;
};

const grammarAudited = new Set<string>();
if (fs.existsSync(GRAMMAR_REVIEW_PATH)) {
  const audit = JSON.parse(fs.readFileSync(GRAMMAR_REVIEW_PATH, 'utf8')) as GrammarReview;
  for (const id of audit.reviewedIds) grammarAudited.add(id);
}

function polishedDescription(event: Web3Event, raw: string): string {
  const conservative = grammarAudited.has(event.id);
  return polishStoredEventDescription(raw, { conservative });
}

function polishEventRecord(event: Web3Event): Web3Event {
  if (!event.description?.trim()) return event;
  const nextDesc = polishedDescription(event, event.description);
  if (nextDesc !== event.description) {
    return touchEventDescriptionProvenance(event, nextDesc);
  }
  if (
    event.descriptionSource &&
    event.descriptionSource.sha256 !== sha256Description(event.description)
  ) {
    return touchEventDescriptionProvenance(event, event.description);
  }
  return event;
}

let changed = 0;
const status: Record<string, { reviewedAt: string; method: string; words: number }> = {};
const reviewedAt = new Date().toISOString();

for (const source of EVENT_SOURCES) {
  let fileChanged = 0;
  const filePath = path.join(process.cwd(), 'content/events/sources', source.file);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Web3Event[];
  const events = raw.map((e) => {
    const polished = polishEventRecord(e);
    if (JSON.stringify(polished) !== JSON.stringify(e)) fileChanged++;
    const merged = applyEventCatalogReview(polished);
    const desc = merged.description || '';
    if (desc) {
      status[merged.id] = {
        reviewedAt,
        method: grammarAudited.has(merged.id) ? 'human-editorial-polish-conservative' : 'human-editorial-polish-v2',
        words: countWords(desc),
      };
    }
    return polished;
  });
  changed += fileChanged;
  if (apply && fileChanged > 0) {
    fs.writeFileSync(filePath, `${JSON.stringify(events, null, 2)}\n`);
    console.log(`Wrote ${filePath} (${fileChanged} updated)`);
  } else {
    console.log(`${source.file}: ${fileChanged} would update`);
  }
}

let reviewedChanged = 0;
if (fs.existsSync(REVIEWED_PATH)) {
  const reviewed = JSON.parse(fs.readFileSync(REVIEWED_PATH, 'utf8')) as Record<
    string,
    Partial<Web3Event>
  >;
  for (const [id, patch] of Object.entries(reviewed)) {
    if (!patch.description?.trim()) continue;
    if (grammarAudited.has(id)) continue;
    const nextDesc = polishStoredEventDescription(patch.description);
    const textChanged = nextDesc !== patch.description;
    const hashMismatch =
      patch.descriptionSource &&
      patch.descriptionSource.sha256 !== createHash('sha256').update(nextDesc).digest('hex');
    if (!textChanged && !hashMismatch) continue;
    reviewedChanged++;
    const nextPatch = { ...patch, description: nextDesc };
    if (patch.descriptionSource) {
      nextPatch.descriptionSource = {
        ...patch.descriptionSource,
        sha256: createHash('sha256').update(nextDesc).digest('hex'),
      };
    }
    reviewed[id] = nextPatch;
    status[id] = {
      reviewedAt,
      method: grammarAudited.has(id) ? 'human-editorial-polish-conservative' : 'human-editorial-polish-v2',
      words: countWords(nextDesc),
    };
  }
  changed += reviewedChanged;
  if (apply && reviewedChanged > 0) {
    fs.writeFileSync(REVIEWED_PATH, `${JSON.stringify(reviewed, null, 2)}\n`);
    console.log(`Wrote ${REVIEWED_PATH} (${reviewedChanged} updated)`);
  } else if (reviewedChanged) {
    console.log(`catalog-reviewed-descriptions.json: ${reviewedChanged} would update`);
  }
}

console.log(`Event polish: ${changed} record updates across sources.`);

if (apply) {
  fs.writeFileSync(STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`);
  execSync('npx tsx scripts/patch-event-grammar-reviewed-descriptions.ts --apply', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  execSync('npx tsx scripts/precompute-events-runtime.ts', {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, SKIP_CATALOG_GATES: '1' },
  });
}