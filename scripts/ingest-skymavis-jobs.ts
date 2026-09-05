import fs from 'fs';
import path from 'path';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { getJobContentKey } from '../src/lib/job-slugs';

interface AshbyJob {
  id: string;
  title: string;
  department?: string;
  team?: string;
  publishedAt?: string;
  location?: string;
  secondaryLocations?: string[];
  jobUrl?: string;
  descriptionHtml?: string;
}

async function main() {
  console.log('Fetching live Sky Mavis jobs from Ashby API...');
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const descPath = path.join(process.cwd(), 'content/job-descriptions.json');
  const descData = fs.existsSync(descPath) ? JSON.parse(fs.readFileSync(descPath, 'utf8')) : {};

  try {
    const res = await fetch('https://api.ashbyhq.com/posting-api/job-board/skymavis');
    if (!res.ok) throw new Error(`Ashby HTTP ${res.status}`);
    const json = (await res.json()) as { jobs: AshbyJob[] };
    const rawJobs = json.jobs || [];
    console.log(`Fetched ${rawJobs.length} active Sky Mavis jobs from Ashby.`);

    let added = 0;
    let updated = 0;

    for (const j of rawJobs) {
      if (!isConcreteJobOpening(j.title, j.jobUrl)) continue;

      const pubDate = j.publishedAt ? new Date(j.publishedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
      const loc = j.location || (j.secondaryLocations && j.secondaryLocations.length > 0 ? j.secondaryLocations.join(', ') : 'Remote / Vietnam');
      const dept = j.department || j.team || 'Operations';

      const job = {
        id: j.id,
        title: j.title.trim(),
        company: 'Sky Mavis',
        link: j.jobUrl || `https://jobs.ashbyhq.com/skymavis/${j.id}`,
        date: pubDate,
        source: 'Ashby: Sky Mavis [skymavis]',
        location: loc,
        department: dept,
        active: true,
        slug: `role${j.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
      };

      const existingIdx = cacheData.findIndex((existing: any) => existing.id === job.id || existing.link === job.link);
      if (existingIdx === -1) {
        cacheData.unshift(job);
        added++;
      } else {
        cacheData[existingIdx] = { ...cacheData[existingIdx], ...job, slug: cacheData[existingIdx].slug || job.slug };
        updated++;
      }

      if (j.descriptionHtml) {
        descData[getJobContentKey(job)] = j.descriptionHtml;
      }
    }

    console.log(`Sky Mavis: ${added} added, ${updated} updated. Total cache: ${cacheData.length}`);
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
    fs.writeFileSync(descPath, JSON.stringify(descData, null, 2));
  } catch (err: any) {
    console.warn(`⚠️ Sky Mavis fetch warning: ${err.message}`);
  }
}

main();
