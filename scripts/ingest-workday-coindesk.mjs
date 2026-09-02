import https from 'https';
import fs from 'fs';

const CACHE_FILE = 'content/jobs-cache.json';
const DESC_FILE = 'content/job-descriptions.json';

const jobsCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
let jobDescriptions = {};
if (fs.existsSync(DESC_FILE)) {
  try { jobDescriptions = JSON.parse(fs.readFileSync(DESC_FILE, 'utf-8')); } catch {}
}

const workdayBoards = [
  {
    company: 'CoinDesk',
    domain: 'bullish.wd3.myworkdayjobs.com',
    tenant: 'bullish',
    site: 'CoinDesk',
    baseUrl: 'https://bullish.wd3.myworkdayjobs.com/CoinDesk',
    skills: ['Crypto News', 'Media', 'Consensus', 'Analytics', 'Web3']
  },
  {
    company: 'Bullish',
    domain: 'bullish.wd3.myworkdayjobs.com',
    tenant: 'bullish',
    site: 'Bullish',
    baseUrl: 'https://bullish.wd3.myworkdayjobs.com/Bullish',
    skills: ['Exchange', 'Clearing', 'Derivatives', 'Institutional', 'Web3']
  }
];

function postJson(url, payload) {
  return new Promise(resolve => {
    const u = new URL(url);
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'Mozilla/5.0'
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

function getJson(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  let totalAdded = 0;
  for (const wd of workdayBoards) {
    console.log(`Querying Workday CXS for ${wd.company}...`);
    const listUrl = `https://${wd.domain}/wday/cxs/${wd.tenant}/${wd.site}/jobs`;
    const data = await postJson(listUrl, { appliedFacets: {}, limit: 50, offset: 0, searchText: '' });
    if (!data || !data.jobPostings) continue;

    console.log(`Found ${data.jobPostings.length} postings for ${wd.company}`);
    for (const p of data.jobPostings) {
      const detailUrl = `https://${wd.domain}/wday/cxs/${wd.tenant}/${wd.site}${p.externalPath}`;
      const link = `${wd.baseUrl}${p.externalPath}`;
      const detailData = await getJson(detailUrl);

      const title = (p.title || '').trim();
      const id = p.bulletFields?.[0] || p.externalPath.split('/').pop() || link;
      const location = p.locationsText || 'New York / London';
      const description = detailData?.jobPostingInfo?.jobDescription || '';
      const date = detailData?.jobPostingInfo?.startDate || '2026-09-02';

      const jobObj = {
        id,
        title,
        company: wd.company,
        location,
        type: 'Full-time',
        date,
        source: `workday:${wd.site.toLowerCase()}`,
        link,
        applyUrl: link,
        department: wd.company,
        skills: wd.skills
      };

      const idx = jobsCache.findIndex(j => j.id === id);
      if (idx >= 0) jobsCache[idx] = { ...jobsCache[idx], ...jobObj };
      else jobsCache.unshift(jobObj);

      if (description) jobDescriptions[id] = description;
      totalAdded++;
    }
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(jobsCache, null, 2));
  fs.writeFileSync(DESC_FILE, JSON.stringify(jobDescriptions, null, 2));
  console.log(`Successfully ingested ${totalAdded} jobs from Workday CXS!`);
})();
