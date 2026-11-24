#!/usr/bin/env tsx
/**
 * When official pages scrape below the publish threshold, apply curator-written
 * summaries from thin-grant-expansions.ts (never auto-run from full editorial polish).
 *
 * Usage: npx tsx scripts/apply-thin-grant-fallback.ts [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords, GRANT_DETAIL_MIN_WORDS } from '../src/lib/grant-editorial';
import { thinGrantExpansions } from './thin-grant-expansions';

const GRANTS_PATH = path.join(process.cwd(), 'content/grants/grants.json');
const apply = process.argv.includes('--apply');

const grants: GrantProgram[] = JSON.parse(fs.readFileSync(GRANTS_PATH, 'utf-8'));
let touched = 0;

for (const grant of grants) {
  const words = countStoredGrantWords(grant);
  if (words >= GRANT_DETAIL_MIN_WORDS) continue;
  const patch = thinGrantExpansions[grant.id];
  if (!patch) continue;
  Object.assign(grant, patch);
  grant.descriptionSource = {
    url: grant.url,
    fetchedAt: new Date().toISOString(),
    wordCount: countStoredGrantWords(grant),
    method: 'curated-official-summary',
    pageTitle: grant.name,
  };
  touched++;
  console.log(`${grant.id}: applied curated fallback (${countStoredGrantWords(grant)} words)`);
}

console.log(`Thin fallback applied to ${touched} grants.`);
if (apply) {
  fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(grants, null, 2)}\n`);
} else {
  console.log('Dry run — pass --apply to write.');
}