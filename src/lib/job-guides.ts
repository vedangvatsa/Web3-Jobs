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

const ROLE_FAMILY_RULES: Array<[string, RegExp]> = [
  ['engineering', /engineer|developer|software|frontend|backend|full.?stack|protocol|smart contract|devops|infrastructure/i],
  ['security', /security|risk|fraud|trust|compliance/i],
  ['data', /data|analytics|quant|research|machine learning|ml engineer/i],
  ['product', /product|program manager|project manager|roadmap/i],
  ['design', /design|creative|ux|user experience/i],
  ['marketing', /marketing|content|brand|growth|seo|communications/i],
  ['sales', /sales|account executive|business development|partnerships/i],
  ['operations', /operations|support|customer success|people|human resources|recruit/i],
  ['legal and finance', /legal|counsel|finance|accounting|treasury|tax/i],
  ['community', /community|developer relations|developer advocate|ecosystem/i],
];

const COMMON_ROLE_WORDS = new Set([
  'about', 'company', 'team', 'role', 'work', 'working', 'will', 'you', 'your', 'our', 'with',
  'from', 'that', 'this', 'for', 'and', 'the', 'are', 'have', 'has', 'not', 'who', 'what',
  'their', 'they', 'than', 'into', 'across', 'more', 'their', 'years', 'experience', 'required',
  'preferred', 'including', 'responsibilities', 'qualifications', 'requirements', 'benefits',
]);

function inferRoleFamily(job: Job): string {
  const roleText = `${job.title} ${getDepartmentLabel(job) || ''}`;
  return ROLE_FAMILY_RULES.find(([, pattern]) => pattern.test(roleText))?.[0] || 'specialist';
}

function getDepartmentLabel(job: Job): string | null {
  if (typeof job.department === 'string' && job.department.trim()) return job.department.trim();
  if (Array.isArray(job.department)) {
    const values = job.department.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    if (values.length > 0) return values.join(', ');
  }
  return null;
}

function extractRoleSignals(job: Job, sourceText: string): string[] {
  const signals = new Set<string>();
  const department = getDepartmentLabel(job);
  if (department) signals.add(department);

  // Keep only recognizable, source-derived nouns/technologies. We never copy
  // a source sentence; these short labels are used to make the role brief
  // specific without republishing employer-authored prose.
  const knownTerms = sourceText.match(/\b(?:API|APIs|AI|ML|SQL|SDK|DeFi|NFT|DAO|EVM|Web3|Ethereum|Solana|Rust|Go|Python|TypeScript|JavaScript|React|Kotlin|Swift|Golang|Docker|Kubernetes|GraphQL|Postgres|PostgreSQL|AWS|GCP|Azure|Figma|Salesforce|Jira)\b/g) || [];
  for (const term of knownTerms) {
    const normalized = term.replace(/\s+/g, ' ').trim();
    if (normalized.length < 3 || COMMON_ROLE_WORDS.has(normalized.toLowerCase())) continue;
    signals.add(normalized);
    if (signals.size >= 5) break;
  }

  if (signals.size === 0) signals.add(inferRoleFamily(job));
  return [...signals].slice(0, 5);
}

function getJobSourceHost(link?: string): string {
  if (!link) return 'the employer site';
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return 'the employer site';
  }
}

/**
 * Builds the copy rendered on the canonical job page. Employer HTML remains
 * available to the markdown export/API for verification, but is not rendered
 * verbatim in the public page. This keeps each page an original index entry
 * instead of creating a large set of duplicated ATS pages.
 */
export function buildUniqueJobPageContent(job: Job, employerHtml = ''): string {
  const sourceText = plainTextFromHtml(employerHtml || getCachedRawContent(job));
  const family = inferRoleFamily(job);
  const signals = extractRoleSignals(job, sourceText);
  const location = job.location?.trim() || 'a location specified by the employer';
  const department = getDepartmentLabel(job);
  const postedDate = new Date(job.date);
  const posted = !Number.isNaN(postedDate.getTime())
    ? postedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'the latest source update';
  const sourceHost = getJobSourceHost(job.link);
  const reference = getJobSlug(job);

  const focus = signals.length > 1
    ? `${signals.slice(0, -1).join(', ')}, and ${signals.at(-1)}`
    : signals[0];
  const article = /^[aeiou]/i.test(family) ? 'an' : 'a';
  const teamLine = department
    ? `The listing places it in ${department} and describes ${article} ${family} focus.`
    : `The listing places it in the ${family} area.`;

  return `<div class="space-y-6">\n`
    + `<h2>Independent role brief</h2>\n`
    + `<p>${escapeHtml(job.company)} is hiring a ${escapeHtml(job.title)} in ${escapeHtml(location)}. ${escapeHtml(teamLine)}</p>\n`
    + `<p>This page summarizes the listing using its role metadata and a small set of source signals: ${escapeHtml(focus)}. It is an original index entry; review the employer page for the authoritative responsibilities, requirements, compensation, and application status.</p>\n`
    + `<h3>Listing details</h3>\n`
    + `<ul class="list-disc pl-5 space-y-2">\n`
    + `<li><strong>Source:</strong> ${escapeHtml(sourceHost)}</li>\n`
    + `<li><strong>Last posted or verified:</strong> ${escapeHtml(posted)}</li>\n`
    + `<li><strong>Listing reference:</strong> ${escapeHtml(reference)}</li>\n`
    + `</ul>\n`
    + `</div>`;
}

export function buildUniqueJobMetaDescription(job: Job): string {
  const family = inferRoleFamily(job);
  const location = job.location?.trim() || 'the employer-specified location';
  const department = getDepartmentLabel(job);
  const team = department ? ` in ${department}` : '';
  return `${job.company} is hiring a ${job.title}${team}. This independent role brief covers the ${family} opening in ${location} and links to the authoritative employer listing.`;
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

  // Preserve outbound links as tokens so formatJobContent can restore real
  // anchors after escaping; without this, employer copy renders phrases like
  // "visit our website at ..." with no hyperlink at all.
  $('a').each((_, el) => {
    const $el = $(el);
    const href = ($el.attr('href') || '').trim();
    const label = $el.text().trim();
    if (!href || !/^https?:\/\//i.test(href)) {
      $el.replaceWith(label);
      return;
    }
    $el.replaceWith(`\u21E7JOBLINK:${href}\u2044${label || href}\u21E9`);
  });

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
      // Some ATS exports flatten several bullets into one list item with a
      // middle-dot separator. Split those back into real list items so the
      // rendered HTML never contains clumped bullet copy.
      const items = text
        .split(/\s+[•·]\s+/)
        .map((item) => item.trim())
        .filter(Boolean);
      $(el).replaceWith(items.map((item) => `\n- ${item}\n`).join(''));
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
      const bulletItems = bulletMatch[1]
        .split(/\s+[•·]\s+/)
        .map((item) => item.trim())
        .filter(Boolean);
      for (const item of bulletItems) {
        blocks.push({ type: 'li', text: item });
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
      .replace(/\*\*/g, '')
      .replace(/\u21E7JOBLINK:([^⇧\u2044]+)\u2044([^⇧]*)\u21E9/g, (_, url, label) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:underline">${label}</a>`;
      });

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
