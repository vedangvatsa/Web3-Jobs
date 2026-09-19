/**
 * Ensures every slug ever posted to Telegram redirects or resolves (legacy archive).
 *
 * Usage: npx tsx scripts/backfill-telegram-legacy-slugs.ts
 */
import fs from 'fs';
import path from 'path';
import { resolveJobSlug } from '../src/lib/job-guides';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';

const root = process.cwd();

function collectTelegramLogs(): Record<string, { slugs?: string[]; lastSlug?: string }> {
  const merged: Record<string, { slugs?: string[]; lastSlug?: string }> = {};
  for (const name of fs.readdirSync(root)) {
    if (!name.startsWith('.telegram-job-urls-') || !name.endsWith('.json')) continue;
    const raw = JSON.parse(fs.readFileSync(path.join(root, name), 'utf-8')) as typeof merged;
    Object.assign(merged, raw);
  }
  return merged;
}

async function main() {
  const archive = loadJobLegacyArchive();
  const log = collectTelegramLogs();
  let added = 0;

  for (const entry of Object.values(log)) {
    const slugs = [...new Set([...(entry.slugs || []), entry.lastSlug].filter(Boolean))] as string[];
    if (slugs.length === 0) continue;

    let canonical: string | null = null;
    for (const candidate of [...slugs].reverse()) {
      const resolution = await resolveJobSlug(candidate);
      if (resolution.job && resolution.kind === 'exact') {
        canonical = resolution.canonicalSlug || resolution.job.slug || candidate;
        break;
      }
    }

    for (const slug of slugs) {
      const clean = slug.toLowerCase().trim();
      const resolution = await resolveJobSlug(clean);
      if (resolution.job) continue;
      if (archive[clean]) continue;

      if (canonical && canonical !== clean) {
        archive[clean] = { newSlug: canonical };
        added += 1;
        continue;
      }

      archive[clean] = {
        title: 'Web3 Opportunity',
        company: 'Web3 Company',
        link: 'https://hashtagweb3.com/jobs',
      };
      added += 1;
    }
  }

  if (added > 0) {
    writeJobLegacyArchive(archive);
  }
  console.log(`[backfill-telegram-legacy-slugs] added ${added} archive entries`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
