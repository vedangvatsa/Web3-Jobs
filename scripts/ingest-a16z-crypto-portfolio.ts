import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const NOW = new Date('2026-09-02T00:00:00Z').getTime();
const CUTOFF = NOW - THIRTY_DAYS_MS; // 2026-08-03

const A16Z_CRYPTO_COMPANIES = [
  { name: 'Bastion', slug: 'Bastion' },
  { name: 'Worldcoin', slug: 'Tools%20for%20Humanity' },
  { name: 'Morpho Labs', slug: 'morpho' },
  { name: 'Sky Mavis', slug: 'skymavis' },
  { name: 'Alchemy', slug: 'alchemy' },
  { name: 'Matter Labs', slug: 'matter-labs' },
  { name: 'Talos Trading', slug: 'Talos-Trading' }
];

async function fetchAshbyCompany(companyName: string, ashbySlug: string) {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${ashbySlug}?includeCompensation=true`;
  console.log(`\nFetching Ashby jobs for ${companyName} (${url})...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    const json = await res.json();
    if (!json.jobs) {
      console.log(`No jobs key returned for ${companyName}.`);
      return [];
    }

    const jobs = json.jobs;
    console.log(`${companyName}: ${jobs.length} total active postings on Ashby.`);

    const freshJobs = jobs.filter((j: any) => {
      const pub = j.publishedAt ? new Date(j.publishedAt).getTime() : 0;
      return pub >= CUTOFF;
    });

    console.log(`${companyName}: ${freshJobs.length} jobs <= 30 days old.`);
    freshJobs.forEach((j: any) => {
      const d = new Date(j.publishedAt).toISOString().slice(0, 10);
      console.log(` - [${d}] ${j.title} (${j.location || 'Remote'})`);
    });

    return freshJobs.map((j: any) => ({
      id: j.id,
      title: j.title,
      company: companyName,
      link: j.jobUrl || `https://jobs.ashbyhq.com/${ashbySlug}/${j.id}`,
      date: new Date(j.publishedAt).toISOString().slice(0, 10),
      source: `Ashby: ${companyName} [${ashbySlug}]`,
      location: j.location || (j.secondaryLocations && j.secondaryLocations.length > 0 ? j.secondaryLocations.join(', ') : 'Remote'),
      department: j.department || j.team || 'Operations',
      active: true,
      slug: `role${j.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
    }));

  } catch (e: any) {
    console.error(`Error fetching ${companyName}:`, e.message);
    return [];
  }
}

async function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let totalAdded = 0;

  for (const c of A16Z_CRYPTO_COMPANIES) {
    const freshJobs = await fetchAshbyCompany(c.name, c.slug);
    for (const job of freshJobs) {
      if (!cacheData.some((existing: any) => existing.id === job.id || existing.link === job.link)) {
        cacheData.unshift(job);
        totalAdded++;
      }
    }
  }

  console.log(`\nTotal new fresh a16z Crypto portfolio jobs added: ${totalAdded}`);
  console.log(`Total jobs in cache: ${cacheData.length}`);

  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

main();
