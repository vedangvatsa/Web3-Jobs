/**
 * Remove self-hosted files under public/events/ that no event in the catalog references.
 */
import * as fs from 'fs';
import * as path from 'path';
import { collectLiveEventCoverBasenames } from './lib/event-cover-refs';

const EVENTS_DIR = path.join(process.cwd(), 'public', 'events');

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const live = await collectLiveEventCoverBasenames();

  if (!fs.existsSync(EVENTS_DIR)) {
    console.log('[prune-stale-event-covers] public/events missing — nothing to do');
    return;
  }

  let removed = 0;
  let removedBytes = 0;

  for (const name of fs.readdirSync(EVENTS_DIR)) {
    if (name.endsWith('.md')) continue;
    if (live.has(name)) continue;
    const abs = path.join(EVENTS_DIR, name);
    const stat = fs.statSync(abs);
    if (!stat.isFile()) continue;
    removedBytes += stat.size;
    removed += 1;
    if (!dryRun) fs.unlinkSync(abs);
  }

  const mode = dryRun ? 'dry-run' : 'applied';
  console.log(
    `[prune-stale-event-covers] ${mode}: would remove ${removed} file(s) (${(removedBytes / 1e6).toFixed(1)} MB); live covers=${live.size}`,
  );
  if (dryRun && removed > 0) process.exitCode = 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
