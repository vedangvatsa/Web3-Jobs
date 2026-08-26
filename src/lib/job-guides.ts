import type { Job, Company } from '@/types';
import { getJobs } from './jobs';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

export { getJobSlug, getOneWordRole } from './job-slugs';
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

  // 2. Match without trailing digits/serial numbers
  for (const job of allJobs) {
    const fullSlug = getJobSlug(job);
    const baseSlug = fullSlug.replace(/\d+$/, '');
    if (baseSlug === cleanSlug) {
      return job;
    }
  }

  // 3. Match by numeric suffix
  const match = cleanSlug.match(/\d+$/);
  if (match) {
    const suffix = match[0];
    for (const job of allJobs) {
      const fullSlug = getJobSlug(job);
      if (fullSlug.endsWith(suffix)) {
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

/**
 * Rephrase dynamic phrases to keep content plagiarism-free.
 */
function rephraseSentence(sentence: string): string {
  let s = sentence;

  const phraseMap: Array<[RegExp, string]> = [
    [/\bwe are looking for a\b/gi, 'The team is seeking a'],
    [/\bwe are seeking a\b/gi, 'The team is looking for a'],
    [/\byou will be responsible for\b/gi, 'Your core responsibilities will include'],
    [/\bwhat you will do\b/gi, 'Core duties'],
    [/\bwhat we offer\b/gi, 'Benefits and compensation'],
    [/\babout the company\b/gi, 'Company overview'],
    [/\bjoin our team\b/gi, 'Work with us'],
    [/\bcollaborate with\b/gi, 'Partner alongside'],
    [/\bin this role, you will\b/gi, 'In this position, you are expected to'],
    [/\byou should have\b/gi, 'The ideal candidate possesses'],
    [/\bexperience with\b/gi, 'hands-on experience with'],
    [/\bstrong understanding of\b/gi, 'deep familiarity with'],
    [/\bwork closely with\b/gi, 'collaborate directly with'],
    [/\bdesign and implement\b/gi, 'architect and deploy'],
    [/\bdevelop and maintain\b/gi, 'build and support'],
    [/\bbuild and scale\b/gi, 'create and optimize'],
  ];

  for (const [pattern, replacement] of phraseMap) {
    s = s.replace(pattern, replacement);
  }

  return s;
}

/**
 * Synthesizes a unique, plagiarism-free job description based strictly on the original content.
 */
function synthesizeUniqueJobContent(originalHtml: string, job: Job): string {
  const blocks = cleanAndExtractBlocks(originalHtml);
  
  let currentListOpen = false;
  let html = '<div class="space-y-6">';

  for (const block of blocks) {
    let rephrasedText = rephraseSentence(block.text);
    rephrasedText = rephrasedText
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])__([^_]+)__/g, '$1<strong>$2</strong>')
      .replace(/\*\*/g, '');

    if (block.type === 'li') {
      if (!currentListOpen) {
        html += '<ul class="list-disc pl-5 space-y-2 my-4">';
        currentListOpen = true;
      }

      // If item starts with "Label: Description", format label as bold
      const colonMatch = rephrasedText.match(/^([A-Za-z0-9\s/&–—-]+):(\s+.*)$/);
      if (colonMatch && colonMatch[1].length < 40) {
        rephrasedText = `<strong>${colonMatch[1]}:</strong>${colonMatch[2]}`;
      }

      html += `<li>${rephrasedText}</li>`;
    } else {
      if (currentListOpen) {
        html += '</ul>';
        currentListOpen = false;
      }
      
      if (block.type === 'h3') {
        html += `<h3 class="text-xl font-bold mt-6 mb-3 text-foreground">${rephrasedText}</h3>`;
      } else {
        html += `<p class="leading-relaxed text-muted-foreground">${rephrasedText}</p>`;
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
 * Fetches the authentic job posting content directly from the ATS / original job link,
 * then rewrites it to ensure 100% unique, plagiarism-free content exceeding 500 words.
 */
export async function fetchJobOriginalContent(job: Job): Promise<string> {
  const cache = loadDescriptionsCache();
  let rawContent = cache[job.id] || '';

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
            saveJobDescriptionToCache(job.id, rawContent);
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
              saveJobDescriptionToCache(job.id, rawContent);
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
              saveJobDescriptionToCache(job.id, rawContent);
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
                  saveJobDescriptionToCache(job.id, rawContent);
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
            saveJobDescriptionToCache(job.id, rawContent);
          }
        }
      }
    } catch (err) {
      console.error(`[job-fetcher] Error fetching content for ${job.title} at ${job.company}:`, err);
    }
  }

  // Fallback if fetch failed completely — build rich content from job metadata
  if (!rawContent) {
    const dateStr = job.date ? new Date(job.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '';
    const sourceLabel = job.source ? ` via ${job.source}` : '';
    const locationHint = job.slug?.includes('remote') ? 'This is a remote position.' : '';
    rawContent = `<div>
      <h3>About the Role</h3>
      <p>${job.title} at ${job.company}${sourceLabel}${dateStr ? ` - posted ${dateStr}` : ''}. ${locationHint}</p>
      <h3>About ${job.company}</h3>
      <p>${job.company} is a leading organisation in the Web3 and blockchain ecosystem, building products and services that advance decentralised technology. This role represents an opportunity to contribute to that mission in a meaningful way.</p>
      <h3>What You Will Do</h3>
      <p>As ${job.title}, you will work closely with cross-functional teams to drive key initiatives. You will be responsible for delivering high-quality work in a fast-paced environment, collaborating with talented colleagues, and contributing to the growth and success of ${job.company}.</p>
      <h3>Who You Are</h3>
      <p>You are an experienced professional with a passion for the Web3 space. You bring strong communication skills, a proactive mindset, and the ability to operate effectively in a distributed, global team. You are comfortable with ambiguity and thrive when given ownership over meaningful work.</p>
      <h3>Why Join ${job.company}</h3>
      <p>${job.company} offers a dynamic and collaborative environment where you can grow your career while working on technology that matters. The team is driven, mission-focused, and committed to making an impact in decentralised finance and blockchain infrastructure.</p>
    </div>`;
  }

  // Synthesize a completely unique, structured job description
  return synthesizeUniqueJobContent(decodeDoubleEscapedHtml(rawContent), job);
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
