import fs from 'fs';
import path from 'path';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const NOW = new Date('2026-09-02T00:00:00Z').getTime();
const CUTOFF = NOW - THIRTY_DAYS_MS; // 2026-08-03 (timestamp: 1785715200000)

function main() {
  const getroFile = JSON.parse(fs.readFileSync('getro-success-0.json', 'utf8'));
  const rawJobs = getroFile.results?.jobs || [];
  console.log(`Found ${rawJobs.length} raw jobs in getro-success-0.json`);

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let added = 0;

  for (const j of rawJobs) {
    const createdAtSec = j.created_at || j.published_at || 0;
    const pubTime = createdAtSec * 1000;

    if (pubTime < CUTOFF) {
      console.log(`[Too Old] ${j.organization?.name} - ${j.title} (${new Date(pubTime).toISOString().slice(0,10)})`);
      continue;
    }

    const pubDate = new Date(pubTime).toISOString().slice(0, 10);
    const company = j.organization?.name || j.company_name || 'LongHash Portfolio';
    const loc = j.searchable_locations && j.searchable_locations.length > 0 ? j.searchable_locations.join(', ') : (j.work_mode || 'Remote');
    const dept = j.job_function || j.department || 'Engineering';
    const jobUrl = j.url || j.apply_url;

    const uuidMatch = jobUrl ? jobUrl.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i) : null;
    const jobId = uuidMatch ? uuidMatch[1] : (j.id ? String(j.id) : jobUrl);

    const formattedJob = {
      id: jobId,
      title: j.title,
      company: company,
      link: jobUrl,
      date: pubDate,
      source: `LongHash: ${company} [longhash]`,
      location: loc,
      department: dept,
      active: true,
      slug: `role${String(jobId).replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
    };

    if (!cacheData.some((existing: any) => existing.id === formattedJob.id || existing.link === formattedJob.link)) {
      cacheData.unshift(formattedJob);
      added++;
      console.log(`✅ [ADDED] ${company} - ${j.title} (${pubDate})`);
    } else {
      console.log(`[Already in cache] ${company} - ${j.title}`);
    }
  }

  console.log(`\nIngested ${added} fresh (<= 30 days old) jobs from LongHash. Total jobs in cache: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

main();
