import fs from 'fs';
import path from 'path';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const NOW = new Date('2026-09-02T00:00:00Z').getTime();
const CUTOFF = NOW - THIRTY_DAYS_MS; // 2026-08-03

async function ingestMarketnode(cacheData: any[], descData: Record<string, string>) {
  let added = 0;
  let updated = 0;

  try {
    console.log('Fetching Marketnode jobs from OmniHR careers page...');
    const res = await fetch('https://marketnode.recruit.omnihr.co/careers', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);

    if (!m) {
      console.warn('Could not find __NEXT_DATA__ on Marketnode careers page');
      return;
    }

    const data = JSON.parse(m[1]);
    const jobs = data.props?.pageProps?.job_data?.jobs || [];
    console.log(`Found ${jobs.length} active Marketnode jobs on OmniHR.`);

    for (const j of jobs) {
      const slug = j.slug || j.job_title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const directUrl = `https://marketnode.recruit.omnihr.co/careers/${slug}`;
      const id = `mn-${slug}`;
      const location = j.location_attributes?.city
        ? `${j.location_attributes.city}, ${j.location_attributes.country}`
        : (j.city_country || 'Remote / Hybrid');
      const dept = j.department?.name || (j.seniority_level ? 'Engineering' : 'General');
      const dateStr = j.location_attributes?.created_at
        ? j.location_attributes.created_at.slice(0, 10)
        : '2026-08-28';

      const existingJob = cacheData.find((existing: any) =>
        existing.id === id ||
        (existing.company === 'Marketnode' && existing.title.toLowerCase() === j.job_title.toLowerCase())
      );

      if (existingJob) {
        existingJob.link = directUrl;
        if (j.description) {
          existingJob.description = j.description;
          descData[existingJob.id] = j.description;
        }
        updated++;
      } else {
        const formatted = {
          id,
          title: j.job_title,
          company: 'Marketnode',
          link: directUrl,
          date: dateStr,
          source: 'OmniHR: Marketnode [omnihr]',
          location,
          department: dept,
          active: true,
          description: j.description || '',
          slug: `role${id.slice(-5).toLowerCase()}`
        };
        cacheData.unshift(formatted);
        if (j.description) {
          descData[id] = j.description;
        }
        added++;
      }
    }

    console.log(`Ingested ${added} new Marketnode jobs, updated ${updated} existing Marketnode jobs.`);
  } catch (err) {
    console.error('Failed to ingest Marketnode jobs:', err);
  }
}

function ingestXT(cacheData: any[]) {
  let added = 0;
  if (!fs.existsSync('xt-api-jobs.json')) {
    console.log('xt-api-jobs.json not found, skipping XT.com.');
    return;
  }
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

async function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const descPath = path.join(process.cwd(), 'content/job-descriptions.json');
  const descData = fs.existsSync(descPath) ? JSON.parse(fs.readFileSync(descPath, 'utf8')) : {};

  await ingestMarketnode(cacheData, descData);
  ingestXT(cacheData);

  console.log(`Total jobs in cache after Marketnode & XT.com ingestion: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
  fs.writeFileSync(descPath, JSON.stringify(descData, null, 2));
}

main().catch(err => {
  console.error('Error running Marketnode & XT ingestion:', err);
  process.exit(1);
});
