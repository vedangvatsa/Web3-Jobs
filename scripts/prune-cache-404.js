const fs = require('fs');
const path = require('path');

const CACHE_FILE = 'content/jobs-cache.json';

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    return res.status;
  } catch (err) {
    return 0;
  }
}

async function main() {
  console.log('Reading jobs-cache.json...');
  const jobs = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  
  console.log(`Checking ${jobs.length} cached jobs for 404s...`);
  
  const validJobs = [];
  const removedJobs = [];
  
  const concurrency = 200;
  for (let i = 0; i < jobs.length; i += concurrency) {
    const chunk = jobs.slice(i, i + concurrency);
    
    await Promise.all(chunk.map(async (job) => {
      if (!job.link) return;
      const status = await checkUrl(job.link);
      
      // If exactly 404, we drop it. If 403 or 0 (network error), we KEEP it to be safe.
      if (status === 404) {
        removedJobs.push({ url: job.link, company: job.company });
      } else {
        validJobs.push(job);
      }
    }));
    
    process.stdout.write(`\rProcessed ${Math.min(i + concurrency, jobs.length)} / ${jobs.length} | Removed: ${removedJobs.length} `);
  }
  
  console.log(`\n\nFinished! Found ${removedJobs.length} 404 dead links in jobs-cache.json.`);
  
  // Write the cleaned JSON back to jobs-cache.json
  fs.writeFileSync(CACHE_FILE, JSON.stringify(validJobs, null, 2));
  console.log(`Successfully updated jobs-cache.json with ${validJobs.length} active jobs.`);
}

main();
