import { getJobs } from '@/lib/jobs';
import { getCompanies, getCompanyBySlug } from '@/lib/companies';
import { getJobContentKey } from '@/lib/job-slugs';
import { getJobSlugShardIndex, getJobShardFilename, JOB_SHARD_COUNT } from '@/lib/job-shards';
import { getJobDescriptionShardFilename, getJobDescriptionShardIndex, isJobDescriptionShard, JOB_DESCRIPTION_SHARD_COUNT } from '@/lib/job-description-shards';
import { isExpiredJobPath } from '@/lib/job-age-path';
import routes from '../../../../content/sitemap-routes.json';
import { createHash } from 'node:crypto';
import { loadStaticJson } from '@/lib/load-static-json';
import { readLocalJsonFile } from '@/lib/catalog-fs';
import { jobCacheHeaders } from '@/lib/job-age-cache.mjs';

export const dynamic = 'force-dynamic';

async function currentCompanies() {
  const companies = await getCompanies(true);
  const rows = await Promise.all(companies.map(async summary => {
    const company = (await getCompanyBySlug(summary.slug))!;
    const { jobs, ...rest } = company;
    return [company.slug, { ...rest, jobIds: jobs.map(job => job.id || job.slug || job.link) }];
  }));
  return Object.fromEntries(rows);
}

export async function GET(_request: Request, context: { params: Promise<{ parts: string[] }> }): Promise<Response> {
  const { parts } = await context.params;
  const key = parts.join('/');
  const headers = { ...jobCacheHeaders(await getJobs()), 'Access-Control-Allow-Origin': '*' };
  if (key === 'catalog-freshness.json') {
    const built = await loadStaticJson<{ version: number; builtAt: string; snapshotId: string; catalogs: Record<string, { path: string; sha256: string; count: number; newestSourceDate?: string | null }> }>('catalog-freshness.json', undefined, { localOnly: true });
    const jobs = await getJobs();
    const companies = await currentCompanies();
    const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
    const catalogs = {
      ...built.catalogs,
      jobs: { ...built.catalogs.jobs, sha256: hash(jobs), count: jobs.length, newestSourceDate: jobs.map(job => job.date).sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null },
      companies: { ...built.catalogs.companies, sha256: hash(companies), count: Object.keys(companies).length },
    };
    return Response.json({ ...built, snapshotId: hash(catalogs).slice(0, 24), catalogs }, { headers });
  }
  if (key === 'sitemap.json' || key === 'sitemap.xml') {
    const current = routes.filter(route => !isExpiredJobPath(new URL(route.url).pathname));
    if (key.endsWith('.json')) {
      const urls = current.map(({ url, lastModified, changeFrequency, priority }) => ({ url, lastmod: lastModified?.split('T')[0], changefreq: changeFrequency, priority }));
      return Response.json({ $schema: 'https://schema.org/sitemap', name: 'Hashtag Web3', url: 'https://hashtagweb3.com', generatedAt: new Date().toISOString(), count: urls.length, urls }, { headers });
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${current.map(route => `<url><loc>${route.url.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</loc>${route.lastModified ? `<lastmod>${route.lastModified.split('T')[0]}</lastmod>` : ''}</url>`).join('')}</urlset>`;
    return new Response(xml, { headers: { ...headers, 'Content-Type': 'application/xml; charset=utf-8' } });
  }
  if (key === 'companies-runtime.json') {
    return Response.json(await currentCompanies(), { headers });
  }
  if (key === 'jobs-runtime.json') return Response.json(await getJobs(), { headers });
  const shardIndex = parts.length === 2 ? Number(parts[1].match(/-(\d{2})\.json$/)?.[1]) : NaN;
  if (parts[0] === 'job-shards' && Number.isInteger(shardIndex) && shardIndex < JOB_SHARD_COUNT && parts[1] === getJobShardFilename(shardIndex)) {
    const jobs = (await getJobs()).filter(job => job.slug && getJobSlugShardIndex(job.slug) === shardIndex);
    return Response.json(Object.fromEntries(jobs.map(job => [job.slug, job])), { headers: { ...headers, ...jobCacheHeaders(jobs) } });
  }
  if (parts[0] === 'job-description-shards' && Number.isInteger(shardIndex) && shardIndex < JOB_DESCRIPTION_SHARD_COUNT && parts[1] === getJobDescriptionShardFilename(shardIndex)) {
    const jobs = (await getJobs()).filter(job => getJobDescriptionShardIndex(job) === shardIndex);
    const descriptions: Record<string, string> = {};
    const aliases: Record<string, string> = {};
    if (jobs.length) {
      const shard = readLocalJsonFile('content', 'job-description-shards', parts[1]) ?? readLocalJsonFile('public', 'job-description-shards', parts[1]);
      if (!isJobDescriptionShard(shard)) return new Response('Description shard unavailable\n', { status: 503, headers: { 'Cache-Control': 'no-store' } });
      const keys = new Set(jobs.map(getJobContentKey));
      for (const [key, value] of Object.entries(shard.descriptions)) if (keys.has(key)) descriptions[key] = value;
      for (const [alias, key] of Object.entries(shard.aliases)) if (keys.has(key)) aliases[alias] = key;
    }
    return Response.json({ version: 1, descriptions, aliases }, { headers: { ...headers, ...jobCacheHeaders(jobs) } });
  }
  return new Response('Not found\n', { status: 404, headers });
}
