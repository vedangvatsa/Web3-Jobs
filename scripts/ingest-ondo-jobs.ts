import fs from 'fs';
import path from 'path';

const NOW = new Date('2026-09-02T00:00:00Z').getTime();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const CUTOFF = NOW - THIRTY_DAYS_MS; // 2026-08-03

function main() {
  const rawJobs = JSON.parse(fs.readFileSync('ondo-raw.json', 'utf8'));
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let added = 0;

  for (const j of rawJobs) {
    const pubStr = j.updated_at || j.created_at;
    const pubTime = pubStr ? new Date(pubStr).getTime() : 0;
    if (pubTime < CUTOFF) continue; // Skip jobs older than 30 days

    const pubDate = pubStr ? new Date(pubTime).toISOString().slice(0, 10) : '2026-08-20';
    const loc = j.location?.name || 'Remote (US)';
    const dept = j.departments && j.departments.length > 0 ? j.departments[0].name : 'Engineering';

    const job = {
      id: String(j.id),
      title: j.title,
      company: 'Ondo Finance',
      link: j.absolute_url || `https://job-boards.greenhouse.io/ondofinance/jobs/${j.id}`,
      date: pubDate,
      source: 'Greenhouse: Ondo Finance [ondofinance]',
      location: loc,
      department: dept,
      active: true,
      slug: `role${String(j.id).slice(-5).toLowerCase()}`
    };

    if (!cacheData.some((existing: any) => existing.id === job.id || existing.link === job.link)) {
      cacheData.unshift(job);
      added++;
    }
  }

  console.log(`Ingested ${added} fresh (<= 30 days old) jobs for Ondo Finance. Total jobs in cache: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

main();
