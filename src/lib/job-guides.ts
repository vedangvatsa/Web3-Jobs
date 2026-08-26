import type { Job, Company } from '@/types';
import { getJobs } from './jobs';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

export { getJobSlug, getOneWordRole } from './job-slugs';
import { getJobContentKey, getJobSlug } from './job-slugs';

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

function getCachedRawContent(job: Job): string {
  const cache = loadDescriptionsCache();
  return cache[getJobContentKey(job)] || cache[job.id] || '';
}

function plainTextFromHtml(value: string): string {
  if (!value) return '';
  return cheerio.load(decodeDoubleEscapedHtml(value)).text().replace(/\s+/g, ' ').trim();
}

const FABRICATED_CONTENT_MARKERS = [
  'leading organisation in the Web3 and blockchain ecosystem',
  'passion for the Web3 space',
  'dynamic and collaborative environment where you can grow your career',
  'fast-paced environment, collaborating with talented colleagues',
];

export function hasSubstantialJobContent(job: Job): boolean {
  const text = plainTextFromHtml(getCachedRawContent(job));
  if (text.length < 300) return false;
  return !FABRICATED_CONTENT_MARKERS.some((marker) => text.includes(marker));
}

export function getCachedJobSummary(job: Job, maxLength = 155): string | null {
  if (!hasSubstantialJobContent(job)) return null;
  const text = plainTextFromHtml(getCachedRawContent(job));
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 80 ? lastSpace : clipped.length).trim()}...`;
}

/**
 * Resolves a job by its short slug.
 */
export async function getJobBySlug(slug: string): Promise<Job | null> {
  const allJobs = await getJobs();
  const cleanSlug = slug.toLowerCase().trim();

  return allJobs.find((job) => getJobSlug(job) === cleanSlug) || null;
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

/**
 * Clean up HTML tags and extract structured block elements using Cheerio.
 */
function cleanAndExtractBlocks(html: string): Array<{ type: 'h3' | 'p' | 'li'; text: string }> {
  const decoded = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  const $ = cheerio.load(decoded);

  // Remove non-content tags
  $('script, style, iframe, noscript, svg, button, form, input').remove();

  // Convert <br> tags to newlines
  $('br').replaceWith('\n');

  // Convert standalone <strong> or <b> section headers into explicit heading markers
  $('strong, b').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 2 && text.length < 80 && !text.includes('.') && !text.includes(';') && !text.includes(',')) {
      if (/^(about|overview|why|what|responsibilities|requirements|qualifications|benefits|perks|compensation|values|culture|profile|who|skills|bonus|location|role|the role|your impact|how to apply)/i.test(text)) {
        $(el).replaceWith(`\n###HEADING###${text}\n`);
      }
    }
  });

  // Normalize all explicit heading tags to heading markers
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      $(el).replaceWith(`\n###HEADING###${text}\n`);
    }
  });

  // Normalize list items
  $('li').each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      $(el).replaceWith(`\n- ${text}\n`);
    }
  });

  // Append newlines after block containers
  $('p, div, section, article').each((_, el) => {
    $(el).append('\n');
  });

  const fullText = $('body').text();
  const blocks: Array<{ type: 'h3' | 'p' | 'li'; text: string }> = [];

  const lines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.includes('###HEADING###')) {
      // Marker may sit mid-line when a heading <strong> was inline inside a
      // paragraph; split so the lead-in stays a paragraph and the marker
      // portion becomes the heading.
      const [before, ...rest] = line.split('###HEADING###');
      const beforeText = before.replace(/[:]+$/, '').trim();
      if (beforeText) {
        blocks.push({ type: 'p', text: beforeText });
      }
      const hText = rest.join('').replace(/[:]+$/, '').trim();
      if (hText && hText.length < 100) {
        blocks.push({ type: 'h3', text: hText });
      } else if (hText) {
        blocks.push({ type: 'p', text: hText });
      }
      continue;
    }

    // Skip decorative divider lines (____, ----, ====, ****)
    if (/^[-_=*~\u2022\u00b7\u2013\u2014\s]{3,}$/.test(line)) continue;

    // Bullet item
    const bulletMatch = line.match(/^[-*\u2022\u00b7\u25aa\u2013\u2014]\s*(.*)$/);
    if (bulletMatch) {
      if (bulletMatch[1].trim()) {
        blocks.push({ type: 'li', text: bulletMatch[1].trim() });
      }
      continue;
    }

    // Numbered list item: "1. Develop..."
    const numMatch = line.match(/^\d+[\.\)]\s*(.*)$/);
    if (numMatch && numMatch[1].trim()) {
      blocks.push({ type: 'li', text: numMatch[1].trim() });
      continue;
    }

    // Standalone heading line detection
    if (
      line.length < 60 &&
      /^(about us|about the company|about the team|overview|why join us|what you.?ll do|what you will do|responsibilities|key responsibilities|core responsibilities|requirements|key requirements|qualifications|preferred qualifications|minimum qualifications|what we offer|benefits|perks|compensation and benefits|our values|culture|company culture|profile|who you are|the role|role overview|what we look for)[:]?$/i.test(
        line
      )
    ) {
      blocks.push({ type: 'h3', text: line.replace(/[:]+$/, '').trim() });
      continue;
    }

    blocks.push({ type: 'p', text: line });
  }

  // Fallback if parsing produced nothing
  if (blocks.length === 0) {
    const textOnly = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (textOnly) {
      blocks.push({ type: 'p', text: textOnly });
    }
  }

  return blocks;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats employer-provided content without changing its meaning or pretending
 * that mechanical phrase swaps create original editorial copy.
 */
function formatJobContent(originalHtml: string): string {
  const blocks = cleanAndExtractBlocks(originalHtml);
  
  let currentListOpen = false;
  let html = '<div class="space-y-6">';

  for (const block of blocks) {
    let text = escapeHtml(block.text);
    text = text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])__([^_]+)__/g, '$1<strong>$2</strong>')
      .replace(/\*\*/g, '');

    if (block.type === 'li') {
      if (!currentListOpen) {
        html += '<ul class="list-disc pl-5 space-y-2 my-4">';
        currentListOpen = true;
      }

      // If item starts with "Label: Description", format label as bold
      const colonMatch = text.match(/^([A-Za-z0-9\s/&-]+):(\s+.*)$/);
      if (colonMatch && colonMatch[1].length < 40) {
        text = `<strong>${colonMatch[1]}:</strong>${colonMatch[2]}`;
      }

      html += `<li>${text}</li>`;
    } else {
      if (currentListOpen) {
        html += '</ul>';
        currentListOpen = false;
      }
      
      if (block.type === 'h3') {
        html += `<h3>${text}</h3>`;
      } else {
        html += `<p>${text}</p>`;
      }
    }
  }

  if (currentListOpen) {
    html += '</ul>';
  }

  html += '</div>';
  return html.replace(/#{2,}HEADING###/g, '');
}

/**
 * Reads cached employer content and, for a newly discovered posting, attempts a
 * read-only fetch from the original ATS. Cache refresh scripts persist content;
 * request-time rendering never rewrites the deployment filesystem.
 */
export async function fetchJobOriginalContent(job: Job): Promise<string> {
  let rawContent = getCachedRawContent(job);

  if (rawContent.length < 100) {
    const url = job.link || '';
    try {
      // 1. Greenhouse Board URL or Query Param
      let ghBoard = '';
      let ghJobId = '';

      const ghMatch = url.match(/greenhouse\.io\/([^\/]+)\/jobs\/(\d+)/i);
      if (ghMatch) {
        ghBoard = ghMatch[1];
        ghJobId = ghMatch[2];
      } else {
        const ghJidMatch = url.match(/gh_jid=(\d+)/i) || url.match(/\/positions\/(\d+)/i) || url.match(/\/job\/(\d+)/i);
        if (ghJidMatch) {
          ghJobId = ghJidMatch[1];
          ghBoard = (job.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        }
      }

      if (ghBoard && ghJobId) {
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${ghBoard}/jobs/${ghJobId}`, {
          next: { revalidate: 86400 },
          headers: { 'User-Agent': 'HashtagWeb3/1.0' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            rawContent = data.content;
          }
        }
      }

      // 2. Lever URL
      if (!rawContent) {
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
              rawContent = html;
            }
          }
        }
      }

      // 3. Ashby URL
      if (!rawContent) {
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
              rawContent = html;
            }
          }
        }
      }

      // 3b. Custom-domain Ashby (e.g. morpho.org/jobs/ashby-<role>-<UUID>)
      // Some companies embed Ashby postings on their own domain with a UUID in the path
      if (!rawContent) {
        const uuidMatch = url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
        if (uuidMatch && !url.includes('jobs.ashbyhq.com') && !url.includes('jobs.lever.co') && !url.includes('greenhouse.io')) {
          const ashbyId = uuidMatch[1];
          // Infer org from hostname: morpho.org -> morpho, walletconnect.org -> walletconnect
          let orgSlug = '';
          try {
            const parsedUrl = new URL(url);
            orgSlug = parsedUrl.hostname.replace(/^www\./, '').split('.')[0];
          } catch {}
          if (orgSlug) {
            try {
              const res = await fetch('https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobPosting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
                body: JSON.stringify({
                  operationName: 'ApiJobPosting',
                  variables: { organizationHostedJobsPageName: orgSlug, jobPostingId: ashbyId },
                  query: 'query ApiJobPosting($organizationHostedJobsPageName: String!, $jobPostingId: String!) { jobPosting(organizationHostedJobsPageName: $organizationHostedJobsPageName, jobPostingId: $jobPostingId) { title descriptionHtml employmentType } }',
                }),
                next: { revalidate: 86400 },
              });
              if (res.ok) {
                const data = await res.json();
                const html = data?.data?.jobPosting?.descriptionHtml;
                if (html && html.length > 50) {
                  rawContent = html;
                }
              }
            } catch {}
          }
        }
      }

      // 4. Fallback: Direct HTML fetch
      if (!rawContent && url.startsWith('http')) {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          next: { revalidate: 86400 },
        });
        if (res.ok) {
          const htmlText = await res.text();
          // Guard: never cache full page dumps; only bounded article extracts
          const contentMatch = htmlText.length > 200000 ? null :
            htmlText.match(/<article[\s\S]*?<\/article>/i) ||
                               htmlText.match(/<main[\s\S]*?<\/main>/i) ||
                               htmlText.match(/<div[^>]*class="[^"]*(?:job-description|posting-content|description|job-details)[^"]*"[\s\S]*?<\/div>/i);
          if (contentMatch && contentMatch[0].length > 200) {
            rawContent = contentMatch[0];
          }
        }
      }
    } catch (err) {
      console.error(`[job-fetcher] Error fetching content for ${job.title} at ${job.company}:`, err);
    }
  }

  // Be explicit when the employer content cannot be verified. Do not invent
  // responsibilities, qualifications, culture, benefits, or remote status.
  if (!rawContent) {
    const title = escapeHtml(job.title);
    const company = escapeHtml(job.company);
    return `<div><h2>Role details unavailable</h2><p>${company} lists this opening as ${title}, but the full employer description could not be verified. Use the application link to review the current requirements and location on the employer's website.</p></div>`;
  }

  return formatJobContent(decodeDoubleEscapedHtml(rawContent));
}

/**
 * Some ATS responses / cache writes store markup entity-escaped; without this
 * the page renders raw HTML source as visible text (class names, tags).
 */
function decodeDoubleEscapedHtml(html: string): string {
  if (!html.includes('&lt;')) return html;
  if (!/&lt;\/?(?:div|p|h[1-6]|ul|ol|li|a|strong|em|b|i|br|span|table|section|article)[\s>/]/i.test(html)) return html;
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&');
}
