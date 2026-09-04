import fs from 'fs';
import path from 'path';

const franklinTempletonJobs = [
  {
    id: 'ft-digital-product-manager-blockchain',
    title: 'Digital Product Manager (Blockchain & Digital Assets)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=blockchain',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Remote (US)',
    department: 'Digital Assets & Tokenization',
    active: true,
    slug: 'productft01'
  },
  {
    id: 'ft-digital-product-manager-hyderabad',
    title: 'Digital Product Manager (Digital Assets & Web3)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=blockchain',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'Hyderabad, India (Hybrid)',
    department: 'Digital Wealth & Tokenization',
    active: true,
    slug: 'productft02'
  },
  {
    id: 'ft-director-digital-audience-engagement',
    title: 'Director, Digital Audience Engagement (Crypto & Web3)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Hybrid',
    department: 'Digital Asset Marketing',
    active: true,
    slug: 'marketingft03'
  },
  {
    id: 'ft-program-manager-digital-audience-engagement',
    title: 'Program Manager, Digital Audience Engagement (Digital Assets)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=blockchain',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'New York, NY / Hybrid',
    department: 'Digital Assets & Innovation',
    active: true,
    slug: 'managerft04'
  },
  {
    id: 'ft-senior-administrative-assistant-crypto',
    title: 'Senior Administrative Assistant (Franklin Templeton Crypto)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=blockchain',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'New York, NY / Hybrid',
    department: 'Crypto Operations',
    active: true,
    slug: 'operationsft05'
  },
  {
    id: 'ft-senior-research-analyst-digital-assets',
    title: 'Senior Research Analyst (Digital Assets & Crypto)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / New York, NY',
    department: 'Digital Assets Research',
    active: true,
    slug: 'researchft06'
  },
  {
    id: 'ft-compliance-manager-crypto-digital-assets',
    title: 'Compliance Manager (Crypto & Digital Assets)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Remote (US)',
    department: 'Legal & Regulatory Compliance',
    active: true,
    slug: 'complianceft07'
  },
  {
    id: 'ft-digital-asset-trader-quantitative-analyst',
    title: 'Digital Asset Trader & Quantitative Analyst',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'New York, NY / Hybrid',
    department: 'Digital Asset Investment Management',
    active: true,
    slug: 'traderft08'
  },
  {
    id: 'ft-blockchain-solutions-architect',
    title: 'Blockchain Solutions Architect (Tokenized Funds & Protocols)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Remote',
    department: 'Tokenization & Protocol Engineering',
    active: true,
    slug: 'architectft09'
  },
  {
    id: 'ft-legal-counsel-digital-assets-fintech',
    title: 'Legal Counsel (Digital Assets, Crypto & Web3)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Hybrid',
    department: 'Global Legal & Regulatory',
    active: true,
    slug: 'legalft10'
  },
  {
    id: 'ft-client-relationship-manager-crypto-institutions',
    title: 'Institutional Relationship Manager (Crypto & Web3 Ecosystems)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'New York, NY / London, UK',
    department: 'Institutional Digital Assets Sales',
    active: true,
    slug: 'salesft11'
  }
];

function ingestFranklinTempleton() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let added = 0;
  let updated = 0;

  for (const job of franklinTempletonJobs) {
    const idx = cacheData.findIndex((j: any) => j.id === job.id || j.link === job.link);
    if (idx >= 0) {
      cacheData[idx] = { ...cacheData[idx], ...job };
      updated++;
    } else {
      cacheData.unshift(job);
      added++;
    }
  }

  console.log(`Ingested Franklin Templeton Jobs: ${added} added, ${updated} updated. Total jobs: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

ingestFranklinTempleton();
