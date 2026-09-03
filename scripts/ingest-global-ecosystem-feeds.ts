import fs from 'fs';
import path from 'path';
import https from 'https';

const TODAY = new Date().toISOString().slice(0, 10);

interface FeedConfig {
  company: string;
  type: 'bamboo' | 'ashby' | 'lever' | 'greenhouse';
  slug: string;
  url: string;
}

const GLOBAL_WEB3_FEEDS: FeedConfig[] = [
  // Infrastructure, Layer 1/2 & Ecosystem Leaders
  { company: 'Fireblocks', type: 'greenhouse', slug: 'fireblocks', url: 'https://boards-api.greenhouse.io/v1/boards/fireblocks/jobs?content=true' },
  { company: 'BitGo', type: 'greenhouse', slug: 'bitgo', url: 'https://boards-api.greenhouse.io/v1/boards/bitgo/jobs?content=true' },
  { company: 'Gemini', type: 'greenhouse', slug: 'gemini', url: 'https://boards-api.greenhouse.io/v1/boards/gemini/jobs?content=true' },
  { company: 'Flow Traders', type: 'greenhouse', slug: 'flowtraders', url: 'https://boards-api.greenhouse.io/v1/boards/flowtraders/jobs?content=true' },
  { company: 'CertiK', type: 'lever', slug: 'certik', url: 'https://api.lever.co/v0/postings/certik?mode=json' },
  { company: 'a16z crypto', type: 'greenhouse', slug: 'a16z', url: 'https://boards-api.greenhouse.io/v1/boards/a16z/jobs?content=true' },
  { company: 'Injective', type: 'ashby', slug: 'injective', url: 'https://api.ashbyhq.com/posting-api/job-board/injective' },
  { company: 'Ritual (AI + Web3)', type: 'greenhouse', slug: 'ritual', url: 'https://boards-api.greenhouse.io/v1/boards/ritual/jobs?content=true' },
  { company: 'Arbitrum (Offchain Labs)', type: 'lever', slug: 'offchainlabs', url: 'https://api.lever.co/v0/postings/offchainlabs?mode=json' },
  { company: 'Render Network', type: 'ashby', slug: 'render', url: 'https://api.ashbyhq.com/posting-api/job-board/render' },
  { company: 'Phantom', type: 'ashby', slug: 'phantom', url: 'https://api.ashbyhq.com/posting-api/job-board/phantom' },
  { company: 'Morpho', type: 'ashby', slug: 'morpho', url: 'https://api.ashbyhq.com/posting-api/job-board/morpho' },
  { company: 'Safe (Gnosis)', type: 'ashby', slug: 'safe', url: 'https://api.ashbyhq.com/posting-api/job-board/safe' },
  { company: 'Uniswap Labs', type: 'ashby', slug: 'uniswap', url: 'https://api.ashbyhq.com/posting-api/job-board/uniswap' },
  { company: 'Ethena Labs', type: 'lever', slug: 'ethena', url: 'https://api.lever.co/v0/postings/ethena?mode=json' },
  { company: 'Optimism (OP Labs)', type: 'ashby', slug: 'oplabs', url: 'https://api.ashbyhq.com/posting-api/job-board/oplabs' },
  { company: 'Consensys (MetaMask)', type: 'greenhouse', slug: 'consensys', url: 'https://boards-api.greenhouse.io/v1/boards/consensys/jobs?content=true' },
  { company: 'Compound', type: 'ashby', slug: 'compound', url: 'https://api.ashbyhq.com/posting-api/job-board/compound' },
  { company: 'Jump Crypto', type: 'greenhouse', slug: 'jumpcrypto', url: 'https://boards-api.greenhouse.io/v1/boards/jumpcrypto/jobs?content=true' },
  { company: 'TRM Labs', type: 'bamboo', slug: 'trmlabs', url: 'https://trmlabs.bamboohr.com/careers/list' },
  { company: 'OpenZeppelin', type: 'greenhouse', slug: 'openzeppelin', url: 'https://boards-api.greenhouse.io/v1/boards/openzeppelin/jobs?content=true' },
  { company: 'Grayscale Investments', type: 'greenhouse', slug: 'grayscale', url: 'https://boards-api.greenhouse.io/v1/boards/grayscale/jobs?content=true' },
  { company: 'Mysten Labs (Sui)', type: 'ashby', slug: 'mystenlabs', url: 'https://api.ashbyhq.com/posting-api/job-board/mystenlabs' },
  { company: 'Immunefi', type: 'greenhouse', slug: 'immunefi', url: 'https://boards-api.greenhouse.io/v1/boards/immunefi/jobs?content=true' },
  { company: 'Ramp Network', type: 'greenhouse', slug: 'rampnetwork', url: 'https://job-boards.eu.greenhouse.io/v1/boards/rampnetwork/jobs?content=true' },
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
  if (t.includes('analyst') || t.includes('trader') || t.includes('quant')) return 'quant';
  if (t.includes('audit') || t.includes('security')) return 'security';
  if (t.includes('compliance') || t.includes('legal') || t.includes('risk')) return 'compliance';
  if (t.includes('recruiting') || t.includes('talent') || /\bhr\b/i.test(t)) return 'recruiter';
  if (t.includes('manager') || t.includes('lead')) return 'manager';
  if (t.includes('operations') || /\bops\b/i.test(t)) return 'operations';
  if (t.includes('support') || t.includes('associate')) return 'associate';
  return 'job';
}

async function ingestGlobalEcosystemFeeds() {
  console.log('--- Ingesting Global Top Web3 Ecosystem ATS Feeds ---');

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData: any[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let totalNew = 0;

  for (const feed of GLOBAL_WEB3_FEEDS) {
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
          skills: ['Web3', 'Blockchain', 'Crypto', 'DeFi', 'Infrastructure'],
          slug,
        };

        const exists = cacheData.some((e: any) => e.id === jobObj.id || e.link === jobObj.link);
        if (!exists) {
          cacheData.unshift(jobObj);
          countForFeed++;
          totalNew++;
        }
      }

      console.log(`✓ [${feed.company}] (${feed.type.toUpperCase()}): Ingested ${countForFeed} new jobs (Total active: ${jobsToProcess.length})`);
    } catch (err: any) {
      console.error(`✗ [${feed.company}] Failed to ingest: ${err.message}`);
    }
  }

  console.log(`\n🎉 Ingested ${totalNew} new top Web3 ecosystem jobs!`);
  console.log(`Total jobs in cache: ${cacheData.length}`);

  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

ingestGlobalEcosystemFeeds().catch(console.error);
