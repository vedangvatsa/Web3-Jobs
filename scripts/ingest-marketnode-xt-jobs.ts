import fs from 'fs';
import path from 'path';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const NOW = new Date('2026-09-02T00:00:00Z').getTime();
const CUTOFF = NOW - THIRTY_DAYS_MS; // 2026-08-03

function ingestMarketnode(cacheData: any[]) {
  let added = 0;
  const marketnodeJobs = [
    { title: 'Tech Lead - Digital Assets', location: 'Singapore, Singapore', dept: 'Engineering', date: '2026-08-28', link: 'https://marketnode.recruit.omnihr.co/careers' },
    { title: 'Web3 Engineer', location: 'Bengaluru, India', dept: 'Engineering', date: '2026-08-28', link: 'https://marketnode.recruit.omnihr.co/careers' },
    { title: 'Senior Java Engineer – Full Stack', location: 'Bengaluru, India', dept: 'Engineering', date: '2026-08-25', link: 'https://marketnode.recruit.omnihr.co/careers' },
    { title: 'Senior DevOps Engineer', location: 'Bengaluru, India', dept: 'DevOps & Infra', date: '2026-08-25', link: 'https://marketnode.recruit.omnihr.co/careers' },
    { title: 'Test Engineer – Automation', location: 'Bengaluru, India', dept: 'Quality Engineering', date: '2026-08-22', link: 'https://marketnode.recruit.omnihr.co/careers' },
    { title: 'Test Engineer', location: 'Bengaluru, India', dept: 'Quality Engineering', date: '2026-08-20', link: 'https://marketnode.recruit.omnihr.co/careers' }
  ];

  for (const j of marketnodeJobs) {
    const id = `mn-${j.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const formatted = {
      id,
      title: j.title,
      company: 'Marketnode',
      link: j.link,
      date: j.date,
      source: 'OmniHR: Marketnode [omnihr]',
      location: j.location,
      department: j.dept,
      active: true,
      slug: `role${id.slice(-5).toLowerCase()}`
    };

    if (!cacheData.some((existing: any) => existing.id === formatted.id || (existing.title === formatted.title && existing.company === 'Marketnode'))) {
      cacheData.unshift(formatted);
      added++;
    }
  }

  console.log(`Ingested ${added} Marketnode jobs.`);
}

function ingestXT(cacheData: any[]) {
  let added = 0;
  const xtFile = JSON.parse(fs.readFileSync('xt-api-jobs.json', 'utf8'));
  const items = xtFile.data?.items || [];

  for (const j of items) {
    const pubStr = j.publishedAt;
    const pubTime = pubStr ? new Date(pubStr).getTime() : 0;
    if (pubTime < CUTOFF) continue; // Skip jobs older than 30 days

    const pubDate = pubStr ? new Date(pubTime).toISOString().slice(0, 10) : '2026-08-20';
    const loc = j.locations && j.locations.length > 0 ? (j.locations[0].address || j.locations[0].country) : 'Remote / Dubai / Global';
    const id = `xt-${j.id}`;

    const formatted = {
      id,
      title: j.title,
      company: 'XT.com Exchange',
      link: `https://www.xt.com/en/careers#position-${j.id}`,
      date: pubDate,
      source: 'XT.com Careers [xt.com]',
      location: loc,
      department: 'Exchange Operations',
      active: true,
      slug: `role${id.slice(-5).toLowerCase()}`
    };

    if (!cacheData.some((existing: any) => existing.id === formatted.id || existing.link === formatted.link)) {
      cacheData.unshift(formatted);
      added++;
    }
  }

  console.log(`Ingested ${added} fresh XT.com jobs.`);
}

function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  ingestMarketnode(cacheData);
  ingestXT(cacheData);

  console.log(`Total jobs in cache after Marketnode & XT.com ingestion: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

main();
