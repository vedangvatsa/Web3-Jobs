#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening, cleanCompanyName } from '../src/lib/job-filters';
import { getJobSourceIssue } from '../src/lib/job-source-policy';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import { cleanJobLocation } from '../src/lib/job-location';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

const COMPANY_NAME = 'BNB Chain';
const COMPANY_SLUG = 'bnb-chain';
const SOURCE_LABEL = 'BNB Chain Job Board [getro-bnbchain]';
const BOARD_URL = 'https://jobs.bnbchain.org/jobs';

function formatLocation(locs?: string[]): string {
  if (!locs || locs.length === 0) return 'Remote';
  const joined = locs.join(', ');
  return cleanJobLocation(joined) || 'Remote';
}

async function main() {
  const root = process.cwd();
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  console.log(`[ingest-bnbchain] Fetching jobs list from ${BOARD_URL}...`);
  const response = await fetch(BOARD_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    },
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${BOARD_URL}`);

  const html = await response.text();
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!nextDataMatch) throw new Error('No __NEXT_DATA__ found in BNB Chain job board');

  const nextData = JSON.parse(nextDataMatch[1]);
  const jobsData = nextData?.props?.pageProps?.initialState?.jobs?.found || [];
  const bnbJobs = jobsData.filter((j: any) => j.organization?.name === COMPANY_NAME && j.slug);
  console.log(`[ingest-bnbchain] Found ${bnbJobs.length} ${COMPANY_NAME} jobs on board.`);

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const added: Job[] = [];

  for (const j of bnbJobs) {
    const title = (j.title || '').replace(/\s+/g, ' ').trim();
    const link = j.url || `https://jobs.bnbchain.org/companies/bnb-chain/jobs/${j.slug}`;

    if (!isConcreteJobOpening(title, link)) {
      console.warn(`[ingest-bnbchain] Disqualified title: ${title}`);
      continue;
    }

    const detailUrl = `https://jobs.bnbchain.org/companies/bnb-chain/jobs/${j.slug}`;
    console.log(`[ingest-bnbchain] Fetching details for ${title}...`);
    let cleanHtml = '';
    try {
      const detailRes = await fetch(detailUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(15_000)
      });
      if (detailRes.ok) {
        const detailHtml = await detailRes.text();
        const dm = detailHtml.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (dm) {
          const detailData = JSON.parse(dm[1]);
          const currentJob = detailData.props?.pageProps?.job || detailData.props?.pageProps?.initialState?.jobs?.currentJob;
          const rawMarkdown = currentJob?.description || '';
          if (rawMarkdown) {
            const htmlDesc = marked.parse(rawMarkdown) as string;
            cleanHtml = sanitizeJobDescriptionHtml(htmlDesc, COMPANY_NAME);
          }
        }
      }
    } catch (err: any) {
      console.warn(`[ingest-bnbchain] Failed to fetch description for ${title}:`, err.message);
    }

    if (!cleanHtml || cleanHtml.length < 200) {
      console.warn(`[ingest-bnbchain] Inadequate description for ${title}, skipping.`);
      continue;
    }

    const id = `bnbchain-${j.id}`;
    const date = j.createdAt ? new Date(j.createdAt * 1000).toISOString() : new Date().toISOString();
    const location = formatLocation(j.locations);

    const jobRow: Job = {
      id,
      title,
      company: COMPANY_NAME,
      link,
      applyUrl: link,
      date,
      dateVerified: true,
      dateSource: 'BNB Chain Ecosystem Job Board',
      source: SOURCE_LABEL,
      location,
      department: j.skills?.[0] ? `(${j.skills[0]})` : undefined,
      active: true,
      ...(previousById.get(id)?.slug && { slug: previousById.get(id)!.slug }),
    };

    if (getJobSourceIssue(jobRow)) {
      console.warn(`[ingest-bnbchain] Rejected by job source policy: ${title}`);
      continue;
    }

    added.push(jobRow);
    descriptions[getJobContentKey(jobRow)] = cleanHtml;
  }

  // Filter out any previous jobs with this source
  const filtered = allJobs.filter((job) => {
    const s = String(job.source || '').toLowerCase();
    return s !== SOURCE_LABEL.toLowerCase();
  });

  const merged = eligibleIngestedJobs([...filtered, ...added]);
  const legacyArchive = loadJobLegacyArchive(root);
  assignJobSlugsAndSyncLegacyArchive(
    merged,
    legacyArchive,
    loadReservedRootSlugsSync(),
    loadPublishedRootSlugsSync()
  );
  writeJobLegacyArchive(legacyArchive, root);

  merged.sort(
    (a, b) =>
      new Date(String((b as { date: string }).date)).getTime() -
      new Date(String((a as { date: string }).date)).getTime()
  );

  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);
  writeJobDescriptionStore(
    {
      descriptions,
      aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
    },
    root
  );

  console.log(`✅ [ingest-bnbchain] Added ${added.length} BNB Chain jobs; total cache now ${merged.length} jobs.`);
}

main().catch((err) => {
  console.error('❌ [ingest-bnbchain] Fatal error:', err);
  process.exit(1);
});
