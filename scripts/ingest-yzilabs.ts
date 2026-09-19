import fs from 'fs';
import path from 'path';
import { cleanCompanyName } from '../src/lib/job-filters';
import { getOneWordRole, getJobContentKey } from '../src/lib/job-slugs';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');
const TODAY = new Date().toISOString().slice(0, 10);

interface YZiRawJob {
  id: string;
  company: string;
  role: string;
  department?: string;
  level?: string;
  type?: string;
  location?: string | null;
  tags?: string[];
  logo?: string;
  logo_image?: string | null;
  created_at?: string;
}

function readCache(): any[] {
  return fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) : [];
}

function writeCache(data: any[]): void {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2) + '\n');
}

let descriptionAliases: Record<string, string> = {};
function readDescCache(): Record<string, string> {
  const store = readJobDescriptionStore();
  descriptionAliases = store.aliases;
  return store.descriptions;
}

function writeDescCache(data: Record<string, string>, jobs: any[]): void {
  writeJobDescriptionStore({
    descriptions: data,
    aliases: { ...descriptionAliases, ...buildJobDescriptionAliases(jobs, data) },
  });
}

function upsertJob(cacheData: any[], job: any): 'added' | 'updated' {
  const idx = cacheData.findIndex((e: any) => e.id === job.id || e.link === job.link);
  if (idx === -1) {
    cacheData.unshift(job);
    return 'added';
  }
  cacheData[idx] = { ...cacheData[idx], ...job, slug: cacheData[idx].slug || job.slug };
  return 'updated';
}

function formatDescription(rawText: string): string {
  const unescaped = rawText
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[\u2010\u2011\u2012]/g, '-');

  const lines = unescaped.split('\n').map((l) => l.trim());
  const htmlParts: string[] = [];
  let inList = false;

  for (const line of lines) {
    if (!line) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      continue;
    }
    if (/^#{2,4}\s+/.test(line)) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      const hText = line.replace(/^#{2,4}\s+/, '').trim();
      htmlParts.push(`<h3>${hText}</h3>`);
    } else if (/^[-*•·▪–—\u2010-\u2015]\s+/.test(line)) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${line.replace(/^[-*•·▪–—\u2010-\u2015]\s+/, '').trim()}</li>`);
    } else if (line.endsWith(':') && line.length < 80) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<h3>${line}</h3>`);
    } else {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<p>${line}</p>`);
    }
  }
  if (inList) htmlParts.push('</ul>');
  return htmlParts.join('\n');
}

async function fetchWithRetry(url: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) return await res.text();
      if (res.status === 404) return '';
    } catch (e: any) {
      if (attempt === retries) throw e;
    }
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  return '';
}

export async function ingestYZiLabs(
  passedCache?: any[],
  passedDesc?: Record<string, string>
): Promise<{ added: number; updated: number; total: number }> {
  console.log('Fetching talent.yzilabs.com...');
  const mainHtml = await fetchWithRetry('https://talent.yzilabs.com/');
  if (!mainHtml) {
    console.error('Failed to fetch talent.yzilabs.com');
    return { added: 0, updated: 0, total: 0 };
  }

  const match = mainHtml.match(/\[\{\\"id\\":\\"([a-f0-9-]+)\\",\\"company\\":[\s\S]*?\}\]/);
  if (!match) {
    console.error('Could not find jobs array in YZi Labs HTML');
    return { added: 0, updated: 0, total: 0 };
  }

  const rawJobs: YZiRawJob[] = JSON.parse(
    match[0].replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  );

  // Exclude non-web3 or blocked companies
  const web3Jobs = rawJobs.filter((j) => {
    const comp = (j.company || '').toLowerCase();
    if (comp.includes('agridynamics')) return false;
    if (comp.includes('sats terminal') || comp.includes('satsterminal')) return false;
    return true;
  });

  console.log(`Found ${web3Jobs.length} active Web3/Crypto roles across YZi Labs portfolio.`);

  const cacheData = passedCache || readCache();
  const descData = passedDesc || readDescCache();

  let addedCount = 0;
  let updatedCount = 0;

  // Concurrency pool
  const concurrency = 5;
  for (let i = 0; i < web3Jobs.length; i += concurrency) {
    const chunk = web3Jobs.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (raw) => {
        const jobUrl = `https://talent.yzilabs.com/jobs/${raw.id}`;
        const detailHtml = await fetchWithRetry(jobUrl);

        let descHtml = '';
        if (detailHtml) {
          const pMatches = [...detailHtml.matchAll(/<p class="whitespace-pre-wrap[^"]*">([\s\S]*?)<\/p>/gi)];
          if (pMatches.length > 0) {
            const combined = pMatches.map((m) => m[1]).join('\n\n');
            descHtml = formatDescription(combined);
          } else {
            // Fallback: extract between "About the role" and form
            const m = detailHtml.match(/About the role[\s\S]*?(?=Submit application|<form|<footer|$)/i);
            if (m) {
              descHtml = formatDescription(m[0].replace(/<[^>]*>/g, ' ').trim());
            }
          }
        }

        const roleWord = getOneWordRole(raw.role);
        const shortId = raw.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase();
        const slug = `${roleWord}${shortId}`;

        const jobEntry = {
          id: `yzilabs-${raw.id}`,
          title: raw.role.trim(),
          company: cleanCompanyName(raw.company.trim()),
          link: jobUrl,
          date: raw.created_at ? raw.created_at.slice(0, 10) : TODAY,
          source: `YZi Labs: ${raw.company.trim()}`,
          location: raw.location ? raw.location.trim() : 'Remote / Global',
          department: raw.department ? raw.department.trim() : 'Engineering',
          active: true,
          slug: slug,
          tags: Array.isArray(raw.tags) ? raw.tags : [],
          skills: Array.isArray(raw.tags) ? raw.tags : [],
          level: raw.level || undefined,
          type: raw.type || 'Full-time',
        };

        const res = upsertJob(cacheData, jobEntry);
        if (res === 'added') addedCount++;
        else updatedCount++;

        if (descHtml) {
          descData[getJobContentKey(jobEntry)] = descHtml;
        }
      })
    );
  }

  if (!passedCache) {
    writeCache(cacheData);
    writeDescCache(descData, cacheData);
  }

  console.log(`\n========================================`);
  console.log(`YZi Labs Ingestion Complete:`);
  console.log(`- Added: ${addedCount}`);
  console.log(`- Updated: ${updatedCount}`);
  console.log(`- Total Roles in feed: ${web3Jobs.length}`);
  console.log(`- Total Jobs in Cache: ${cacheData.length}`);
  console.log(`========================================\n`);

  return { added: addedCount, updated: updatedCount, total: web3Jobs.length };
}

if (require.main === module) {
  ingestYZiLabs().catch(console.error);
}
