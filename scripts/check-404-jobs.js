const fs = require('fs');
const https = require('https');
const http = require('http');

async function checkJobs() {
  const csv = fs.readFileSync('/Users/vedang/web3jobs/Web3-Jobs/jobs-extracted.csv', 'utf8');
  const lines = csv.split('\n');
  
  // We'll check all companies
  const jobsToCheck = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    // Naive CSV split
    const parts = line.split(',');
    if (parts.length >= 2) {
      const url = parts[0];
      const company = parts[1];
      
      // Let's grab all coinbase jobs, and a sample of others to see what's 404ing
      if (company.toLowerCase() === 'coinbase') {
        jobsToCheck.push({ url, company });
      } else if (Math.random() < 0.1) { // 10% sample of other companies
        jobsToCheck.push({ url, company });
      }
    }
  }

  console.log(`Found ${jobsToCheck.length} jobs to check...`);

  let count404 = 0;
  
  const resultsByCompany = {};

  // Check jobs in parallel batches
  const batchSize = 100;
  for (let i = 0; i < jobsToCheck.length; i += batchSize) {
    const batch = jobsToCheck.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (job) => {
      if (!resultsByCompany[job.company]) {
        resultsByCompany[job.company] = { total: 0, _404: 0, ok: 0, other: 0 };
      }
      
      resultsByCompany[job.company].total++;
      
      try {
        const response = await fetch(job.url, { method: 'HEAD', redirect: 'follow' });
        if (response.status === 404) {
          resultsByCompany[job.company]._404++;
          count404++;
        } else if (response.status >= 200 && response.status < 400) {
          resultsByCompany[job.company].ok++;
        } else {
          resultsByCompany[job.company].other++;
        }
      } catch (err) {
        resultsByCompany[job.company].other++;
      }
    }));
    
    process.stdout.write(`\rChecked ${Math.min(i + batchSize, jobsToCheck.length)} / ${jobsToCheck.length}`);
  }

  console.log('\n\nResults by Company (sample for non-Coinbase):');
  
  // Only show companies with 404s
  const with404s = Object.fromEntries(
    Object.entries(resultsByCompany).filter(([_, data]) => data._404 > 0)
  );
  
  console.table(with404s);
}

checkJobs();
