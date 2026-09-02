import fs from 'fs';
import path from 'path';

function ingestRevolut() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const revolutJob = {
    id: '1f673184-3fe0-4a7b-9593-d7ecbe0fcc09',
    title: 'Strategy & Operations Manager (Crypto)',
    company: 'Revolut',
    link: 'https://www.revolut.com/careers/position/1f673184-3fe0-4a7b-9593-d7ecbe0fcc09/',
    date: '2026-09-02',
    source: 'Revolut Careers [revolut]',
    location: 'Bangalore, Barcelona, Dubai, Krakow, Lisbon, London, Madrid, Mumbai, Vilnius (Remote / Hybrid)',
    department: 'Crypto & Digital Assets',
    active: true,
    slug: 'operations1f673'
  };

  const existingIndex = cacheData.findIndex((j: any) => j.id === revolutJob.id || j.link === revolutJob.link);
  if (existingIndex >= 0) {
    cacheData[existingIndex] = { ...cacheData[existingIndex], ...revolutJob };
    console.log('Updated Revolut Crypto job in cache.');
  } else {
    cacheData.unshift(revolutJob);
    console.log('Added Revolut Crypto job to cache.');
  }

  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

ingestRevolut();
