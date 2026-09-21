import * as fs from 'fs';
import * as path from 'path';
import { collectLiveEventCoverBasenames } from './lib/event-cover-refs';

async function main(): Promise<void> {
  const live = await collectLiveEventCoverBasenames();
  const dir = path.join(process.cwd(), 'public', 'events');
  if (!fs.existsSync(dir)) {
    console.log('[test-prune-stale-event-covers] no public/events — skip');
    return;
  }

  const stale: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.endsWith('.md')) continue;
    if (live.has(name)) continue;
    stale.push(name);
  }

  if (stale.length > 0) {
    console.error(
      `[test-prune-stale-event-covers] ${stale.length} stale cover(s). Run: npx tsx scripts/prune-stale-event-covers.ts`,
    );
    for (const name of stale.slice(0, 20)) console.error(`  - ${name}`);
    if (stale.length > 20) console.error(`  … and ${stale.length - 20} more`);
    process.exit(1);
  }

  const missingOnDisk: string[] = [];
  for (const base of live) {
    if (!fs.existsSync(path.join(dir, base))) missingOnDisk.push(base);
  }
  if (missingOnDisk.length > 0) {
    console.error(
      `[test-prune-stale-event-covers] ${missingOnDisk.length} live cover(s) missing on disk. Run: npx tsx scripts/backfill-missing-event-covers.ts`,
    );
    for (const name of missingOnDisk.slice(0, 15)) console.error(`  - ${name}`);
    if (missingOnDisk.length > 15) console.error(`  … and ${missingOnDisk.length - 15} more`);
    process.exit(1);
  }

  console.log(`[test-prune-stale-event-covers] OK — ${live.size} live cover(s), no stale files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
