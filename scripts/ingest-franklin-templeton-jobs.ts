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
