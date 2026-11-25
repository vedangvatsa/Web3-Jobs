#!/usr/bin/env tsx
/**
 * Compare employer directories on crypto job competitors against Hashtag Web3,
 * and optionally probe public ATS APIs for gaps (manual review only — do not auto-ingest).
 */
import fs from 'node:fs';
import path from 'node:path';
import { getCompanySlug } from '../src/lib/job-slugs';
import { atsBoardKey } from '../src/lib/ats-board-identity';
import { configuredAtsBoards } from './lib/ats-source-inventory';
import rejected from '../content/rejected-ats-boards.json';

const TODAY = new Date().toISOString().slice(0, 10);
const OUT_DIR = 'docs/job-aggregator-outreach';
const OUT_JSON = path.join(OUT_DIR, `competitor-employer-gaps-${TODAY}.json`);
const OUT_CSV = path.join(OUT_DIR, `competitor-employer-gaps-${TODAY}.csv`);
const OUT_PRIORITY_CSV = path.join(OUT_DIR, `competitor-employer-gaps-priority-${TODAY}.csv`);

const probeAts = !process.argv.includes('--no-probe-ats');
const probeLimit = Number(process.argv.find((a) => a.startsWith('--probe-limit='))?.slice(14) ?? '400');
const concurrency = Number(process.argv.find((a) => a.startsWith('--concurrency='))?.slice(14) ?? '6');

type CompetitorSource = 'cryptocurrencyjobs.co' | 'remote3.co' | 'web3.career';

type CompetitorEmployer = {
  slug: string;
  displayName: string;
  sources: Array<{ site: CompetitorSource; url: string }>;
};

type AtsHit = {
  provider: 'greenhouse' | 'lever' | 'ashby';
  board: string;
  jobCount: number;
  boardUrl: string;
  ingestUrl: string;
  slugTried: string;
  confidence: 'probed-live-postings';
};

type GapRow = CompetitorEmployer & {
  onHashtagWeb3: boolean;
  matchedSlug?: string;
  matchReason?: string;
  alreadyIngesting?: boolean;
  ats: AtsHit[];
  competitorUrls: string;
  notes?: string;
};

function normKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b(?:inc|llc|ltd|labs|lab|foundation|technologies|technology|network|protocol|jobs|careers|limited|the|team|group|dao|ventures|capital|digital|finance)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'user-agent': 'HashtagWeb3-CompetitorAudit/1.0 (+https://hashtagweb3.com)' },
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

function locsFromSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function loadCompetitorEmployers(): Promise<Map<string, CompetitorEmployer>> {
  const map = new Map<string, CompetitorEmployer>();

  function add(site: CompetitorSource, slug: string, url: string) {
    if (!slug || slug === 'startups') return;
    const key = slug.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      if (!existing.sources.some((s) => s.site === site)) existing.sources.push({ site, url });
      return;
    }
    map.set(key, {
      slug: key,
      displayName: titleFromSlug(key),
      sources: [{ site, url }],
    });
  }

  const ccjXml = await fetchText('https://cryptocurrencyjobs.co/sitemap-companies.xml');
  for (const loc of locsFromSitemap(ccjXml)) {
    const m = loc.match(/cryptocurrencyjobs\.co\/startups\/([^/]+)\/?$/i);
    if (m) add('cryptocurrencyjobs.co', m[1], loc);
  }

  const r3Xml = await fetchText('https://remote3.co/sitemap-companies.xml');
  for (const loc of locsFromSitemap(r3Xml)) {
    const m = loc.match(/remote3\.co\/company\/([^/]+)\/?$/i);
    if (m) add('remote3.co', m[1], loc);
  }

  for (let i = 1; i <= 4; i++) {
    const xml = await fetchText(`https://web3.career/sitemap${i}.xml`);
    for (const loc of locsFromSitemap(xml)) {
      const m = loc.match(/web3\.career\/web3-companies\/([^/?#]+)\/?$/i);
      if (!m) continue;
      const slug = m[1];
      if (
        !slug
        || slug.startsWith('tag')
        || slug.startsWith('top-growing')
        || slug.includes('+')
        || slug.includes('/')
      ) {
        continue;
      }
      add('web3.career', slug, loc);
    }
  }

  return map;
}

function loadOurEmployerKeys(): {
  slugs: Set<string>;
  normKeys: Set<string>;
  jobSlugs: Set<string>;
} {
  const companies = JSON.parse(fs.readFileSync('content/companies-runtime.json', 'utf8')) as Record<
    string,
    { slug?: string; name?: string }
  >;
  const jobs = JSON.parse(fs.readFileSync('content/jobs-runtime.json', 'utf8')) as Array<{ company?: string }>;

  const slugs = new Set<string>(Object.keys(companies));
  const normKeys = new Set<string>();
  const jobSlugs = new Set<string>();

  for (const slug of slugs) {
    normKeys.add(normKey(slug));
    const row = companies[slug];
    if (row?.name) {
      normKeys.add(normKey(row.name));
      slugs.add(getCompanySlug(row.name));
      normKeys.add(normKey(getCompanySlug(row.name)));
    }
  }

  for (const job of jobs) {
    if (!job.company) continue;
    const s = getCompanySlug(job.company);
    jobSlugs.add(s);
    slugs.add(s);
    normKeys.add(normKey(s));
    normKeys.add(normKey(job.company));
  }

  return { slugs, normKeys, jobSlugs };
}

function matchOurs(
  employer: CompetitorEmployer,
  ours: ReturnType<typeof loadOurEmployerKeys>,
): { onSite: boolean; matchedSlug?: string; matchReason?: string } {
  const nameSlug = getCompanySlug(employer.displayName);
  const slug = employer.slug;
  const variants = new Set([
    slug,
    slug.replace(/-labs$/, '').replace(/-foundation$/, '').replace(/-network$/, ''),
    nameSlug,
    slug.replace(/-/g, ''),
  ]);

  for (const candidate of variants) {
    if (ours.slugs.has(candidate)) {
      return { onSite: true, matchedSlug: candidate, matchReason: 'slug' };
    }
  }

  for (const candidate of [slug, nameSlug, employer.displayName]) {
    const nk = normKey(candidate);
    if (nk && ours.normKeys.has(nk)) {
      return { onSite: true, matchedSlug: getCompanySlug(employer.displayName), matchReason: 'normalized-name' };
    }
  }

  if (ours.jobSlugs.has(nameSlug) || ours.jobSlugs.has(slug)) {
    return { onSite: true, matchedSlug: nameSlug, matchReason: 'job-company-only' };
  }

  return { onSite: false };
}

function slugProbeVariants(slug: string): string[] {
  const base = slug.toLowerCase();
  const out = new Set<string>([base]);
  const stripped = base.replace(
    /-(labs|lab|foundation|network|protocol|dao|group|inc|hq|xyz|fi|capital|ventures|technology|technologies|digital|finance|trading|opco)$/,
    '',
  );
  if (stripped && stripped !== base) out.add(stripped);
  const parts = base.split('-').filter(Boolean);
  if (parts.length >= 2) out.add(parts.slice(0, 2).join('-'));
  if (parts.length >= 1 && parts[0].length >= 3) out.add(parts[0]);
  // web3.career often uses compressed slugs (mystenlabs vs mysten-labs)
  out.add(base.replace(/-/g, ''));
  return [...out];
}

function ingestUrl(provider: AtsHit['provider'], board: string): { boardUrl: string; ingestUrl: string } {
  const enc = encodeURIComponent(board);
  if (provider === 'greenhouse') {
    return {
      boardUrl: `https://boards.greenhouse.io/${enc}`,
      ingestUrl: `https://boards-api.greenhouse.io/v1/boards/${enc}/jobs?content=true`,
    };
  }
  if (provider === 'lever') {
    return {
      boardUrl: `https://jobs.lever.co/${enc}`,
      ingestUrl: `https://api.lever.co/v0/postings/${enc}?mode=json`,
    };
  }
  return {
    boardUrl: `https://jobs.ashbyhq.com/${enc}`,
    ingestUrl: `https://api.ashbyhq.com/posting-api/job-board/${enc}`,
  };
}

async function ghCount(board: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=false`,
      { signal: AbortSignal.timeout(15_000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { jobs?: unknown[] };
    return data.jobs?.length ?? 0;
  } catch {
    return null;
  }
}

async function leverCount(board: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(board)}?mode=json`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? data.length : null;
  } catch {
    return null;
  }
}

async function ashbyCount(board: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { jobs?: unknown[] };
    return data.jobs?.length ?? 0;
  } catch {
    return null;
  }
}

function slugProbePlausible(employerSlug: string, tried: string): boolean {
  if (tried.length >= employerSlug.replace(/-/g, '').length - 1) return true;
  if (employerSlug.includes(tried) && tried.length >= 5) return true;
  if (tried.includes(employerSlug.replace(/-/g, ''))) return true;
  // Reject generic one-word boards that only share a short prefix (e.g. greenhouse "find" for find-satoshi-lab).
  if (tried.length < 5 && !employerSlug.startsWith(tried)) return false;
  if (tried.length < 4) return false;
  return employerSlug.startsWith(tried) || employerSlug.includes(`-${tried}`);
}

async function probeEmployerAts(slug: string, configured: Set<string>): Promise<AtsHit[]> {
  const hits: AtsHit[] = [];
  const seen = new Set<string>();

  for (const candidate of slugProbeVariants(slug)) {
    const probes: Array<{ provider: AtsHit['provider']; count: number | null }> = [
      { provider: 'greenhouse', count: await ghCount(candidate) },
      { provider: 'lever', count: await leverCount(candidate) },
      { provider: 'ashby', count: await ashbyCount(candidate) },
    ];
    for (const p of probes) {
      if (!p.count || p.count <= 0) continue;
      if (!slugProbePlausible(slug, candidate)) continue;
      const key = atsBoardKey(p.provider, candidate);
      if (key in rejected) continue;
      if (configured.has(key.toLowerCase())) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      const urls = ingestUrl(p.provider, candidate);
      hits.push({
        provider: p.provider,
        board: candidate,
        jobCount: p.count,
        slugTried: candidate,
        confidence: 'probed-live-postings',
        ...urls,
      });
    }
    if (hits.length) break;
  }

  return hits;
}

async function mapPool<T, R>(items: T[], worker: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        out[i] = await worker(items[i]);
      }
    }),
  );
  return out;
}

function toCsv(rows: GapRow[]): string {
  const header = [
    'displayName',
    'competitorSlug',
    'competitorSources',
    'competitorUrls',
    'onHashtagWeb3',
    'matchedSlug',
    'alreadyIngesting',
    'atsProvider',
    'atsBoard',
    'atsJobCount',
    'atsBoardUrl',
    'atsIngestUrl',
    'atsConfidence',
  ];
  const lines = [header.join(',')];
  for (const row of rows) {
    const best = row.ats[0];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    lines.push(
      [
        esc(row.displayName),
        esc(row.slug),
        esc(row.sources.map((s) => s.site).join('; ')),
        esc(row.competitorUrls),
        row.onHashtagWeb3 ? 'yes' : 'no',
        esc(row.matchedSlug || ''),
        row.alreadyIngesting ? 'yes' : 'no',
        esc(best?.provider || ''),
        esc(best?.board || ''),
        best?.jobCount != null ? String(best.jobCount) : '',
        esc(best?.boardUrl || ''),
        esc(best?.ingestUrl || ''),
        esc(best?.confidence || ''),
      ].join(','),
    );
  }
  return lines.join('\n');
}

async function main(): Promise<void> {
  console.error('Fetching competitor company sitemaps…');
  const competitors = await loadCompetitorEmployers();
  const ours = loadOurEmployerKeys();
  const configured = new Set(configuredAtsBoards().map((b) => atsBoardKey(b.provider, b.board).toLowerCase()));

  const allRows: GapRow[] = [];
  const gaps: CompetitorEmployer[] = [];

  for (const employer of competitors.values()) {
    const match = matchOurs(employer, ours);
    const row: GapRow = {
      ...employer,
      onHashtagWeb3: match.onSite,
      matchedSlug: match.matchedSlug,
      matchReason: match.matchReason,
      competitorUrls: employer.sources.map((s) => s.url).join(' | '),
      ats: [],
    };
    if (match.onSite) {
      const boardsForCompany = configuredAtsBoards().filter(
        (b) => getCompanySlug(b.company) === match.matchedSlug || normKey(b.company) === normKey(employer.displayName),
      );
      row.alreadyIngesting = boardsForCompany.some((b) =>
        configured.has(atsBoardKey(b.provider, b.board).toLowerCase()),
      );
    } else {
      gaps.push(employer);
    }
    allRows.push(row);
  }

  gaps.sort((a, b) => {
    const score = (e: CompetitorEmployer) =>
      e.sources.length * 10
      + (e.sources.some((s) => s.site === 'cryptocurrencyjobs.co') ? 5 : 0)
      + (e.sources.some((s) => s.site === 'remote3.co') ? 4 : 0)
      - (e.sources.length === 1 && e.sources[0].site === 'web3.career' ? 3 : 0);
    return score(b) - score(a) || a.displayName.localeCompare(b.displayName);
  });

  const gapsToProbe = gaps.slice(0, Math.max(0, probeLimit));
  if (probeAts && gapsToProbe.length) {
    console.error(`Probing ATS for ${gapsToProbe.length}/${gaps.length} gap employers (limit=${probeLimit})…`);
    const probed = await mapPool(gapsToProbe, async (employer) => ({
      slug: employer.slug,
      ats: await probeEmployerAts(employer.slug, configured),
    }));
    const bySlug = new Map(probed.map((p) => [p.slug, p.ats]));
    for (const row of allRows) {
      if (!row.onHashtagWeb3) row.ats = bySlug.get(row.slug) || [];
    }
  }

  const gapRows = allRows
    .filter((r) => !r.onHashtagWeb3)
    .sort((a, b) => {
      const aHit = a.ats[0]?.jobCount ?? 0;
      const bHit = b.ats[0]?.jobCount ?? 0;
      if (bHit !== aHit) return bHit - aHit;
      return a.displayName.localeCompare(b.displayName);
    });

  const withAts = gapRows.filter((r) => r.ats.length > 0);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const payload = {
    generatedAt: new Date().toISOString(),
    competitors: {
      'cryptocurrencyjobs.co': allRows.filter((r) => r.sources.some((s) => s.site === 'cryptocurrencyjobs.co')).length,
      'remote3.co': allRows.filter((r) => r.sources.some((s) => s.site === 'remote3.co')).length,
      'web3.career': allRows.filter((r) => r.sources.some((s) => s.site === 'web3.career')).length,
      uniqueEmployers: allRows.length,
    },
    ours: {
      companyProfileSlugs: ours.slugs.size,
      jobCompanySlugs: ours.jobSlugs.size,
    },
    summary: {
      gapEmployers: gapRows.length,
      gapWithProbedAts: withAts.length,
      probeAts,
      probeLimit,
    },
    gapEmployers: gapRows,
    allEmployers: allRows,
  };

  const priorityGaps = gapRows.filter(
    (r) =>
      r.sources.some((s) => s.site === 'cryptocurrencyjobs.co' || s.site === 'remote3.co')
      || r.sources.length >= 2,
  );

  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));
  fs.writeFileSync(OUT_CSV, toCsv(gapRows));
  fs.writeFileSync(OUT_PRIORITY_CSV, toCsv(priorityGaps));

  console.log(
    JSON.stringify(
      {
        outJson: OUT_JSON,
        outCsv: OUT_CSV,
        outPriorityCsv: OUT_PRIORITY_CSV,
        priorityGapEmployers: priorityGaps.length,
        uniqueCompetitorEmployers: allRows.length,
        gapEmployers: gapRows.length,
        gapWithProbedAts: withAts.length,
        topAtsGaps: withAts.slice(0, 15).map((r) => ({
          name: r.displayName,
          slug: r.slug,
          ats: r.ats[0],
          sources: r.sources.map((s) => s.site),
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});