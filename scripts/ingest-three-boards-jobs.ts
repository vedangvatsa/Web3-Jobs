import fs from 'fs';
import path from 'path';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const NOW = new Date('2026-09-02T00:00:00Z').getTime();
const CUTOFF = NOW - THIRTY_DAYS_MS; // 2026-08-03

const mudrexJobsRaw = [
  {
    id: 'e3cc90e9-7052-4c0d-90e9-fb5dd6e2e826',
    title: 'Product Marketing Associate',
    company: 'Mudrex',
    link: 'https://mudrex.careers-page.com/jobs/e3cc90e9-7052-4c0d-90e9-fb5dd6e2e826',
    date: '2026-08-28',
    source: 'Manatal: Mudrex [mudrex]',
    location: 'Bengaluru, India (Hybrid)',
    department: 'Marketing',
    active: true,
    slug: 'marketinge3cc9'
  },
  {
    id: '10ddbf5a-4d2e-48b3-bb38-d928e484766d',
    title: 'Customer Success Executive',
    company: 'Mudrex',
    link: 'https://mudrex.careers-page.com/jobs/10ddbf5a-4d2e-48b3-bb38-d928e484766d',
    date: '2026-08-26',
    source: 'Manatal: Mudrex [mudrex]',
    location: 'Bengaluru, India (On-site)',
    department: 'Operations & Support',
    active: true,
    slug: 'associate10ddb'
  },
  {
    id: '2e083960-894c-4bdd-aee6-1c586c055d08',
    title: 'Sr. Associate - PR & Communications',
    company: 'Mudrex',
    link: 'https://mudrex.careers-page.com/jobs/2e083960-894c-4bdd-aee6-1c586c055d08',
    date: '2026-08-25',
    source: 'Manatal: Mudrex [mudrex]',
    location: 'Bengaluru, India (Hybrid)',
    department: 'Communications',
    active: true,
    slug: 'associate2e083'
  },
  {
    id: '7ef5251c-7aba-42c4-bbee-f910e85f97f1',
    title: 'Associate Product Manager (Data & Compliance)',
    company: 'Mudrex',
    link: 'https://mudrex.careers-page.com/jobs/7ef5251c-7aba-42c4-bbee-f910e85f97f1',
    date: '2026-08-24',
    source: 'Manatal: Mudrex [mudrex]',
    location: 'Bengaluru, India (On-site)',
    department: 'Product & Compliance',
    active: true,
    slug: 'product7ef52'
  },
  {
    id: 'a8daab4f-a1d5-4139-9ba5-2390b48ee5f6',
    title: 'Sr Manager, Business Development',
    company: 'Mudrex',
    link: 'https://mudrex.careers-page.com/jobs/a8daab4f-a1d5-4139-9ba5-2390b48ee5f6',
    date: '2026-08-22',
    source: 'Manatal: Mudrex [mudrex]',
    location: 'Bengaluru, India / Remote',
    department: 'Business Development',
    active: true,
    slug: 'managera8daa'
  },
  {
    id: '348c3291-ed0a-4179-b046-4d844f983172',
    title: 'Senior Product Manager, Investments & Derivatives Products',
    company: 'Mudrex',
    link: 'https://mudrex.careers-page.com/jobs/348c3291-ed0a-4179-b046-4d844f983172',
    date: '2026-08-20',
    source: 'Manatal: Mudrex [mudrex]',
    location: 'Bengaluru, India (On-site)',
    department: 'Product',
    active: true,
    slug: 'product348c3'
  },
  {
    id: '3c2cf74d-a6b7-4e07-ac42-84753ead9ce7',
    title: 'Senior Manager - Compliance',
    company: 'Mudrex',
    link: 'https://mudrex.careers-page.com/jobs/3c2cf74d-a6b7-4e07-ac42-84753ead9ce7',
    date: '2026-08-18',
    source: 'Manatal: Mudrex [mudrex]',
    location: 'Bengaluru, India (On-site)',
    department: 'Compliance',
    active: true,
    slug: 'compliancer3c2cf'
  }
];

async function main() {
  console.log('Ingesting Bitget, Mudrex, and Hyperliquid Labs jobs...');

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  // 1. Ingest Bitget
  const bitgetRaw = JSON.parse(fs.readFileSync('bitget-raw.json', 'utf8'));
  let bitgetAdded = 0;

  for (const r of bitgetRaw) {
    const pubDate = r.publishedAt ? r.publishedAt.slice(0, 10) : '2026-08-25';
    const pubTime = new Date(pubDate).getTime();
    if (pubTime < CUTOFF) continue; // Skip older than 30 days

    const job = {
      id: r.id,
      title: r.title,
      company: 'Bitget',
      link: `https://hire-r1.mokahr.com/social-recruitment/bitget/100000079#/job/${r.id}`,
      date: pubDate,
      source: 'MokaHR: Bitget [bitget]',
      location: 'Remote / Global',
      department: r.zhineng?.name || 'Operations',
      active: true,
      slug: `operations${r.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
    };

    if (!cacheData.some((j: any) => j.id === job.id)) {
      cacheData.unshift(job);
      bitgetAdded++;
    }
  }

  // 2. Ingest Mudrex
  let mudrexAdded = 0;
  for (const mJob of mudrexJobsRaw) {
    const jobTime = new Date(mJob.date).getTime();
    if (jobTime < CUTOFF) continue;

    if (!cacheData.some((j: any) => j.id === mJob.id)) {
      cacheData.unshift(mJob);
      mudrexAdded++;
    }
  }

  // 3. Ingest Hyperliquid Labs (Check 30-day cutoff)
  const hyperRaw = JSON.parse(fs.readFileSync('hyperliquid-raw.json', 'utf8'));
  let hyperAdded = 0;

  for (const h of hyperRaw) {
    const pubDate = h.publishedAt ? h.publishedAt.slice(0, 10) : '2025-10-20';
    const pubTime = new Date(pubDate).getTime();

    // Check cutoff (note: Hyperliquid's positions are older than 30 days, so pubTime < CUTOFF)
    if (pubTime >= CUTOFF) {
      const job = {
        id: h.id,
        title: h.title,
        company: 'Hyperliquid Labs',
        link: h.jobUrl || `https://jobs.ashbyhq.com/Hyperliquid%20Labs/${h.id}`,
        date: pubDate,
        source: 'Ashby: Hyperliquid Labs [hyperliquid]',
        location: h.location || 'APAC',
        department: h.department || 'Engineering',
        active: true,
        slug: `developer${h.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
      };

      if (!cacheData.some((j: any) => j.id === job.id)) {
        cacheData.unshift(job);
        hyperAdded++;
      }
    }
  }

  console.log(`Bitget jobs added (<= 30 days): ${bitgetAdded}`);
  console.log(`Mudrex jobs added (<= 30 days): ${mudrexAdded}`);
  console.log(`Hyperliquid Labs jobs added (<= 30 days): ${hyperAdded}`);
  console.log(`Total jobs in cache: ${cacheData.length}`);

  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

main();
