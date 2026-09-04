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
    id: 'ft-director-digital-audience-engagement',
    title: 'Director, Digital Audience Engagement (Crypto & Web3)',
    company: 'Franklin Templeton',
    link: 'https://careers.franklintempleton.com/us/en/search-results?m=3&keywords=crypto',
    date: '2026-09-04',
    source: 'Franklin Templeton Careers [franklin-templeton]',
    location: 'San Mateo, CA / Hybrid',
    department: 'Digital Asset Marketing',
    active: true,
    slug: 'marketingft02'
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
