import fs from 'fs';
import path from 'path';

const revolutCryptoJobs = [
  {
    id: 'b195b9c7-b517-4068-b9a4-f816f1c8b1f9',
    title: 'Information Security Specialist (Crypto)',
    company: 'Revolut',
    link: 'https://www.revolut.com/careers/position/information-security-specialist-crypto-b195b9c7-b517-4068-b9a4-f816f1c8b1f9/',
    date: '2026-09-02',
    source: 'Revolut Careers [revolut]',
    location: 'Remote: Cyprus',
    department: 'Crypto Security & Engineering',
    active: true,
    slug: 'securityb195b'
  },
  {
    id: '1f673184-3fe0-4a7b-9593-d7ecbe0fcc09',
    title: 'Strategy & Operations Manager (Crypto)',
    company: 'Revolut',
    link: 'https://www.revolut.com/careers/position/strategy-operations-manager-crypto-1f673184-3fe0-4a7b-9593-d7ecbe0fcc09/',
    date: '2026-09-02',
    source: 'Revolut Careers [revolut]',
    location: 'Bangalore, Barcelona, Dubai, Krakow, Lisbon, London, Madrid, Mumbai, Vilnius (Remote / Hybrid)',
    department: 'Crypto & Digital Assets',
    active: true,
    slug: 'operations1f673'
  },
  {
    id: 'c7078b70-e10b-4f47-b983-bbe6d08d098a',
    title: 'Product Owner (Crypto)',
    company: 'Revolut',
    link: 'https://www.revolut.com/careers/position/product-owner-crypto-c7078b70-e10b-4f47-b983-bbe6d08d098a/',
    date: '2026-09-02',
    source: 'Revolut Careers [revolut]',
    location: 'Barcelona, Bucharest, Dubai, Dublin, Krakow, Lisbon, London, Madrid (Remote: Brazil, Cyprus, France, Germany, Ireland, Poland)',
    department: 'Crypto Product',
    active: true,
    slug: 'productc7078'
  },
  {
    id: '7c9aa5ba-25c6-48bf-a06e-be2957f4818f',
    title: 'Head of Finance (Crypto)',
    company: 'Revolut',
    link: 'https://www.revolut.com/careers/position/head-of-finance-crypto-7c9aa5ba-25c6-48bf-a06e-be2957f4818f/',
    date: '2026-09-02',
    source: 'Revolut Careers [revolut]',
    location: 'Remote: Luxembourg',
    department: 'Crypto Finance',
    active: true,
    slug: 'manager7c9aa'
  },
  {
    id: 'ef7bd853-526b-47ec-b506-d25ca9298dcc',
    title: 'Product Marketing Manager (Crypto)',
    company: 'Revolut',
    link: 'https://www.revolut.com/careers/position/product-marketing-manager-crypto-ef7bd853-526b-47ec-b506-d25ca9298dcc/',
    date: '2026-09-02',
    source: 'Revolut Careers [revolut]',
    location: 'Barcelona, Dubai, London, Madrid (Remote: Portugal, Spain, UAE, UK)',
    department: 'Crypto Marketing',
    active: true,
    slug: 'marketingef7bd'
  },
  {
    id: 'e9df3602-32ec-4d89-a7cf-d5c811f961db',
    title: 'Head Financial Crime Compliance (Crypto)',
    company: 'Revolut',
    link: 'https://www.revolut.com/careers/position/head-financial-crime-compliance-crypto-e9df3602-32ec-4d89-a7cf-d5c811f961db/',
    date: '2026-09-02',
    source: 'Revolut Careers [revolut]',
    location: 'Remote: Poland, Portugal, Spain, UAE',
    department: 'Crypto Compliance',
    active: true,
    slug: 'compliancee9df3'
  }
];

function ingestRevolut() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let added = 0;
  let updated = 0;

  for (const rJob of revolutCryptoJobs) {
    const idx = cacheData.findIndex((j: any) => j.id === rJob.id || j.link === rJob.link);
    if (idx >= 0) {
      cacheData[idx] = { ...cacheData[idx], ...rJob };
      updated++;
    } else {
      cacheData.unshift(rJob);
      added++;
    }
  }

  console.log(`Ingested Revolut Crypto Jobs: ${added} added, ${updated} updated. Total jobs: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

ingestRevolut();
