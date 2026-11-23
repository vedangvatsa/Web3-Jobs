/**
 * Archive grants that are not accepting new applications.
 *
 * Usage: npx tsx scripts/prune-closed-grants.ts [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import type { GrantProgram } from '../src/types';
import { grantApplicationStatus } from './lib/grant-application-status';
import type { RemovedGrantListing } from './verify-grant-liveness';

const GRANTS_PATH = path.join(process.cwd(), 'content', 'grants', 'grants.json');
const REMOVED_PATH = path.join(process.cwd(), 'content', 'grants', 'removed-grants.json');

const apply = process.argv.includes('--apply');

function loadRemoved(): Record<string, RemovedGrantListing> {
  if (!fs.existsSync(REMOVED_PATH)) return {};
  return JSON.parse(fs.readFileSync(REMOVED_PATH, 'utf-8')) as Record<string, RemovedGrantListing>;
}

function main() {
  const grants: GrantProgram[] = JSON.parse(fs.readFileSync(GRANTS_PATH, 'utf-8'));
  const closed = grants
    .map((g) => ({ grant: g, status: grantApplicationStatus(g) }))
    .filter((x): x is { grant: GrantProgram; status: { ok: false; reason: string } } => !x.status.ok);

  console.log(`Grants not accepting applications: ${closed.length}`);
  for (const { grant, status } of closed) {
    console.log(`  ${grant.id} (${status.reason})`);
  }

  if (!apply) {
    console.log('\nRe-run with --apply to archive to content/grants/removed-grants.json');
    return;
  }

  const removed = loadRemoved();
  const removedAt = new Date().toISOString();
  const ids = new Set(closed.map((c) => c.grant.id));
  const kept = grants.filter((g) => !ids.has(g.id));

  for (const { grant, status } of closed) {
    removed[grant.id] = {
      removedAt,
      reason: 'program-closed',
      url: grant.url,
      name: grant.name,
      grant: { ...grant, ...(status.ok ? {} : {}) },
    };
    // stash status reason in archived name note via console only; grant snapshot is full record
  }

  fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(kept, null, 2)}\n`);
  fs.writeFileSync(REMOVED_PATH, `${JSON.stringify(removed, null, 2)}\n`);
  console.log(`Kept ${kept.length} grants. Run: npx tsx scripts/generate-slug-types.ts`);
}

main();