import fs from 'fs';
import path from 'path';

const pwcWeb3Jobs = [
  {
    id: 'pwc-digital-assets-crypto-manager-ny',
    title: 'Digital Assets / Crypto Manager',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Web3 & Tech Consulting',
    active: true,
    slug: 'managerpwc01'
  },
  {
    id: 'pwc-ai-blockchain-architect-senior-manager',
    title: 'AI / Blockchain Architect Senior Manager',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'Tampa, FL / Hybrid',
    department: 'Platform Architecture & Blockchain',
    active: true,
    slug: 'architectpwc02'
  },
  {
    id: 'pwc-assurance-digital-assets-manager',
    title: 'BCM Assurance Digital Assets Manager',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'San Francisco, CA / Chicago, IL / NY (Hybrid)',
    department: 'Digital Asset Assurance & Audit',
    active: true,
    slug: 'managerpwc03'
  },
  {
    id: 'pwc-digital-assurance-digital-assets-senior-associate',
    title: 'Digital Assurance & Transparency - Digital Assets Senior Associate',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'San Francisco, CA / Hybrid',
    department: 'Digital Asset Audit & Assurance',
    active: true,
    slug: 'seniorpwc04'
  }
];

function ingestPwc() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let added = 0;
  let updated = 0;

  for (const job of pwcWeb3Jobs) {
    const idx = cacheData.findIndex((j: any) => j.id === job.id || j.link === job.link);
    if (idx >= 0) {
      cacheData[idx] = { ...cacheData[idx], ...job };
      updated++;
    } else {
      cacheData.unshift(job);
      added++;
    }
  }

  console.log(`Ingested PwC Web3 Jobs: ${added} added, ${updated} updated. Total jobs: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

ingestPwc();
