#!/usr/bin/env tsx
/**
 * Merge one Dover careers board into jobs-cache (mirrors refresh-jobs-cache Dover block).
 * Usage: npx tsx scripts/ingest-dover-board.ts <board> <company> <clientId> <careersPath>
 * Example: npx tsx scripts/ingest-dover-board.ts muralpay Mural e1176848-... "Mural Pay"
 */
import fs from 'fs';
import path from 'path';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey, getJobIdentity } from '../src/lib/job-slugs';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

const [board, company, clientId, careersPath] = process.argv.slice(2);
if (!board || !company || !clientId || !careersPath) {
  console.error('Usage: ingest-dover-board.ts <board> <company> <clientId> <careersPath>');
  process.exit(1);
}

const source = `Dover: ${company} [${board}]`;
const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Array<Record<string, unknown>>;

const filtered = allJobs.filter((job) => {
  const s = String(job.source || '').toLowerCase();
  return !(s === source.toLowerCase() || s === `dover: ${company}`.toLowerCase());
});

function cleanTitle(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return text.replace(/\s+/g, ' ').trim();
}

async function main() {
  const listRes = await fetch(
    `https://app.dover.com/api/v1/careers-page/${encodeURIComponent(clientId)}/jobs?limit=300`,
  );
  if (!listRes.ok) throw new Error(`List HTTP ${listRes.status}`);
  const listData = (await listRes.json()) as {
    results: Array<{ id: string; title: string; created?: string }>;
  };

  const store = readJobDescriptionStore();
  const descriptions = { ...store.descriptions };
  const added: Array<Record<string, unknown>> = [];

  for (const posting of listData.results || []) {
    const title = cleanTitle(posting.title);
    if (!title) continue;

    const detailRes = await fetch(
      `https://app.dover.com/api/v1/inbound/application-portal-job/${encodeURIComponent(posting.id)}`,
    );
    if (!detailRes.ok) throw new Error(`Detail HTTP ${detailRes.status} for ${posting.id}`);
    const detail = (await detailRes.json()) as {
      id: string;
      title: string;
      created?: string;
      active?: boolean;
      is_private?: boolean;
      user_provided_description?: string;
      location?: string | null;
      locations?: Array<{ name?: string }>;
    };
    if (detail.active === false || detail.is_private) continue;

    const detailTitle = cleanTitle(detail.title) || title;
    const content = detail.user_provided_description?.trim();
    if (!content || content.length < 120) {
      console.warn(`Skip ${posting.id}: thin description`);
      continue;
    }

    const locationNames = detail.locations?.map((row) => row.name).filter(Boolean);
    const location = detail.location || (locationNames?.length ? locationNames.join(' · ') : undefined);
    const link = `https://app.dover.com/${encodeURIComponent(careersPath)}/careers/${detail.id}`;

    const row: Record<string, unknown> = {
      id: detail.id,
      title: detailTitle,
      company,
      link,
      date: detail.created || posting.created || new Date().toISOString(),
      source,
      location,
      active: true,
    };
    added.push(row);
    descriptions[getJobContentKey(row as never)] = content;
  }

  const merged = [...filtered, ...added] as never[];
  const legacyArchive = loadJobLegacyArchive();
  assignJobSlugsAndSyncLegacyArchive(merged, legacyArchive, loadReservedRootSlugsSync());
  writeJobLegacyArchive(legacyArchive);
  merged.sort(
    (a, b) => new Date(String((b as { date: string }).date)).getTime() - new Date(String((a as { date: string }).date)).getTime(),
  );
  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);
  writeJobDescriptionStore({
    descriptions,
    aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
  });
  console.log(`Added ${added.length} ${company} jobs; cache now ${merged.length} jobs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
