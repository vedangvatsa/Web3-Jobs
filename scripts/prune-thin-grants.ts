/**
 * Remove published grants that do not meet stored-word minimums.
 *
 * Usage: npx tsx scripts/prune-thin-grants.ts [--apply] [--min-words=120]
 */
import fs from 'node:fs';
import path from 'node:path';
import type { GrantProgram } from '../src/types';
import { countStoredGrantWords, GRANT_DETAIL_MIN_WORDS } from '../src/lib/grant-editorial';
import type { RemovedGrantListing } from './verify-grant-liveness';

const GRANTS_PATH = path.join(process.cwd(), 'content', 'grants', 'grants.json');
const REMOVED_PATH = path.join(process.cwd(), 'content', 'grants', 'removed-grants.json');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const minArg = args.find((a) => a.startsWith('--min-words='));
const minWords = minArg ? Number(minArg.split('=')[1]) || GRANT_DETAIL_MIN_WORDS : GRANT_DETAIL_MIN_WORDS;

function loadRemoved(): Record<string, RemovedGrantListing> {
  if (!fs.existsSync(REMOVED_PATH)) return {};
  return JSON.parse(fs.readFileSync(REMOVED_PATH, 'utf-8')) as Record<string, RemovedGrantListing>;
}

function main() {
  const grants: GrantProgram[] = JSON.parse(fs.readFileSync(GRANTS_PATH, 'utf-8'));
  const thin = grants.filter((g) => {
    const words = countStoredGrantWords(g);
    const banned =
      g.descriptionSource?.method === 'listing-description-live-url' ||
      g.descriptionSource?.method === 'listing-summary-unverified-fetch';
    return words < minWords || banned;
  });

  console.log(`Thin / listing-only grants: ${thin.length} (min ${minWords} stored words)`);
  if (thin.length) console.log(thin.map((g) => `${g.id} (${countStoredGrantWords(g)}w)`).join(', '));

  if (!apply) {
    console.log('\nRe-run with --apply to archive them in content/grants/removed-grants.json');
    return;
  }

  const removed = loadRemoved();
  const removedAt = new Date().toISOString();
  const thinIds = new Set(thin.map((g) => g.id));
  const kept = grants.filter((g) => !thinIds.has(g.id));

  for (const grant of thin) {
    removed[grant.id] = {
      removedAt,
      reason: 'thin-content',
      url: grant.url,
      name: grant.name,
      grant: { ...grant },
    };
  }

  fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(kept, null, 2)}\n`);
  fs.writeFileSync(REMOVED_PATH, `${JSON.stringify(removed, null, 2)}\n`);
  console.log(`Kept ${kept.length} grants; archived ${thin.length}. Run: npx tsx scripts/generate-slug-types.ts`);
}

main();