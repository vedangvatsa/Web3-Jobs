#!/usr/bin/env tsx
/**
 * Fetch Ashby organization metadata and upsert ashby-employer-identities.json.
 * Usage: npx tsx scripts/bootstrap-ashby-identities-batch.ts board:Company board2:Company2 ...
 */
import fs from 'node:fs';
import { atsBoardKey } from '../src/lib/ats-board-identity';

type Identity = {
  companies: string[];
  organizationId: string | null;
  owner: string | null;
  website: string | null;
};

type AshbyOrg = {
  name?: string;
  publicWebsite?: string;
  organizationId?: string;
  hostedJobsPageSlug?: string;
};

async function fetchOrg(board: string): Promise<AshbyOrg | null> {
  const res = await fetch(`https://jobs.ashbyhq.com/${encodeURIComponent(board)}`, {
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) return null;
  const match = (await res.text()).match(/window\.__appData\s*=\s*(\{[^\n\r]*\});/);
  if (!match) return null;
  return (JSON.parse(match[1]) as { organization?: AshbyOrg }).organization || null;
}

async function main() {
  const pairs = process.argv.slice(2);
  if (!pairs.length) throw new Error('Pass board:Company pairs');

  const file = 'content/ashby-employer-identities.json';
  const identities = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, Identity>;

  for (const pair of pairs) {
    const [board, company] = pair.split(':');
    if (!board || !company) continue;
    const org = await fetchOrg(board);
    if (!org?.organizationId) {
      console.warn(`Skip ${board}: missing organization`);
      continue;
    }
    const key = atsBoardKey('ashby', board);
    const website = org.publicWebsite || null;
    identities[key] = {
      companies: [company],
      organizationId: org.organizationId,
      owner: org.name || company,
      website,
    };
    console.log(`✓ ${key} → ${company} (${org.name}) ${website}`);
  }

  fs.writeFileSync(file, `${JSON.stringify(identities, null, 2)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});