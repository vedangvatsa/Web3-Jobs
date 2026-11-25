#!/usr/bin/env tsx
/**
 * Franklin Templeton digital-asset / blockchain roles via Phenom search (careers site).
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import { passesWeb3TitleFilter } from '../src/lib/web3-job-classifier';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';
import { normalizeIngestIsoDate } from './lib/ingest-date-normalize';

const COMPANY = 'Franklin Templeton';
const PHENOM_URL = 'https://careers.franklintempleton.com/widgets';
const SEARCH_KEYWORDS = ['blockchain', 'digital asset', 'tokenization', 'crypto'];

type PhenomJob = {
  jobId?: string;
  jobSeqNo?: string;
  title?: string;
  location?: string;
  cityStateCountry?: string;
  postedDate?: string;
  applyUrl?: string;
  descriptionTeaser?: string;
  type?: string;
};

async function phenomSearch(keyword: string): Promise<PhenomJob[]> {
  const res = await fetch(PHENOM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; hashtagweb3-ingest/1.0)' },
    body: JSON.stringify({
      lang: 'en_us',
      deviceType: 'desktop',
      country: 'us',
      pageName: 'search-results',
      ddoKey: 'refineSearch',
      sortBy: '',
      subsearch: '',
      from: 0,
      jobs: true,
      counts: true,
      all_fields: [],
      size: 40,
      clearAll: false,
      jdsource: 'facets',
      isSliderEnable: false,
      pageId: 'page12',
      siteType: 'external',
      keywords: keyword,
      global: true,
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`Phenom HTTP ${res.status} for "${keyword}"`);
  const data = (await res.json()) as { refineSearch?: { data?: { jobs?: PhenomJob[] } } };
  return data.refineSearch?.data?.jobs || [];
}

async function main() {
  const root = process.cwd();
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  const filtered = allJobs.filter((j) => {
    const company = String(j.company || '').toLowerCase();
    const link = String(j.link || '');
    const id = String(j.id || '');
    if (company.includes('franklin') && (link.includes('franklintempleton.com') || link.includes('franklinresources.wd5') || id.startsWith('ft-'))) {
      return false;
    }
    return true;
  });

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const byJobId = new Map<string, PhenomJob>();

  for (const keyword of SEARCH_KEYWORDS) {
    console.log(`Franklin Phenom search: "${keyword}"...`);
    const rows = await phenomSearch(keyword);
    for (const row of rows) {
      const key = row.jobId || row.jobSeqNo || row.title || '';
      if (key) byJobId.set(String(key), row);
    }
  }

  const added: Job[] = [];
  for (const row of byJobId.values()) {
    const title = (row.title || '').replace(/\s+/g, ' ').trim();
    const teaser = row.descriptionTeaser || '';
    if (!passesWeb3TitleFilter('strict', title, teaser)) continue;

    const applyTarget =
      row.applyUrl?.replace(/\/apply\/?$/, '') ||
      (row.jobSeqNo
        ? `https://careers.franklintempleton.com/us/en/job/${row.jobSeqNo}`
        : `https://careers.franklintempleton.com/us/en/search-results?keywords=${encodeURIComponent(title)}`);
    const link = applyTarget;
    if (!title || !isConcreteJobOpening(title, link)) continue;

    const id = `ft-${row.jobId || row.jobSeqNo || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const location = row.location || row.cityStateCountry || undefined;
    const { date, verified: dateOk } = normalizeIngestIsoDate(row.postedDate || row.dateCreated);

    const html = teaser
      ? sanitizeJobDescriptionHtml(`<p>${teaser}</p>`, COMPANY)
      : '';

    const jobRow: Job = {
      id,
      title,
      company: COMPANY,
      link,
      applyUrl: link,
      date,
      ...(dateOk ? { dateVerified: true, dateSource: 'Franklin Templeton Careers' } : {}),
      source: 'Phenom [franklin-templeton]',
      location,
      type: row.type,
      active: true,
      ...(previousById.get(id)?.slug && { slug: previousById.get(id)!.slug }),
    };

    added.push(jobRow);
    if (html) descriptions[getJobContentKey(jobRow)] = html;
  }

  const merged = eligibleIngestedJobs([...filtered, ...added]);
  const legacyArchive = loadJobLegacyArchive(root);
  assignJobSlugsAndSyncLegacyArchive(
    merged,
    legacyArchive,
    loadReservedRootSlugsSync(),
    loadPublishedRootSlugsSync(),
  );
  writeJobLegacyArchive(legacyArchive, root);

  merged.sort(
    (a, b) => new Date(String(b.date || 0)).getTime() - new Date(String(a.date || 0)).getTime(),
  );

  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);
  writeJobDescriptionStore(
    {
      descriptions,
      aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
    },
    root,
  );

  console.log(
    `✓ Franklin Templeton ingest: ${added.length} roles; ${merged.filter((j) => j.company === COMPANY).length} in cache.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});