import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const NOW = new Date('2026-09-02T00:00:00Z').getTime();
const CUTOFF = NOW - THIRTY_DAYS_MS; // 2026-08-03

const BOARDS = [
  { company: 'Matter Labs (zkSync)', type: 'ashby', slug: 'matter-labs' },
  { company: 'LayerZero', type: 'greenhouse', slug: 'layerzerolabs' },
  { company: 'Offchain Labs (Arbitrum)', type: 'lever', slug: 'offchainlabs' },
  { company: 'Jito Labs', type: 'ashby', slug: 'jito-labs' },
  { company: 'OpenSea', type: 'ashby', slug: 'opensea' },
  { company: 'Aptos Labs', type: 'greenhouse', slug: 'aptoslabs' },
  { company: 'Uniswap Labs', type: 'ashby', slug: 'uniswap' },
  { company: 'Movement Labs', type: 'ashby', slug: 'movement' },
  { company: 'Ethena Labs', type: 'lever', slug: 'ethena' },
  { company: 'EigenLayer', type: 'ashby', slug: 'eigen-labs' }
];

async function fetchBoard(b: any) {
  if (b.type === 'ashby') {
    try {
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${b.slug}?includeCompensation=true`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.jobs || []).map((j: any) => ({
        id: j.id,
        title: j.title,
        company: b.company,
        link: j.jobUrl || `https://jobs.ashbyhq.com/${b.slug}/${j.id}`,
        pubStr: j.publishedAt,
        location: j.location || (j.secondaryLocations && j.secondaryLocations.length > 0 ? j.secondaryLocations.join(', ') : 'Remote'),
        department: j.department || j.team || 'Engineering',
        source: `Ashby: ${b.company} [${b.slug}]`
      }));
    } catch (e) { return []; }
  } else if (b.type === 'greenhouse') {
    try {
      const res = await fetch(`https://api.greenhouse.io/v1/boards/${b.slug}/jobs?content=true`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.jobs || []).map((j: any) => ({
        id: String(j.id),
        title: j.title,
        company: b.company,
        link: j.absolute_url,
        pubStr: j.updated_at || j.created_at,
        location: j.location?.name || 'Remote',
        department: j.departments && j.departments.length > 0 ? j.departments[0].name : 'Engineering',
        source: `Greenhouse: ${b.company} [${b.slug}]`
      }));
    } catch (e) { return []; }
  } else if (b.type === 'lever') {
    try {
      const res = await fetch(`https://api.lever.co/v0/postings/${b.slug}?mode=json`);
      if (!res.ok) return [];
      const jobs = await res.json();
      if (!Array.isArray(jobs)) return [];
      return jobs.map((j: any) => ({
        id: j.id,
        title: j.text,
        company: b.company,
        link: j.hostedUrl,
        pubStr: j.createdAt ? new Date(j.createdAt).toISOString() : '',
        location: j.categories?.location || 'Remote',
        department: j.categories?.department || 'Engineering',
        source: `Lever: ${b.company} [${b.slug}]`
      }));
    } catch (e) { return []; }
  }
  return [];
}

async function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let added = 0;

  for (const b of BOARDS) {
    const rawJobs = await fetchBoard(b);
    for (const j of rawJobs) {
      const pubTime = j.pubStr ? new Date(j.pubStr).getTime() : 0;
      if (pubTime < CUTOFF) continue; // Enforce strict 30-day age limit

      const pubDate = new Date(pubTime).toISOString().slice(0, 10);
      const formatted = {
        id: String(j.id),
        title: j.title,
        company: j.company,
        link: j.link,
        date: pubDate,
        source: j.source,
        location: j.location,
        department: j.department,
        active: true,
        slug: `role${String(j.id).replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
      };

      if (!cacheData.some((existing: any) => existing.id === formatted.id || existing.link === formatted.link)) {
        cacheData.unshift(formatted);
        added++;
        console.log(`✅ [ADDED ${pubDate}] ${j.company} - ${j.title}`);
      }
    }
  }

  console.log(`\nIngested ${added} fresh (<= 30 days old) jobs. Total jobs in cache: ${cacheData.length}`);
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

main();
