/**
 * Ensures slugs shared on Telegram still resolve to a job page (live or legacy redirect).
 *
 * Usage: npx tsx scripts/verify-telegram-job-urls.ts
 */
import fs from 'fs';
import path from 'path';
import { resolveJobSlug } from '../src/lib/job-guides';

const root = process.cwd();

function collectTelegramSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const name of fs.readdirSync(root)) {
    if (!name.startsWith('.telegram-job-urls-') || !name.endsWith('.json')) continue;
    const raw = JSON.parse(fs.readFileSync(path.join(root, name), 'utf-8')) as Record<
      string,
      { slugs?: string[]; lastSlug?: string }
    >;
    for (const entry of Object.values(raw)) {
      for (const slug of entry.slugs || []) {
        if (slug) slugs.add(slug.toLowerCase());
      }
      if (entry.lastSlug) slugs.add(entry.lastSlug.toLowerCase());
    }
  }
  return slugs;
}

async function main() {
  const slugs = collectTelegramSlugs();
  if (slugs.size === 0) {
    console.log('No Telegram job URL log yet (.telegram-job-urls-*.json); skipping slug audit.');
    return;
  }

  const failures: string[] = [];
  for (const slug of slugs) {
    const resolution = await resolveJobSlug(slug);
    if (!resolution.job) {
      failures.push(slug);
    }
  }

  if (failures.length > 0) {
    console.error(`\n❌ ${failures.length} Telegram-shared slug(s) would 404:`);
    for (const slug of failures.slice(0, 40)) {
      console.error(`  - /${slug}`);
    }
    if (failures.length > 40) {
      console.error(`  … and ${failures.length - 40} more`);
    }
    process.exit(1);
  }

  console.log(`✅ All ${slugs.size} Telegram-logged job slug(s) resolve locally.`);
}

main();
