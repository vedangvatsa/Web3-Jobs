import fs from 'fs';
import path from 'path';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { getJobContentKey } from '../src/lib/job-slugs';

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  updated_at?: string;
  location?: { name?: string };
  departments?: Array<{ name?: string }>;
  content?: string;
}

async function main() {
  console.log('Fetching live Digital Asset jobs from Greenhouse API...');
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const descPath = path.join(process.cwd(), 'content/job-descriptions.json');
  const descData = fs.existsSync(descPath) ? JSON.parse(fs.readFileSync(descPath, 'utf8')) : {};

  try {
    const res = await fetch('https://boards-api.greenhouse.io/v1/boards/digitalassetcorp/jobs?content=true');
    if (!res.ok) throw new Error(`Greenhouse HTTP ${res.status}`);
    const json = (await res.json()) as { jobs: GreenhouseJob[] };
    const rawJobs = json.jobs || [];
    console.log(`Fetched ${rawJobs.length} active Digital Asset jobs from Greenhouse.`);

    let added = 0;
    let updated = 0;

    for (const j of rawJobs) {
      if (!isConcreteJobOpening(j.title, j.absolute_url)) continue;

      const pubDate = j.updated_at ? new Date(j.updated_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
      const loc = j.location?.name || 'New York City / Remote';
      const dept = j.departments && j.departments.length > 0 ? j.departments[0].name : 'Engineering';

      const job = {
        id: String(j.id),
        title: j.title.trim(),
        company: 'Digital Asset',
        link: j.absolute_url || `https://job-boards.greenhouse.io/digitalassetcorp/jobs/${j.id}`,
        date: pubDate,
        source: 'Greenhouse: Digital Asset [digitalassetcorp]',
        location: loc,
        department: dept,
        active: true,
        slug: `role${String(j.id).slice(-5).toLowerCase()}`
      };

      const existingIdx = cacheData.findIndex((existing: any) => existing.id === job.id || existing.link === job.link);
      if (existingIdx === -1) {
        cacheData.unshift(job);
        added++;
      } else {
        cacheData[existingIdx] = { ...cacheData[existingIdx], ...job, slug: cacheData[existingIdx].slug || job.slug };
        updated++;
      }

      if (j.content) {
        descData[getJobContentKey(job)] = j.content;
      }
    }

    console.log(`Digital Asset: ${added} added, ${updated} updated. Total cache: ${cacheData.length}`);
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
    fs.writeFileSync(descPath, JSON.stringify(descData, null, 2));
  } catch (err: any) {
    console.warn(`⚠️ Digital Asset fetch warning: ${err.message}`);
  }
}

main();
