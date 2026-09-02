import fs from 'fs';

const cache = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8'));
const script = fs.readFileSync('scripts/refresh-jobs-cache.ts', 'utf8');

const cacheCompanies = new Set(cache.map(j => j.company));

// Extract all company names configured across all ATS providers in script
const configuredCompanies = new Set();
const regex = /company:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = regex.exec(script)) !== null) {
  configuredCompanies.add(m[1]);
}

console.log("Total unique companies configured to fetch:", configuredCompanies.size);
console.log("Total companies currently rendering active jobs in cache:", cacheCompanies.size);
