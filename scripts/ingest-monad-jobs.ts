import fs from 'fs';
import path from 'path';

const NOW = new Date('2026-09-02T00:00:00Z').getTime();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const CUTOFF = NOW - THIRTY_DAYS_MS; // 2026-08-03

function main() {
  const rawJobs = JSON.parse(fs.readFileSync('monad-foundation-raw.json', 'utf8'));
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let added = 0;

  for (const j of rawJobs) {
    const pubTime = j.publishedAt ? new Date(j.publishedAt).getTime() : 0;
    if (pubTime < CUTOFF) continue; // Skip jobs older than 30 days

    const pubDate = new Date(pubTime).toISOString().slice(0, 10);
    const loc = j.location || (j.secondaryLocations && j.secondaryLocations.length > 0 ? j.secondaryLocations.join(', ') : 'New York City / Remote');
    const dept = j.department || j.team || 'Business Development';

    const job = {
      id: j.id,
      title: j.title,
      company: 'Monad Foundation',
      link: j.jobUrl || `https://jobs.ashbyhq.com/monad.foundation/${j.id}`,
      date: pubDate,
      source: 'Ashby: Monad Foundation [monad.foundation]',
      location: loc,
      department: dept,
      active: true,
      slug: `role${j.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
    };

    if (!cacheData.some((existing: any) => existing.id === job.id || existing.link === job.link)) {
      cacheData.unshift(job);
      added++;
    }
  }

  console.log(`Ingested ${added} fresh (<= 30 days old) jobs for Monad Foundation. Total jobs in cache: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

main();
