import fs from 'fs';
import path from 'path';
import https from 'https';
import { isGeneralOrPlaceholderJobTitle } from '../src/lib/job-filters';

const TODAY = new Date().toISOString().slice(0, 10);

interface FeedConfig {
  company: string;
  type: 'bamboo' | 'ashby' | 'lever' | 'greenhouse';
  slug: string;
  url: string;
}

const NEW_UNTRACKED_FEEDS: FeedConfig[] = [
  // Web3 Security & Auditing Platforms
  { company: 'Cantina', type: 'ashby', slug: 'cantina', url: 'https://api.ashbyhq.com/posting-api/job-board/cantina' },
  { company: 'Switchboard', type: 'ashby', slug: 'switchboard', url: 'https://api.ashbyhq.com/posting-api/job-board/switchboard' },
  { company: 'Turnkey', type: 'ashby', slug: 'turnkey', url: 'https://api.ashbyhq.com/posting-api/job-board/turnkey' },
  
  // AI + DePIN & Decentralized Compute
  { company: 'Hyperbolic (AI + Web3)', type: 'ashby', slug: 'hyperbolic', url: 'https://api.ashbyhq.com/posting-api/job-board/hyperbolic' },
  { company: 'ZeroGravity (0G AI)', type: 'ashby', slug: '0g', url: 'https://api.ashbyhq.com/posting-api/job-board/0g' },
  { company: 'Grass (Wynd Labs DePIN)', type: 'ashby', slug: 'wynd-labs', url: 'https://api.ashbyhq.com/posting-api/job-board/wynd-labs' },
  { company: 'Sahara AI', type: 'ashby', slug: 'sahara', url: 'https://api.ashbyhq.com/posting-api/job-board/sahara' },

  // Node Infrastructure & Developer Tooling
  { company: 'Chainstack', type: 'bamboo', slug: 'chainstack', url: 'https://chainstack.bamboohr.com/careers/list' },
  { company: 'Helius (Solana Infra)', type: 'ashby', slug: 'helius', url: 'https://api.ashbyhq.com/posting-api/job-board/helius' },
  { company: 'Nomic Foundation', type: 'ashby', slug: 'nomic', url: 'https://api.ashbyhq.com/posting-api/job-board/nomic' },

  // Layer 1 / 2 & Privacy Protocols
  { company: 'Movement Labs', type: 'ashby', slug: 'movement', url: 'https://api.ashbyhq.com/posting-api/job-board/movement' },
  { company: 'Symbiotic Restaking', type: 'ashby', slug: 'symbiotic', url: 'https://api.ashbyhq.com/posting-api/job-board/symbiotic' },
  { company: 'Aztec Labs (Privacy L2)', type: 'ashby', slug: 'aztec-labs', url: 'https://api.ashbyhq.com/posting-api/job-board/aztec-labs' },
  { company: 'Succinct Labs (ZK)', type: 'ashby', slug: 'succinct', url: 'https://api.ashbyhq.com/posting-api/job-board/succinct' },

  // NFT & Creator Marketplaces
  { company: 'Magic Eden', type: 'ashby', slug: 'magiceden', url: 'https://api.ashbyhq.com/posting-api/job-board/magiceden' },
  { company: 'Foundation', type: 'ashby', slug: 'foundation', url: 'https://api.ashbyhq.com/posting-api/job-board/foundation' },
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

async function ingestNewUntrackedFeeds() {
  console.log('--- Ingesting 16 Newly Discovered Web3, AI & Security ATS Feeds ---');

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cacheData: any[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let totalNew = 0;

  for (const feed of NEW_UNTRACKED_FEEDS) {
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
        if (isGeneralOrPlaceholderJobTitle(item.title)) continue;
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
          skills: ['Web3', 'Blockchain', 'Crypto', 'AI', 'Security'],
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

  console.log(`\n🎉 Ingested ${totalNew} brand new jobs across 16 Web3, AI & Security leaders!`);
  console.log(`Total jobs in cache: ${cacheData.length}`);

  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

ingestNewUntrackedFeeds().catch(console.error);
