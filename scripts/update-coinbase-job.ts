import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

async function updateCoinbaseDevops30() {
  console.log('Fetching live Greenhouse content for Coinbase job 8170956...');
  const res = await fetch('https://api.greenhouse.io/v1/boards/coinbase/jobs/8170956?content=true');
  if (!res.ok) {
    throw new Error(`Failed to fetch job: ${res.statusText}`);
  }
  const data: any = await res.json();
  const rawHtml = data.content || '';

  // Unescape HTML entities if needed
  const unescapedHtml = rawHtml
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  console.log('Fetched description length:', unescapedHtml.length);

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const jobs = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const idx = jobs.findIndex((j: any) => j.slug === 'devops30' || j.id === '8170956');
  if (idx >= 0) {
    jobs[idx].description = unescapedHtml;
    console.log(`Updated job ${jobs[idx].title} (${jobs[idx].slug}) with full HTML description (${unescapedHtml.length} chars).`);
  } else {
    console.log('Job not found in cache');
  }

  fs.writeFileSync(cachePath, JSON.stringify(jobs, null, 2), 'utf8');
}

updateCoinbaseDevops30().catch(console.error);
