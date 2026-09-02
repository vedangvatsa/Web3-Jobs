import fs from 'fs';
import path from 'path';

const NOW = new Date('2026-09-02T00:00:00Z').getTime();
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const CUTOFF_TIME = NOW - THIRTY_DAYS_MS; // 2026-08-03

function audit() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const jobs = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let recentCount = 0;
  let oldCount = 0;

  const filteredJobs = [];
  const removedJobsByCompany = new Map<string, number>();

  for (const j of jobs) {
    if (!j.date) {
      oldCount++;
      continue;
    }

    const jobDate = new Date(j.date).getTime();
    if (isNaN(jobDate)) {
      oldCount++;
      continue;
    }

    if (jobDate >= CUTOFF_TIME) {
      recentCount++;
      filteredJobs.push(j);
    } else {
      oldCount++;
      const count = removedJobsByCompany.get(j.company) || 0;
      removedJobsByCompany.set(j.company, count + 1);
    }
  }

  console.log(`Total jobs before pruning: ${jobs.length}`);
  console.log(`Jobs within 30 days (>= 2026-08-03): ${recentCount}`);
  console.log(`Jobs older than 30 days (< 2026-08-03): ${oldCount}`);

  console.log('\nKuCoin jobs remaining:');
  const kucoinJobs = filteredJobs.filter(j => j.company.toLowerCase() === 'kucoin');
  console.log(`KuCoin count (<= 30 days old): ${kucoinJobs.length}`);
  kucoinJobs.forEach(j => console.log(` - [${j.date}] ${j.title}`));

  console.log('\nRevolut jobs remaining:');
  const revolutJobs = filteredJobs.filter(j => j.company.toLowerCase() === 'revolut');
  console.log(`Revolut count (<= 30 days old): ${revolutJobs.length}`);
  revolutJobs.forEach(j => console.log(` - [${j.date}] ${j.title}`));

  // Prune jobs-cache.json
  fs.writeFileSync(cachePath, JSON.stringify(filteredJobs, null, 2));
  console.log(`\nUpdated jobs-cache.json with ${filteredJobs.length} jobs <= 30 days old.`);
}

audit();
