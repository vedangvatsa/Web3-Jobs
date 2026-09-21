/**
 * Ingest selected Amazon.jobs postings into jobs-cache + description shards.
 * Usage: npx tsx scripts/ingest-amazon-careers-jobs.ts
 */
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { getJobContentKey } from '../src/lib/job-slugs';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';
import { assignJobSlugsInCacheFile } from './lib/job-slug-assignment';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');

const JOB_URLS: Array<{ id: string; link: string; department?: string }> = [
  {
    id: '10552800',
    link: 'https://www.amazon.jobs/en/jobs/10552800/senior-delivery-consultant-emerging-tech',
    department: 'AWS Professional Services',
  },
  {
    id: '10535100',
    link: 'https://www.amazon.jobs/en/jobs/10535100/senior-delivery-consultant-emerging-tech',
    department: 'AWS Professional Services',
  },
  {
    id: '10482747',
    link: 'https://www.amazon.jobs/en/jobs/10482747/senior-software-dev-engineer-um-bespoke-solutions',
    department: 'AWS',
  },
  {
    id: '10472950',
    link: 'https://www.amazon.jobs/en/jobs/10472950/industry-specialist-capital-markets-and-banking-apj-financial-services-industry-development-aws',
    department: 'AWS Financial Services',
  },
  {
    id: '10483695',
    link: 'https://www.amazon.jobs/en/jobs/10483695/internal-risk-specialist-special-projects-investigations',
    department: 'Amazon',
  },
  {
    id: '10537187',
    link: 'https://www.amazon.jobs/en/jobs/10537187/senior-bdm-law-enforcement-global-government-business-development',
    department: 'AWS Global Public Sector',
  },
];

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function formatLocation(raw: string): string {
  if (!raw) return 'See Amazon.jobs posting';
  const parts = raw.split(/(?=USA,|KOR,|SGP,|GBR,|IND,|AUS,)/).map((s) => s.trim()).filter(Boolean);
  const formatted = parts.map((p) => {
    const m = p.match(/^([A-Z]{3}),\s*([^,]+)(?:,\s*(.+))?$/);
    if (!m) return p;
    const [, country, region, city] = m;
    const map: Record<string, string> = {
      USA: 'United States',
      KOR: 'South Korea',
      SGP: 'Singapore',
      GBR: 'United Kingdom',
    };
    const c = map[country] || country;
    return city ? `${city}, ${region}, ${c}` : `${region}, ${c}`;
  });
  if (formatted.length > 4) {
    const sample = formatted.slice(0, 4).join('; ');
    return `${formatted.length} locations — ${sample}; +${formatted.length - 4} more`;
  }
  return formatted.join('; ');
}

async function fetchJobPosting(id: string, link: string): Promise<{
  title: string;
  location: string;
  sections: Record<string, string>;
}> {
  const res = await fetch(link, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${link}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = decodeHtml($('meta[property="og:title"]').attr('content') || '');
  let locationRaw = '';
  $('.location-icon').each((_, el) => {
    const t = $(el).parent().text().replace(/\s+/g, ' ').trim();
    if (t) locationRaw += t;
  });
  const sections: Record<string, string> = {};
  $('#job-detail-body .section').each((_, el) => {
    const h = $(el).find('h2').first().text().trim();
    if (!h) return;
    let inner = $(el).html() || '';
    inner = inner.replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, '').trim();
    sections[h] = inner;
  });
  if (!title) throw new Error(`Missing title for job ${id}`);
  if (!sections.Description) throw new Error(`Missing description for job ${id}`);
  return { title, location: formatLocation(locationRaw), sections };
}

function buildDescription(sections: Record<string, string>): string {
  const parts: string[] = [];
  if (sections.Description) {
    parts.push('<h3>Description</h3>', sections.Description);
  }
  if (sections['Basic Qualifications']) {
    parts.push('<h3>Basic Qualifications</h3>', sections['Basic Qualifications']);
  }
  if (sections['Preferred Qualifications']) {
    parts.push('<h3>Preferred Qualifications</h3>', sections['Preferred Qualifications']);
  }
  return sanitizeJobDescriptionHtml(parts.join('\n'), 'Amazon');
}

async function main(): Promise<void> {
  const cache: Array<Record<string, unknown>> = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  const now = new Date().toISOString();
  const results: Array<{ id: string; action: string; slug?: string; title?: string }> = [];

  const parsed = new Map<string, Awaited<ReturnType<typeof fetchJobPosting>>>();

  for (const spec of JOB_URLS) {
    const posting = await fetchJobPosting(spec.id, spec.link);
    parsed.set(spec.id, posting);
    const job = {
      id: spec.id,
      title: posting.title,
      company: 'Amazon',
      link: spec.link,
      date: now,
      source: 'Amazon.jobs',
      location: posting.location,
      department: spec.department || 'Amazon',
      active: true,
    };
    const existingIdx = cache.findIndex((e) => e.id === job.id || e.link === job.link);
    if (existingIdx === -1) {
      cache.unshift(job);
      results.push({ id: job.id, action: 'added', title: job.title });
    } else {
      cache[existingIdx] = { ...cache[existingIdx], ...job, slug: cache[existingIdx].slug };
      results.push({ id: job.id, action: 'updated', title: job.title });
    }
  }

  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);
  assignJobSlugsInCacheFile(CACHE_PATH);

  const updated: Array<Record<string, unknown>> = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  const store = readJobDescriptionStore();

  for (const spec of JOB_URLS) {
    const posting = parsed.get(spec.id);
    if (!posting) throw new Error(`Missing parsed posting for ${spec.id}`);
    const saved = updated.find((e) => e.id === spec.id || e.link === spec.link);
    if (!saved?.slug || typeof saved.slug !== 'string') {
      throw new Error(`Missing slug for ${spec.id}`);
    }
    const contentKey = getJobContentKey(saved as never);
    store.descriptions[contentKey] = buildDescription(posting.sections);
    const row = results.find((r) => r.id === spec.id);
    if (row) row.slug = saved.slug;
  }

  store.aliases = {
    ...store.aliases,
    ...buildJobDescriptionAliases(updated as never, store.descriptions),
  };
  writeJobDescriptionStore(store);

  console.log(JSON.stringify({ count: results.length, results }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
