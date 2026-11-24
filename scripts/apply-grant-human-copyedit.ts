#!/usr/bin/env tsx
/**
 * Conservative line-level copyedit (typography/filler), not full rewrite.
 * Usage: npx tsx scripts/apply-grant-human-copyedit.ts [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import grants from '../content/grants/grants.json';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords } from '../src/lib/grant-editorial';
import { copyeditGrantProgram } from '../src/lib/grant-editorial-copyedit';

const GRANTS_PATH = path.join(process.cwd(), 'content/grants/grants.json');
const STATUS_PATH = path.join(process.cwd(), 'content/grants/copyedit-status.json');
const apply = process.argv.includes('--apply');

const original = grants as GrantProgram[];
const status: Record<string, { reviewedAt: string; method: string }> = {};
const reviewedAt = new Date().toISOString();

const updated = original.map((g) => {
  const before = countStoredGrantWords(g);
  const next = copyeditGrantProgram(g);
  const after = countStoredGrantWords(next);
  if (after >= before - 2) {
    status[g.id] = { reviewedAt, method: 'line-polish-v1' };
    if (next.descriptionSource) {
      next.descriptionSource.wordCount = after;
      next.descriptionSource.fetchedAt = reviewedAt;
    }
    return next;
  }
  return g;
});

console.log(`Line polish applied to ${Object.keys(status).length}/${original.length} grants.`);

if (apply) {
  fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(updated, null, 2)}\n`);
  fs.writeFileSync(STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`);
  console.log(`Wrote ${GRANTS_PATH}`);
  console.log(`Wrote ${STATUS_PATH}`);
}