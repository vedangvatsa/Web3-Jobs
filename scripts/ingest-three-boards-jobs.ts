import fs from 'fs';
import path from 'path';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { getJobContentKey } from '../src/lib/job-slugs';

interface MokaJob {
  id: string;
  title: string;
  department?: { name: string };
  zhineng?: { name: string };
  publishedAt?: string;
  locations?: Array<{ country?: string; cityName?: string; provinceName?: string }>;
  jobDescription?: string;
}

interface AshbyJob {
  id: string;
  title: string;
  department?: string;
  team?: string;
  publishedAt?: string;
  location?: string;
  jobUrl?: string;
  descriptionHtml?: string;
}

const mudrexJobsRaw = [
  {
    id: 'mudrex-growth-marketing-lead',
    title: 'Growth Marketing Lead',
    company: 'Mudrex',
    link: 'https://mudrex.com/careers/growth-marketing-lead',
    date: '2026-08-28',
    source: 'Manatal: Mudrex [mudrex]',
    location: 'Bengaluru, India (Hybrid)',
    department: 'Marketing',
    active: true,
    slug: 'growthb3d2b'
  },
  {
    id: 'mudrex-compliance-officer',
    title: 'Compliance & AML Officer',
    company: 'Mudrex',
    link: 'https://mudrex.com/careers/compliance-officer',
    date: '2026-08-28',
    source: 'Manatal: Mudrex [mudrex]',
    location: 'Bengaluru, India / Remote',
    department: 'Compliance & Legal',
    active: true,
    slug: 'compliancer3c2cf'
  }
];

async function ingestBitget(cacheData: any[], descData: Record<string, string>) {
  console.log('Fetching Bitget jobs from MokaHR API...');
  try {
    const res = await fetch('https://hire-r1.mokahr.com/api/outer/ats-apply/website/jobs/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://hire-r1.mokahr.com/social-recruitment/bitget/100000079'
      },
      body: JSON.stringify({
        orgId: 'bitget',
        siteId: 100000079,
        pageSize: 100,
        page: 1
      })
    });

    const json = (await res.json()) as any;
    const rawJobs: MokaJob[] = json.data?.jobs || [];
    console.log(`Fetched ${rawJobs.length} active Bitget jobs from MokaHR.`);

    let added = 0;
    let updated = 0;

    for (const r of rawJobs) {
      if (!r.title || !isConcreteJobOpening(r.title)) continue;

      const pubDate = r.publishedAt ? r.publishedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
      const loc = (r.locations && r.locations.length > 0)
        ? [r.locations[0].cityName, r.locations[0].country].filter(Boolean).join(', ')
        : 'Remote / Global';
      const dept = r.department?.name || r.zhineng?.name || 'Operations';

      const job = {
        id: r.id,
        title: r.title.trim(),
        company: 'Bitget',
        link: `https://hire-r1.mokahr.com/social-recruitment/bitget/100000079#/job/${r.id}`,
        date: pubDate,
        source: 'MokaHR: Bitget [bitget]',
        location: loc,
        department: dept,
        active: true,
        slug: `operations${r.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
      };

      const existingIdx = cacheData.findIndex((j: any) => j.id === job.id || j.link === job.link);
      if (existingIdx === -1) {
        cacheData.unshift(job);
        added++;
      } else {
        cacheData[existingIdx] = { ...cacheData[existingIdx], ...job, slug: cacheData[existingIdx].slug || job.slug };
        updated++;
      }

      if (r.jobDescription) {
        descData[getJobContentKey(job)] = r.jobDescription;
      }
    }

    console.log(`Bitget: ${added} added, ${updated} updated.`);
  } catch (err: any) {
    console.warn(`⚠️ Bitget fetch warning: ${err.message}`);
  }
}

async function ingestHyperliquid(cacheData: any[], descData: Record<string, string>) {
  console.log('Fetching Hyperliquid Labs jobs from Ashby API...');
  try {
    const res = await fetch('https://api.ashbyhq.com/posting-api/job-board/Hyperliquid%20Labs');
    if (!res.ok) throw new Error(`Ashby HTTP ${res.status}`);
    const json = (await res.json()) as { jobs: AshbyJob[] };
    const rawJobs = json.jobs || [];
    console.log(`Fetched ${rawJobs.length} active Hyperliquid Labs jobs from Ashby.`);

    let added = 0;
    let updated = 0;

    for (const h of rawJobs) {
      if (!isConcreteJobOpening(h.title, h.jobUrl)) continue;

      const pubDate = h.publishedAt ? h.publishedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
      const loc = h.location || 'APAC / Remote';
      const dept = h.department || h.team || 'Engineering';

      const job = {
        id: h.id,
        title: h.title.trim(),
        company: 'Hyperliquid Labs',
        link: h.jobUrl || `https://jobs.ashbyhq.com/Hyperliquid%20Labs/${h.id}`,
        date: pubDate,
        source: 'Ashby: Hyperliquid Labs [hyperliquid]',
        location: loc,
        department: dept,
        active: true,
        slug: `role${h.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
      };

      const existingIdx = cacheData.findIndex((j: any) => j.id === job.id || j.link === job.link);
      if (existingIdx === -1) {
        cacheData.unshift(job);
        added++;
      } else {
        cacheData[existingIdx] = { ...cacheData[existingIdx], ...job, slug: cacheData[existingIdx].slug || job.slug };
        updated++;
      }

      if (h.descriptionHtml) {
        descData[getJobContentKey(job)] = h.descriptionHtml;
      }
    }

    console.log(`Hyperliquid Labs: ${added} added, ${updated} updated.`);
  } catch (err: any) {
    console.warn(`⚠️ Hyperliquid Labs fetch warning: ${err.message}`);
  }
}

async function main() {
  console.log('Ingesting Bitget, Mudrex, and Hyperliquid Labs jobs...');

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const descPath = path.join(process.cwd(), 'content/job-descriptions.json');
  const descData = fs.existsSync(descPath) ? JSON.parse(fs.readFileSync(descPath, 'utf8')) : {};

  await ingestBitget(cacheData, descData);
  await ingestHyperliquid(cacheData, descData);

  // Ingest Mudrex
  let mudrexAdded = 0;
  for (const mJob of mudrexJobsRaw) {
    if (!cacheData.some((j: any) => j.id === mJob.id)) {
      cacheData.unshift(mJob);
      mudrexAdded++;
    }
  }
  console.log(`Mudrex: ${mudrexAdded} added.`);

  console.log(`Total jobs in cache: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
  fs.writeFileSync(descPath, JSON.stringify(descData, null, 2));
}

main();
