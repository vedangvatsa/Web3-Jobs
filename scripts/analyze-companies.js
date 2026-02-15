const fs = require('fs');
const path = require('path');

// Read jobs cache
const jobsCache = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../content/jobs-cache.json'), 'utf-8')
);

// Count jobs by company
const companyCounts = {};
jobsCache.forEach(job => {
  const company = job.company;
  if (!companyCounts[company]) {
    companyCounts[company] = 0;
  }
  companyCounts[company]++;
});

// Sort by count
const sorted = Object.entries(companyCounts)
  .map(([company, count]) => ({ company, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 20);

console.log(JSON.stringify(sorted, null, 2));
