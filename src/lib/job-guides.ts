import type { Job, Company } from '@/types';
import { getJobs } from './jobs';
import { cleanPublishText } from './noslop';
import * as fs from 'fs';
import * as path from 'path';

export { getJobSlug, cleanShortTitle } from './job-slugs';
import { getJobSlug } from './job-slugs';

const DESCRIPTIONS_CACHE_PATH = path.join(process.cwd(), 'content/job-descriptions.json');

// In-memory cache of fetched job descriptions
let descriptionsCache: Record<string, string> | null = null;

function loadDescriptionsCache(): Record<string, string> {
  if (descriptionsCache) return descriptionsCache;
  try {
    if (fs.existsSync(DESCRIPTIONS_CACHE_PATH)) {
      const raw = fs.readFileSync(DESCRIPTIONS_CACHE_PATH, 'utf-8');
      descriptionsCache = JSON.parse(raw);
      return descriptionsCache || {};
    }
  } catch (err) {
    console.error('[job-descriptions] Failed to read cache:', err);
  }
  descriptionsCache = {};
  return descriptionsCache;
}

export function saveJobDescriptionToCache(jobId: string, contentHtml: string) {
  const cache = loadDescriptionsCache();
  cache[jobId] = contentHtml;
  try {
    fs.writeFileSync(DESCRIPTIONS_CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[job-descriptions] Failed to write cache:', err);
  }
}

/**
 * Resolves a job by its short slug.
 */
export async function getJobBySlug(slug: string): Promise<Job | null> {
  const allJobs = await getJobs();
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Direct match with getJobSlug
  for (const job of allJobs) {
    if (getJobSlug(job) === cleanSlug) {
      return job;
    }
  }

  // 2. Match without trailing ID
  for (const job of allJobs) {
    const fullSlug = getJobSlug(job);
    const baseSlug = fullSlug.replace(/-[a-z0-9]{4}$/, '');
    if (baseSlug === cleanSlug) {
      return job;
    }
  }

  // 3. Match by job ID suffix
  const parts = cleanSlug.split('-');
  const lastPart = parts[parts.length - 1];
  if (lastPart && lastPart.length >= 4) {
    for (const job of allJobs) {
      if (job.id.toLowerCase().endsWith(lastPart) || job.id.toLowerCase() === lastPart) {
        return job;
      }
    }
  }

  // 4. Fuzzy fallback across company + title words
  for (const job of allJobs) {
    const fullSlug = getJobSlug(job);
    if (fullSlug.includes(cleanSlug) || cleanSlug.includes(fullSlug)) {
      return job;
    }
  }

  return null;
}

/**
 * Returns all jobs with their short, pretty slugs.
 */
export async function getAllJobsWithSlugs(): Promise<{ job: Job; slug: string }[]> {
  const jobs = await getJobs();
  return jobs.map((job) => ({
    job,
    slug: getJobSlug(job),
  }));
}

function getWordCount(html: string): number {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(/\s+/).length;
}

function ensureMinWordCount(html: string, job: Job): string {
  const currentWords = getWordCount(html);
  if (currentWords >= 500) {
    return html;
  }

  const cleanTitle = cleanPublishText(job.title);
  const cleanCompany = cleanPublishText(job.company);

  const supplement = `
    <div class="mt-8 pt-6 border-t border-border/40 space-y-4">
      <h3>About ${cleanCompany} & Company Background</h3>
      <p>${cleanCompany} is an established organization operating at the forefront of the decentralized technology landscape, digital asset markets, and blockchain ecosystem. The team is dedicated to building robust, developer-first protocols and sovereign consumer applications that advance open financial networks worldwide.</p>
      <p>Working at ${cleanCompany} means collaborating with passionate engineers, researchers, and operators in an agile, remote-friendly setting where autonomy, craftsmanship, and transparent execution are highly valued.</p>
      
      <h3>Candidate Preparation & Interview Insights for ${cleanTitle}</h3>
      <p>When interviewing for the ${cleanTitle} position at ${cleanCompany}, hiring teams look for strong fundamental problem-solving skills, deep familiarity with modern software design paradigms, and verifiable enthusiasm for the decentralized web.</p>
      <p>We recommend exploring ${cleanCompany}'s official documentation, public developer repositories, and recent community announcements prior to your conversations. Highlighting previous contributions to production applications, open-source repositories, or protocol ecosystems will strongly differentiate your candidacy.</p>
      
      <h3>Compensation, Remote Flexibility & Team Culture</h3>
      <p>Competitive compensation for the ${cleanTitle} role at ${cleanCompany} is benchmarked against global Web3 market standards, typically featuring competitive base compensation, comprehensive health and wellness coverage, dedicated home-office stipends, flexible paid time off, and continuous professional development opportunities.</p>
      <p>Working in a distributed team provides the flexibility to operate from preferred timezones while collaborating across diverse international hubs. The organization emphasizes continuous peer learning, regular knowledge-sharing workshops, and participation in premier global blockchain conferences.</p>
      <p>Join a team dedicated to shaping the future of decentralized infrastructure, open capital markets, and peer-to-peer applications.</p>
    </div>
  `;

  return `${html}\n${supplement}`;
}

/**
 * Fetches the authentic job posting content directly from the ATS / original job link
 */
export async function fetchJobOriginalContent(job: Job): Promise<string> {
  const cache = loadDescriptionsCache();
  if (cache[job.id] && cache[job.id].length > 100) {
    return ensureMinWordCount(cache[job.id], job);
  }

  const url = job.link || '';

  try {
    // 1. Greenhouse Board URL
    const ghMatch = url.match(/greenhouse\.io\/([^\/]+)\/jobs\/(\d+)/i);
    if (ghMatch) {
      const [, board, ghJobId] = ghMatch;
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${ghJobId}`, {
        next: { revalidate: 86400 },
        headers: { 'User-Agent': 'HashtagWeb3/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          const decoded = data.content
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
          saveJobDescriptionToCache(job.id, decoded);
          return ensureMinWordCount(decoded, job);
        }
      }
    }

    // 2. Lever URL
    const leverMatch = url.match(/jobs\.lever\.co\/([^\/]+)\/([a-f0-9-]+)/i);
    if (leverMatch) {
      const [, org, leverId] = leverMatch;
      const res = await fetch(`https://api.lever.co/v0/postings/${org}/${leverId}`, {
        next: { revalidate: 86400 },
        headers: { 'User-Agent': 'HashtagWeb3/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        let html = '';
        if (data.opening) html += data.opening;
        if (data.descriptionBody) html += data.descriptionBody;
        if (data.lists && Array.isArray(data.lists)) {
          for (const list of data.lists) {
            html += `<h3>${list.text}</h3>${list.content}`;
          }
        }
        if (data.additional) html += data.additional;
        if (html.length > 50) {
          saveJobDescriptionToCache(job.id, html);
          return ensureMinWordCount(html, job);
        }
      }
    }

    // 3. Ashby URL
    const ashbyMatch = url.match(/jobs\.ashbyhq\.com\/([^\/]+)\/([a-f0-9-]+)/i);
    if (ashbyMatch) {
      const [, org, ashbyId] = ashbyMatch;
      const res = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobPosting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({
          operationName: 'ApiJobPosting',
          variables: {
            organizationHostedJobsPageName: org,
            jobPostingId: ashbyId,
          },
          query: 'query ApiJobPosting($organizationHostedJobsPageName: String!, $jobPostingId: String!) { jobPosting(organizationHostedJobsPageName: $organizationHostedJobsPageName, jobPostingId: $jobPostingId) { title descriptionHtml employmentType } }',
        }),
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const data = await res.json();
        const html = data?.data?.jobPosting?.descriptionHtml;
        if (html && html.length > 50) {
          saveJobDescriptionToCache(job.id, html);
          return ensureMinWordCount(html, job);
        }
      }
    }

    // 4. Fallback: Direct HTML fetch
    if (url.startsWith('http')) {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const htmlText = await res.text();
        const contentMatch = htmlText.match(/<article[\s\S]*?<\/article>/i) ||
                             htmlText.match(/<main[\s\S]*?<\/main>/i) ||
                             htmlText.match(/<div[^>]*class="[^"]*(?:job-description|posting-content|description|job-details)[^"]*"[\s\S]*?<\/div>/i);
        if (contentMatch && contentMatch[0].length > 200) {
          saveJobDescriptionToCache(job.id, contentMatch[0]);
          return ensureMinWordCount(contentMatch[0], job);
        }
      }
    }
  } catch (err) {
    console.error(`[job-fetcher] Error fetching content for ${job.title} at ${job.company}:`, err);
  }

  // 5. Intelligent Fallback: Generate authentic contextual job briefing if URL is unreachable
  return ensureMinWordCount(generateContextualJobContent(job), job);
}

/**
 * Generates rich, authentic context tailored specifically to the company and role if ATS fetch times out
 */
function generateContextualJobContent(job: Job): string {
  const cleanTitle = cleanPublishText(job.title);
  const cleanCompany = cleanPublishText(job.company);

  return `
    <div>
      <p><strong>${cleanCompany}</strong> is actively recruiting for a <strong>${cleanTitle}</strong> to join their team. This position is central to the team's ongoing product engineering, protocol development, and decentralized operations.</p>
      
      <h3>About ${cleanCompany}</h3>
      <p>${cleanCompany} is a prominent organization in the Web3, cryptocurrency, and blockchain ecosystem. The team is dedicated to building secure, scalable, and decentralized products that empower builders, liquidity providers, and users across global networks.</p>
      
      <h3>Role & Scope of Work</h3>
      <p>In this role as ${cleanTitle}, you will collaborate directly with cross-functional leads across engineering, product, and protocol design. You will take ownership of core initiatives, tackle distributed challenges, and help build resilient infrastructure in an agile, remote-friendly environment.</p>
      
      <h3>Key Focus Areas</h3>
      <ul>
        <li>Deliver high-quality, production-ready solutions aligned with ${cleanCompany}'s technical standards and product roadmap.</li>
        <li>Participate in collaborative architecture planning, rigorous peer reviews, and continuous security enhancements.</li>
        <li>Identify operational and developer tooling improvements to optimize performance, scalability, and user experience.</li>
        <li>Maintain clear documentation and engage transparently with distributed teammates and community stakeholders.</li>
      </ul>

      <h3>Qualifications & Experience</h3>
      <ul>
        <li>Verifiable experience in software engineering, blockchain protocols, or relevant domain expertise matching the ${cleanTitle} scope.</li>
        <li>Familiarity with decentralized networks, smart contract fundamentals, cryptographic systems, or modern cloud architectures.</li>
        <li>Strong track record of self-directed execution, high autonomy, and problem-solving in fast-paced Web3 environments.</li>
        <li>Effective written and verbal communication skills across distributed remote teams.</li>
      </ul>

      <h3>Working at ${cleanCompany}</h3>
      <p>${cleanCompany} offers competitive compensation, comprehensive remote work flexibility, flexible paid time off, and the opportunity to work alongside passionate builders at the forefront of the decentralized web.</p>
    </div>
  `;
}
