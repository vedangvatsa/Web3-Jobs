import fs from 'fs';
import path from 'path';

const pwcWeb3Jobs = [
  {
    id: 'pwc-digital-assets-senior-manager-tech',
    title: 'Digital Assets Senior Manager (Technology)',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Web3 & Tech Consulting',
    active: true,
    slug: 'seniorpwc01'
  },
  {
    id: 'pwc-digital-assets-crypto-manager-ny',
    title: 'Digital Assets Manager (Technology)',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Web3 & Tech Consulting',
    active: true,
    slug: 'managerpwc02'
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
    slug: 'architectpwc03'
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
  },
  {
    id: 'pwc-bcm-assurance-digital-assets-manager',
    title: 'BCM - Assurance - Digital Assets Manager',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'San Francisco, CA / Hybrid',
    department: 'Banking & Capital Markets Assurance',
    active: true,
    slug: 'managerpwc05'
  },
  {
    id: 'pwc-awm-digital-assets-senior-manager',
    title: 'AWM - Digital Assets Senior Manager',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Asset & Wealth Management Advisory',
    active: true,
    slug: 'seniorpwc06'
  },
  {
    id: 'pwc-awm-assurance-digital-assets-manager',
    title: 'AWM - Assurance - Digital Assets Manager',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=blockchain',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Asset & Wealth Management Assurance',
    active: true,
    slug: 'managerpwc07'
  },
  {
    id: 'pwc-digital-assets-crypto-director',
    title: 'Digital Assets & Crypto Director (Consulting & Strategy)',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Hybrid',
    department: 'Web3 & Digital Assets Advisory',
    active: true,
    slug: 'directorpwc08'
  },
  {
    id: 'pwc-bcm-tax-manager-fintech-crypto',
    title: 'Banking & Capital Markets Tax Manager (FinTech & Crypto)',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / Chicago, IL / Hybrid',
    department: 'FinTech & Crypto Tax Advisory',
    active: true,
    slug: 'managerpwc09'
  },
  {
    id: 'pwc-technology-consulting-associate-digital-assets',
    title: 'Technology Consulting Associate (Digital Assets & Payments)',
    company: 'PwC',
    link: 'https://jobs-us.pwc.com/us/en/search-results?keywords=crypto',
    date: '2026-09-04',
    source: 'PwC Careers [pwc]',
    location: 'New York, NY / San Francisco, CA / Hybrid',
    department: 'Digital Assets Consulting',
    active: true,
    slug: 'associatepwc10'
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
