#!/usr/bin/env tsx
/**
 * Strip spam, editorial padding, and thin-fabricated grant bodies, then re-fetch from official URLs.
 *
 * Usage:
 *   npx tsx scripts/replace-fabricated-grant-bodies.ts [--apply] [--skip-enrich]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import type { GrantProgram } from '../src/types';
import {
  grantNeedsSourceRefetch,
  stripGrantEditorialPadding,
  stripGrantGenericApplyBoilerplate,
} from '../src/lib/grant-source-quality';
import { thinGrantExpansions } from './thin-grant-expansions';

const GRANTS_PATH = path.join(process.cwd(), 'content', 'grants', 'grants.json');
const apply = process.argv.includes('--apply');
const skipEnrich = process.argv.includes('--skip-enrich');

const thinFirstParagraphById: Record<string, string | undefined> = {};
for (const [id, patch] of Object.entries(thinGrantExpansions)) {
  thinFirstParagraphById[id] = patch.sections?.[0]?.paragraphs?.[0];
}

const grants: GrantProgram[] = JSON.parse(fs.readFileSync(GRANTS_PATH, 'utf-8'));
let stripped = 0;

for (const grant of grants) {
  const reasons = grantNeedsSourceRefetch(grant, thinFirstParagraphById);
  if (!reasons.length) continue;

  stripGrantEditorialPadding(grant);
  stripGrantGenericApplyBoilerplate(grant);
  grant.sections = [];
  if (grant.descriptionSource) {
    grant.descriptionSource = {
      ...grant.descriptionSource,
      wordCount: 0,
      method: 'listing-summary-pending-refetch',
    };
  }
  stripped++;
  console.log(`${grant.id}: cleared (${reasons.join(', ')})`);
}

console.log(`Prepared ${stripped} grants for source re-fetch.`);

if (!apply) {
  console.log('Dry run — pass --apply to write and enrich.');
  process.exit(0);
}

fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(grants, null, 2)}\n`);

if (!skipEnrich) {
  execSync(
    'npx tsx scripts/enrich-grants-from-sources.ts --apply --refresh --force-replace --pending-refetch --concurrency=8',
    { stdio: 'inherit' },
  );
}