import fs from 'fs';
import path from 'path';

const NOW = new Date('2026-09-02T00:00:00Z').getTime();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const CUTOFF = NOW - THIRTY_DAYS_MS; // 2026-08-03

function ingest(companyName: string, sourceName: string, rawFile: string, cacheData: any[]) {
  const jobs = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
  let added = 0;

  for (const j of jobs) {
    const t = typeof j.createdAt === 'number' ? j.createdAt : new Date(j.createdAt).getTime();
    if (t < CUTOFF) continue;

    const pubDate = new Date(t).toISOString().slice(0, 10);
    const loc = j.categories?.location || j.categories?.allLocations?.join(', ') || 'Remote';
    const dept = j.categories?.department || j.categories?.team || 'Operations';

    const formattedJob = {
      id: j.id,
      title: j.text,
      company: companyName,
      link: j.hostedUrl || j.applyUrl,
      date: pubDate,
      source: sourceName,
      location: loc,
      department: dept,
      active: true,
      slug: `role${j.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
    };

    if (!cacheData.some((existing: any) => existing.id === formattedJob.id)) {
      cacheData.unshift(formattedJob);
      added++;
    }
  }

  console.log(`Ingested ${added} fresh (<= 30 days old) jobs for ${companyName}.`);
  return added;
}

function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  ingest('CertiK', 'Lever: CertiK [certik]', 'certik-raw.json', cacheData);
  ingest('Wintermute', 'Lever: Wintermute Trading [wintermute-trading]', 'wintermute-raw.json', cacheData);

  console.log(`Total jobs in cache: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

main();
