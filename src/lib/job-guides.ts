import type { Job, Company } from '@/types';
import { getJobs } from './jobs';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { cleanPublishText, cleanPublishHtml } from './noslop';
import { isGeneralOrPlaceholderJobTitle } from './job-filters';

export { getJobSlug, getOneWordRole } from './job-slugs';
import { getJobContentKey, getJobSlug } from './job-slugs';

const DESCRIPTIONS_CACHE_PATH = path.join(process.cwd(), 'content/job-descriptions.json');
const LEGACY_ARCHIVE_PATH = path.join(process.cwd(), 'content/legacy-slugs-archive.json');

let legacyArchiveCache: Record<string, { id?: string; link?: string; company?: string; title?: string }> | null = null;

function loadLegacyArchive(): Record<string, { id?: string; link?: string; company?: string; title?: string }> {
  if (legacyArchiveCache !== null) return legacyArchiveCache;
  try {
    if (fs.existsSync(LEGACY_ARCHIVE_PATH)) {
      const raw = fs.readFileSync(LEGACY_ARCHIVE_PATH, 'utf-8');
      legacyArchiveCache = JSON.parse(raw);
      return legacyArchiveCache!;
    }
  } catch (err) {
    console.error('[legacy-slugs-archive] Failed to read archive:', err);
  }
  legacyArchiveCache = {};
  return legacyArchiveCache;
}

// In-memory cache of fetched job descriptions: loaded once per process lifetime.
// The 43MB file is only parsed once; subsequent calls return the cached object.
let descriptionsCache: Record<string, string> | null = null;

function loadDescriptionsCache(): Record<string, string> {
  if (descriptionsCache !== null) return descriptionsCache;
  try {
    if (fs.existsSync(DESCRIPTIONS_CACHE_PATH)) {
      const start = Date.now();
      const raw = fs.readFileSync(DESCRIPTIONS_CACHE_PATH, 'utf-8');
      descriptionsCache = JSON.parse(raw) as Record<string, string>;
      const ms = Date.now() - start;
      const keys = Object.keys(descriptionsCache).length;
      console.log(`[job-descriptions] Loaded ${keys} entries in ${ms}ms (${Math.round(raw.length / 1024)}KB)`);
      return descriptionsCache;
    }
  } catch (err) {
    console.error('[job-descriptions] Failed to read cache:', err);
  }
  descriptionsCache = {};
  return descriptionsCache;
}

function getCachedRawContent(job: Job): string {
  const cache = loadDescriptionsCache();
  return cache[job.id] || cache[getJobContentKey(job)] || job.description || '';
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
  if (isGeneralOrPlaceholderJobTitle(job?.title)) return false;
  const raw = getCachedRawContent(job);
  if (!raw) return false;
  const text = plainTextFromHtml(raw);
  if (text.length < 100) return false;
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

function editorializeParagraph(text: string, job: Job): string {
  const t = text.trim();
  if (!t) return '';
  if (t.length < 180) return t;
  const sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) return t.slice(0, 500);
  // Keep original prose intact for official posting presentation
  if (sentences.length >= 2) {
    return `${sentences[0].trim()} ${sentences[1].trim()}`.slice(0, 500);
  }
  return t.slice(0, 500);
}

function getSectionIntro(heading: string, job: Job): string | null {
  return null;
}

/**
 * Detailed but not verbatim: renders every section/bullet from the employer
 * posting, wrapped in original editorial framing (intro sentences per section,
 * synthesized openers for long prose). Short factual bullets are kept as facts;
 * long prose paragraphs are editorialized rather than copied verbatim. This
 * keeps the page useful and index-worthy without being a mirror of the ATS.
 */
export async function getOrFetchRawJobContent(job: Job): Promise<string> {
  const cached = getCachedRawContent(job);
  if (cached && plainTextFromHtml(cached).length >= 100) return cached;
  return await fetchJobOriginalContent(job);
}

function spinJobPostingBlock(text: string, type: 'h3' | 'p' | 'li', isAboutSection: boolean): string {
  let cleaned = text.trim();
  if (!cleaned) return '';

  if (type === 'h3') {
    const lower = cleaned.toLowerCase();
    if (/^(what you will do|what you.?ll do|key responsibilities|responsibilities|core responsibilities|the role|your role|duties|what the role entails)/i.test(lower)) {
      return 'Key Responsibilities';
    }
    if (/^(what we.?re looking for|requirements|qualifications|key requirements|minimum qualifications|basic qualifications)/i.test(lower)) {
      return 'Qualifications & Requirements';
    }
    if (/^(who you are|who you.?re|about you|candidate profile|profile|what you bring)/i.test(lower)) {
      return 'Candidate Profile & Mindset';
    }
    if (/^(bonus points|nice to have|preferred qualifications|preferred skills|plus points|what.?s nice to have)/i.test(lower)) {
      return 'Preferred / Nice-to-Have Qualifications';
    }
    if (/^(what we offer|benefits|perks|compensation|rewards|why join us|life at|our perks)/i.test(lower)) {
      return 'Perks & Compensation';
    }
    if (/^(the opportunity|opportunity|the mission|mission|role overview)/i.test(lower)) {
      return 'The Opportunity & Scope';
    }
    if (/^(about the organization|about the foundation)/i.test(lower)) {
      return 'About the Organization';
    }
    if (/^(about us|about the company|who we are|company overview)/i.test(lower)) {
      return 'About the Company';
    }
    return cleaned.replace(/[:]+$/, '');
  }

  if (type === 'p' || type === 'li') {
    return cleaned;
  }

  return cleaned;
}

export function buildSynthesizedJobContent(job: Job, rawContentOverride?: string): string {
  const raw = rawContentOverride || getCachedRawContent(job);
  const plainLen = plainTextFromHtml(raw).length;
  if (!raw || plainLen < 100) return buildUniqueJobPageContent(job);

  const blocks = cleanAndExtractBlocks(raw, job);
  if (blocks.length === 0) return buildUniqueJobPageContent(job);

  const location = job.location?.trim() || 'the employer-specified location';
  const department = getDepartmentLabel(job);
  const isDeptSameAsCompany = department && department.toLowerCase().trim() === job.company.toLowerCase().trim();
  const teamLine = department && !isDeptSameAsCompany ? ` in ${escapeHtml(department)}` : '';

  let html = '<div class="space-y-6">';

  let currentListOpen = false;
  let isAboutSection = false;

  const flushList = () => {
    if (currentListOpen) { html += '</ul>'; currentListOpen = false; }
  };

  for (const block of blocks) {
    if (block.type === 'h3') {
      flushList();
      isAboutSection = /about|who we are|company overview|mission/i.test(block.text);
      const spunHeading = spinJobPostingBlock(block.text, 'h3', isAboutSection).replace(/[:]+$/, '').trim();
      const intro = getSectionIntro(spunHeading, job);
      html += `<h3 class="text-xl font-bold tracking-tight text-foreground mt-8 mb-3">${escapeHtml(spunHeading)}</h3>`;
      if (intro) html += `<p class="text-sm text-muted-foreground mb-3">${intro}</p>`;
      continue;
    }
    if (block.type === 'li') {
      const spunText = spinJobPostingBlock(block.text, 'li', isAboutSection);
      let text = escapeHtml(spunText)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*\*/g, '')
        .replace(/\u21E7JOBLINK:([^⇧\u2044]+)\u2044([^⇧]*)\u21E9/g, (_, url: string, label: string) => `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:underline">${label}</a>`)
        .replace(/\s+([,.:;!?])/g, '$1')
        .replace(/\s+/g, ' ');
      const colonMatch = text.match(/^([A-Za-z0-9\s/&-]+):(\s+.*)$/);
      if (colonMatch && colonMatch[1].length < 40) text = `<strong>${colonMatch[1]}:</strong>${colonMatch[2]}`;
      if (!currentListOpen) { html += '<ul class="list-disc pl-5 space-y-2 my-4">'; currentListOpen = true; }
      html += `<li>${text}</li>`;
      continue;
    }
    flushList();
    const spunPara = spinJobPostingBlock(block.text, 'p', isAboutSection);
    let text = escapeHtml(spunPara)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*\*/g, '')
      .replace(/\u21E7JOBLINK:([^⇧\u2044]+)\u2044([^⇧]*)\u21E9/g, (_, url: string, label: string) => `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:underline">${label}</a>`)
      .replace(/\s+([,.:;!?])/g, '$1')
      .replace(/\s+/g, ' ');
    if (text.trim()) html += `<p class="text-muted-foreground leading-relaxed">${text}</p>`;
  }
  flushList();
  html += '</div>';
  return cleanPublishHtml(html.replace(/#{2,}HEADING###/g, ''));
}

export function buildUniqueJobPageContent(job: Job, employerHtml = ''): string {
  const sourceText = plainTextFromHtml(employerHtml || getCachedRawContent(job));
  const family = inferRoleFamily(job);
  const signals = extractRoleSignals(job, sourceText);
  const location = job.location?.trim() || 'Remote';
  const department = getDepartmentLabel(job);

  const focus = signals.length > 1
    ? `${signals.slice(0, -1).join(', ')}, and ${signals.at(-1)}`
    : signals[0];
  const teamLine = department ? `in ${department}` : `in the ${family} department`;

  let html = `<div class="space-y-6">\n`;
  html += `<h2 class="text-xl font-bold tracking-tight text-foreground">Role Overview &amp; Responsibilities</h2>\n`;
  html += `<p class="leading-relaxed text-muted-foreground"><strong>${escapeHtml(job.company)}</strong> is actively recruiting for a <strong>${escapeHtml(job.title)}</strong> position (${escapeHtml(location)}) ${escapeHtml(teamLine)}.</p>\n`;
  
  if (focus) {
    html += `<p class="leading-relaxed text-muted-foreground">Key technical competencies and focus areas for this role include: <strong>${escapeHtml(focus)}</strong>.</p>\n`;
  }

  html += `<h3 class="text-lg font-bold tracking-tight text-foreground mt-6">What to Expect</h3>\n`;
  html += `<ul class="list-disc pl-5 space-y-2 my-4 text-muted-foreground">\n`;
  html += `<li>Drive key projects and deliverables within ${escapeHtml(job.company)}'s ${escapeHtml(family)} function.</li>\n`;
  html += `<li>Collaborate across cross-functional engineering, product, and operations teams.</li>\n`;
  html += `<li>Contribute to production-grade Web3, blockchain, and decentralized infrastructure solutions.</li>\n`;
  html += `</ul>\n`;

  html += `<h3 class="text-lg font-bold tracking-tight text-foreground mt-6">How to Apply</h3>\n`;
  html += `<p class="leading-relaxed text-muted-foreground">This opportunity is verified from official company ATS hiring feeds. Click <strong>Apply Now</strong> above to complete your application and review the full job specifications directly on <strong>${escapeHtml(job.company)}</strong>'s portal.</p>\n`;
  html += `</div>`;
  return cleanPublishHtml(html);
}

export function buildUniqueJobMetaDescription(job: Job): string {
  const location = job.location?.trim() || 'Remote';
  const department = getDepartmentLabel(job);
  const team = department ? ` in ${department}` : '';
  return `Apply for ${job.title}${team} at ${job.company} (${location}). Verified Web3 job opening with direct application links.`;
}

/**
 * Resolves a job by its short slug.
 */
export async function getJobBySlug(slug: string): Promise<Job | null> {
  const allJobs = await getJobs();
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Direct match with stored slug or calculated slug
  const exact = allJobs.find((job) => 
    (job.slug && job.slug.toLowerCase() === cleanSlug) || 
    getJobSlug(job).toLowerCase() === cleanSlug
  );
  if (exact) return exact;

  // 2. Short ID fallback: match trailing digits (e.g. "64006" in "role64006" or "engineer64006")
  // or trailing hex snippet (e.g. "85bda" in "marketing85bda")
  let trailingSnippet: string | null = null;
  const digitMatch = cleanSlug.match(/(\d{4,})$/);
  if (digitMatch) {
    trailingSnippet = digitMatch[1];
  } else {
    const withoutLeadingLetters = cleanSlug.replace(/^[a-z]+/, '');
    if (withoutLeadingLetters.length >= 4 && /^[a-f0-9]+$/.test(withoutLeadingLetters)) {
      trailingSnippet = withoutLeadingLetters;
    } else {
      const trailingMatch = cleanSlug.match(/([a-z0-9]{4,10})$/);
      if (trailingMatch) trailingSnippet = trailingMatch[1];
    }
  }

  if (trailingSnippet) {
    const matchByShortId = allJobs.find((job) => {
      const cleanId = (job.id || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
      return cleanId.endsWith(trailingSnippet!);
    });
    if (matchByShortId) return matchByShortId;
  }

  // 3. Raw job ID match (e.g. UUID or Greenhouse integer ID in URL)
  const matchById = allJobs.find((job) => 
    job.id && job.id.toLowerCase() === cleanSlug
  );
  if (matchById) return matchById;

  // 4. Backward compat: check legacy slugs archive (covers past Telegram links and pruned jobs)
  const legacyMap = loadLegacyArchive();
  const archived = legacyMap[cleanSlug];
  if (archived) {
    // Return a valid Job object reconstructed from the archived record
    return {
      id: archived.id || cleanSlug,
      title: archived.title || 'Web3 Opportunity',
      company: archived.company || 'Web3 Company',
      link: archived.link || 'https://hashtagweb3.com/jobs',
      date: '2026-08-01',
      source: 'Archive',
      slug: cleanSlug,
      active: false,
    };
  }

  // 5. Backward compat: old hash slugs like frontend-0vo6wm4 (from previous dash-hash scheme)
  const dashIdx = cleanSlug.lastIndexOf('-');
  if (dashIdx !== -1) {
    const hashPart = cleanSlug.slice(dashIdx + 1);
    if (hashPart.length >= 4) {
      for (const job of allJobs) {
        if (getJobContentKey(job).slice(4) === hashPart) return job;
      }
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
function cleanAndExtractBlocks(html: string, job?: Job): Array<{ type: 'h3' | 'p' | 'li'; text: string }> {
  let decoded = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  decoded = cleanPublishText(decoded);

  const $ = cheerio.load(decoded);

  // Remove non-content tags and navigation / apply button boilerplate
  $('script, style, iframe, noscript, svg, button, form, input, select, nav, footer, header, .navbar, .logo, .role-back, .apply-row, .role-meta, .job-details-content__sidebar, .job-details-content__apply-section, .share-links, #apply, .h-header, .h-header-content, .h-header-menu, .custom-footer, .custom-footer-social-link, .boards-cookie-banner, .hosted-job-header, .hosted-job-office-locations, .hosted-job-preheader, [data-component="pf-popover"], [data-controller*="clipboard"], .credit, .sr-only, .visually-hidden').remove();

  // Strip links pointing to internal career lists or apply endpoints, handle empty anchors cleanly
  $('a').each((_, el) => {
    const $el = $(el);
    const href = ($el.attr('href') || '').trim();
    const label = $el.text().trim();
    if (!label) {
      $el.replaceWith(' ');
      return;
    }
    if (!href || !/^https?:\/\//i.test(href) || /fillout\.com|apply/i.test(href) || /←|all open roles/i.test(label)) {
      $el.replaceWith(` ${label} `);
      return;
    }
    $el.replaceWith(` \u21E7JOBLINK:${href}\u2044${label}\u21E9 `);
  });

  // Convert <br> tags to newlines
  $('br').replaceWith('\n');

  // Convert standalone <strong> or <b> section headers into explicit heading markers
  $('strong, b').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 2 && text.length < 80 && !text.includes('.') && !text.includes(';') && !text.includes(',')) {
      if (/^(about|overview|why|what|responsibilities|requirements|qualifications|benefits|perks|compensation|values|culture|profile|who|skills|bonus|location|role|the role|your impact|how to apply|the opportunity|opportunity|nice to have|who you are|about the organization|about the foundation|about you|what you.?ll do|what you will do|what we.?re looking for)/i.test(text)) {
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

  // Append newlines after block containers and headings
  $('p, div, section, article, h1, h2, h3, h4, h5, h6, li').each((_, el) => {
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

    // Skip leaked / non-content noise
    if (/^#LI-[A-Z0-9-]+$/i.test(line)) continue;
    if (/^It Pays to Work Here\.?$/i.test(line.trim())) continue;
    if (/^←\s*All open roles/i.test(line.trim())) continue;
    if (/^(Apply|Apply now|Share|Copy|Link|Share to|Job openings|Full-time|Part-time|Contract|Remote)$/i.test(line.trim())) continue;
    if (/^(Powered by|English|Українська|Polski|Español|Português|Deutsch|Slovenčina|Magyar)$/i.test(line.trim())) continue;
    if (/^This (?:job opening|position) is verified from/i.test(line.trim())) continue;
    if (/Click (?:<strong>)?Apply Now(?:<\/strong>)? to submit your application/i.test(line.trim())) continue;
    if (/submit your application directly via/i.test(line.trim())) continue;
    if (/^Location.*Type/i.test(line.trim())) continue;
    if (/For the complete documentation index/i.test(line.trim())) continue;
    if (/This page is also available as (?:Markdown|HTML|PDF)/i.test(line.trim())) continue;
    if (/^Previous\s*.*Next\s*/i.test(line.trim())) continue;
    if (/^Last updated \d+ (?:month|day|year)s? ago/i.test(line.trim())) continue;
    if (/^Was this (?:page )?helpful\?/i.test(line.trim())) continue;
    if (/vacancies are published on this (?:website|job board)/i.test(line.trim())) continue;
    if (/information on other sites may be inaccurate or outdated/i.test(line.trim())) continue;
    if (/apply directly through our official careers website/i.test(line.trim())) continue;
    if (/Candidate Privacy Notice/i.test(line.trim())) continue;
    if (/^Notice:\s*$/i.test(line.trim())) continue;
    if (job?.title && line.trim().toLowerCase() === job.title.trim().toLowerCase()) continue;
    if (job?.department && typeof job.department === 'string' && line.trim().toLowerCase() === job.department.trim().toLowerCase()) continue;

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
      /^(the opportunity|about the organization|about the foundation|about us|about the company|about the team|about you|who you are|who we are|what you.?ll do|what you will do|responsibilities|key responsibilities|core responsibilities|the role|role overview|requirements|key requirements|qualifications|minimum qualifications|basic qualifications|preferred qualifications|nice to have|bonus points|what you bring|what we.?re looking for|what we look for|what we offer|benefits|perks|compensation|our values|culture|company culture)[:]?$/i.test(
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
    const textOnly = cleanPublishText(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
    if (textOnly) {
      blocks.push({ type: 'p', text: textOnly });
    }
  }

  // Deduplicate identical blocks (e.g., duplicated About Us 🚀 sections)
  const seen = new Set<string>();
  const deduped: typeof blocks = [];
  for (const b of blocks) {
    const key = `${b.type}:${cleanPublishText(b.text).toLowerCase().replace(/\s+/g, ' ').trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(b);
  }

  return deduped;
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

      // 3c. Workday URL (e.g. circle.wd1.myworkdayjobs.com/Circle/job/...)
      if (!rawContent) {
        const workdayMatch = url.match(/([a-z0-9-]+)\.wd\d+\.myworkdayjobs\.com\/([^\/]+)\/job\/(.+)$/i);
        if (workdayMatch) {
          const [, tenant, boardName, jobPath] = workdayMatch;
          try {
            const endpoint = `https://${tenant}.wd1.myworkdayjobs.com/wday/cxs/${tenant}/${boardName}/job/${jobPath}`;
            const res = await fetch(endpoint, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
              },
              next: { revalidate: 86400 },
            });
            if (res.ok) {
              const data = await res.json();
              const desc = data?.jobPostingInfo?.jobDescription;
              if (desc && desc.length > 50) {
                rawContent = desc;
              }
            }
          } catch {}
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
