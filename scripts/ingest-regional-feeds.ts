import fs from 'fs';
import path from 'path';
import https from 'https';

const TODAY = new Date().toISOString().slice(0, 10);

interface RegionalFeed {
  company: string;
  type: 'bamboo' | 'ashby' | 'lever' | 'greenhouse';
  slug: string;
  url: string;
}

const REGIONAL_FEEDS: RegionalFeed[] = [
  // Africa
  { company: 'Yellow Card', type: 'bamboo', slug: 'yellowcard', url: 'https://yellowcard.bamboohr.com/careers/list' },
  { company: 'Luno', type: 'greenhouse', slug: 'luno', url: 'https://boards-api.greenhouse.io/v1/boards/luno/jobs?content=true' },
  
  // Singapore & Asia Hubs
  { company: 'Bybit', type: 'greenhouse', slug: 'bybit', url: 'https://boards-api.greenhouse.io/v1/boards/bybit/jobs?content=true' },
  { company: 'Coinhako', type: 'ashby', slug: 'coinhako', url: 'https://api.ashbyhq.com/posting-api/job-board/coinhako' },
  { company: 'CoinGecko', type: 'lever', slug: 'coingecko', url: 'https://api.lever.co/v0/postings/coingecko?mode=json' },
  { company: 'Amber Group', type: 'bamboo', slug: 'ambergroup', url: 'https://ambergroup.bamboohr.com/careers/list' },
  
  // Hong Kong
  { company: 'Animoca Brands', type: 'lever', slug: 'animocabrands', url: 'https://api.lever.co/v0/postings/animocabrands?mode=json' },
];

function fetchUrl(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          'Accept': 'application/json',
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
  });
}

function getOneWordRole(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('solidity')) return 'solidity';
  if (t.includes('rust')) return 'rust';
  if (t.includes('frontend') || /\b(ui|ux)\b/i.test(t)) return 'frontend';
  if (t.includes('backend')) return 'backend';
  if (t.includes('product') || /\bpm\b/i.test(t)) return 'product';
  if (t.includes('analyst')) return 'analyst';
  if (t.includes('audit')) return 'auditor';
  if (t.includes('compliance') || t.includes('mlro') || t.includes('kyb') || t.includes('kyc')) return 'compliance';
  if (t.includes('recruiting') || t.includes('recruitment') || t.includes('talent') || /\bhr\b/i.test(t)) return 'recruiter';
  if (t.includes('manager') || t.includes('lead')) return 'manager';
  if (t.includes('operations') || /\bops\b/i.test(t)) return 'operations';
  if (t.includes('support') || t.includes('associate')) return 'associate';
  return 'job';
}

async function ingestRegionalFeeds() {
  console.log('--- Ingesting Regional Web3 ATS Feeds (Africa, Japan, Singapore, HK) ---');

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData: any[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let totalNew = 0;

  for (const feed of REGIONAL_FEEDS) {
    try {
      const data = await fetchUrl(feed.url);
      let jobsToProcess: any[] = [];

      if (feed.type === 'bamboo') {
        const rawList = data.result || [];
        jobsToProcess = rawList.map((j: any) => ({
          id: `bamboo-${feed.slug}-${j.id}`,
          title: j.jobOpeningName,
          company: feed.company,
          link: `https://${feed.slug}.bamboohr.com/careers/${j.id}`,
          location: [j.atsLocation?.city, j.atsLocation?.country].filter(Boolean).join(', ') || 'Remote',
          type: j.employmentStatusLabel || 'Full-time',
          department: j.departmentLabel || feed.company,
          source: `bamboohr:${feed.slug}`,
          rawId: j.id,
          content: j.description || j.jobDescription || '',
        }));
      } else if (feed.type === 'ashby') {
        const rawList = data.jobs || [];
        jobsToProcess = rawList.map((j: any) => ({
          id: `ashby-${feed.slug}-${j.id}`,
          title: j.title,
          company: feed.company,
          link: j.jobUrl || `https://jobs.ashbyhq.com/${feed.slug}/${j.id}`,
          location: j.location || 'Remote',
          type: j.employmentType || 'Full-time',
          department: j.department || feed.company,
          source: `ashby:${feed.slug}`,
          rawId: j.id,
          content: j.descriptionHtml || j.descriptionPlain || '',
        }));
      } else if (feed.type === 'lever') {
        const rawList = Array.isArray(data) ? data : [];
        jobsToProcess = rawList.map((j: any) => ({
          id: `lever-${feed.slug}-${j.id}`,
          title: j.text,
          company: feed.company,
          link: j.hostedUrl,
          location: j.categories?.location || 'Remote',
          type: j.categories?.commitment || 'Full-time',
          department: j.categories?.department || feed.company,
          source: `lever:${feed.slug}`,
          rawId: j.id,
          content: j.description || j.descriptionHtml || '',
        }));
      } else if (feed.type === 'greenhouse') {
        const rawList = data.jobs || [];
        jobsToProcess = rawList.map((j: any) => ({
          id: `greenhouse-${feed.slug}-${j.id}`,
          title: j.title,
          company: feed.company,
          link: j.absolute_url,
          location: j.location?.name || 'Remote',
          type: 'Full-time',
          department: j.departments?.[0]?.name || feed.company,
          source: `greenhouse:${feed.slug}`,
          rawId: j.id,
          content: j.content || '',
        }));
      }

      let countForFeed = 0;
      for (const item of jobsToProcess) {
        const roleWord = getOneWordRole(item.title);
        const shortId = item.rawId.toString().replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase();
        const slug = `${roleWord}${shortId}`;

        const jobObj = {
          id: item.id,
          title: item.title,
          company: item.company,
          location: item.location,
          type: item.type,
          date: TODAY,
          source: item.source,
          link: item.link,
          applyUrl: item.link,
          department: item.department,
          skills: ['Web3', 'Blockchain', 'Crypto', 'Fintech'],
          slug,
        };

        const exists = cacheData.some((e: any) => e.id === jobObj.id || e.link === jobObj.link);
        if (!exists) {
          cacheData.unshift(jobObj);
          countForFeed++;
          totalNew++;
        }

        if (item.content && item.content.length > 50) {
          const descPath = path.join(process.cwd(), 'content/job-descriptions.json');
          if (fs.existsSync(descPath)) {
            const descMap = JSON.parse(fs.readFileSync(descPath, 'utf8'));
            if (!descMap[jobObj.id]) {
              descMap[jobObj.id] = item.content;
              fs.writeFileSync(descPath, JSON.stringify(descMap, null, 2));
            }
          }
        }
      }

      console.log(`✓ [${feed.company}] (${feed.type.toUpperCase()}): Ingested ${countForFeed} new jobs (Total active: ${jobsToProcess.length})`);
    } catch (err: any) {
      console.error(`✗ [${feed.company}] Failed to ingest: ${err.message}`);
    }
  }

  console.log(`\n🎉 Ingested ${totalNew} new regional jobs across Africa, Japan, Singapore, and Hong Kong!`);
  console.log(`Total jobs in cache: ${cacheData.length}`);

  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

ingestRegionalFeeds().catch(console.error);
