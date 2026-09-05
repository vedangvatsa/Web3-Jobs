import fs from 'fs';
import path from 'path';

interface MokaJob {
  id: string;
  title: string;
  department?: { name: string };
  publishedAt?: string;
  locations?: Array<{ country?: string; cityName?: string; provinceName?: string }>;
  jobDescription?: string;
  status?: string;
}

async function ingestKuCoin() {
  console.log('Fetching KuCoin jobs from MokaHR API...');
  const res = await fetch('https://hire-r1.mokahr.com/api/outer/ats-apply/website/jobs/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Referer': 'https://hire-r1.mokahr.com/social-recruitment/kcareers/100000192?locale=en-US'
    },
    body: JSON.stringify({
      orgId: 'kcareers',
      siteId: 100000192,
      pageSize: 200,
      page: 1
    })
  });

  const json = await res.json();
  if (!json.data || !json.data.jobs) {
    throw new Error(`Failed to fetch jobs: ${JSON.stringify(json)}`);
  }

  const rawJobs: MokaJob[] = json.data.jobs;
  console.log(`Fetched ${rawJobs.length} active KuCoin jobs from MokaHR.`);

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const descPath = path.join(process.cwd(), 'content/job-descriptions.json');
  const descData = fs.existsSync(descPath) ? JSON.parse(fs.readFileSync(descPath, 'utf8')) : {};

  const existingIds = new Set(cacheData.map((j: any) => j.id));
  let addedCount = 0;
  let updatedCount = 0;

  for (const r of rawJobs) {
    if (r.status !== 'open' && r.status !== undefined) continue;

    const locs = (r.locations || [])
      .map(l => l.country || l.cityName || l.provinceName)
      .filter(Boolean);
    const locationStr = locs.length > 0 ? Array.from(new Set(locs)).join(', ') : 'Remote / Global';

    const formattedJob = {
      id: r.id,
      title: r.title,
      company: 'KuCoin',
      link: `https://hire-r1.mokahr.com/social-recruitment/kcareers/100000192?locale=en-US#/job/${r.id}`,
      date: r.publishedAt ? r.publishedAt.slice(0, 10) : '2026-09-02',
      source: 'MokaHR: KuCoin [kcareers]',
      location: locationStr,
      department: r.department?.name || 'Operations',
      description: r.jobDescription || '',
      active: true
    };

    if (r.jobDescription) {
      descData[r.id] = r.jobDescription;
    }

    if (!existingIds.has(r.id)) {
      cacheData.unshift(formattedJob);
      existingIds.add(r.id);
      addedCount++;
    } else {
      const existing = cacheData.find((j: any) => j.id === r.id);
      if (existing && !existing.description && r.jobDescription) {
        existing.description = r.jobDescription;
        updatedCount++;
      }
    }
  }

  console.log(`Added ${addedCount} new KuCoin jobs, updated descriptions for ${updatedCount} existing. Total jobs: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
  fs.writeFileSync(descPath, JSON.stringify(descData, null, 2));
}

ingestKuCoin().catch(err => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
