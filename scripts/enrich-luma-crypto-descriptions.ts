/**
 * Replace sync stub and thin descriptions across event JSON files with
 * authentic organiser copy extracted from Luma pages (including ProseMirror description_mirror).
 *
 * Usage:
 *   npx tsx scripts/enrich-luma-crypto-descriptions.ts [--dry-run] [--limit N]
 */
import fs from 'node:fs';
import path from 'node:path';
import { isThinEventListingDescription } from '../src/lib/event-editorial-facts';
import {
  fetchLumaOrganizerDescription,
  isLumaSyncStubDescription,
} from './luma-page-description';

const TARGET_FILES = [
  path.join('content', 'kbw-luma-events.json'),
  path.join('content', 'luma-crypto-events.json'),
  path.join('content', 'ibw-side-events.json'),
  path.join('content', 'india-luma-events.json'),
  path.join('content', 'curated-events.json'),
  path.join('content', 'token2049-side-events.json'),
];

type StoredEvent = {
  id: string;
  slug?: string;
  name: string;
  description: string;
  url: string;
};

function needsEnrichment(description: string): boolean {
  return isLumaSyncStubDescription(description) || isThinEventListingDescription(description);
}

async function enrichFile(filePath: string, dryRun: boolean, limit?: number) {
  if (!fs.existsSync(filePath)) return;
  const events = JSON.parse(fs.readFileSync(filePath, 'utf8')) as StoredEvent[];
  const targets = events.filter((e) => e.url && /luma\.com|lu\.ma/i.test(e.url) && needsEnrichment(e.description || ''));
  const work = limit ? targets.slice(0, limit) : targets;

  console.log(`\nProcessing ${filePath}: ${targets.length} candidates, processing ${work.length}`);

  let updated = 0;
  for (const event of work) {
    const slug = event.slug || event.id;
    const fetched = await fetchLumaOrganizerDescription(event.url);
    await new Promise((r) => setTimeout(r, 200));
    if (!fetched || fetched.length < 80) {
      console.log(`  skip /${slug} (no organiser copy found on ${event.url})`);
      continue;
    }
    if (fetched === event.description) continue;
    console.log(`  /${slug}  ${event.description?.length || 0} → ${fetched.length} chars`);
    if (!dryRun) event.description = fetched;
    updated++;
  }

  if (!dryRun && updated > 0) {
    fs.writeFileSync(filePath, `${JSON.stringify(events, null, 2)}\n`);
    console.log(`  Updated ${updated} events in ${filePath}`);
  } else {
    console.log(dryRun ? `  Dry run — would update ${updated} events` : `  No changes needed in ${filePath}`);
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;

  for (const file of TARGET_FILES) {
    await enrichFile(file, dryRun, limit);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
