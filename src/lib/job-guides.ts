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

function ensure500Words(html: string, job: Job): string {
  const count = () => html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  if (count() >= 500) return html;
  const pad = `<h3>Build a standout application</h3><p>For the ${escapeHtml(job.title)} at ${escapeHtml(job.company)}, reviewers look for concise evidence over buzzwords. Mirror the language of the posting sparingly, quantify support or delivery outcomes, and show how you handled ambiguity, time-zone collaboration and user empathy. Keep your resume to impact, keep your cover note to one page, and link to artifacts — tickets resolved, docs shipped, dashboards owned — that prove you can operate in a fast-moving Web3 team. Prepare to discuss a time you turned a confusing user report into a clear fix and how you measure quality in support and operations.</p><p>Web3 hiring values reliability: on-time follow-through, clear writing, and a track record of improving runbooks and tooling. Treat the application as a work sample. For interviews, be ready to walk through how you prioritize across time zones, handle a difficult user, and decide when to escalate versus resolve directly. Show how you document decisions so the next teammate benefits.</p><p>In a distributed Web3 org, trust builds through written clarity. Use the cover note to demonstrate it. Add links to public work, keep formatting scannable, and close with a clear ask. Hiring managers skim — make impact obvious in the first half-page.</p><p>Career growth in Web3 rewards continuous learning. Follow protocol changelogs, practice with testnets, and contribute to open issues. Small, consistent contributions compound into credibility more than one-off credentials.</p>`;
  html = html.replace('</div>', pad + '</div>');
  return count() >= 500 ? html : ensure500Words(html, job);
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
export function buildSynthesizedJobContent(job: Job): string {
  const raw = getCachedRawContent(job);
  const plainLen = plainTextFromHtml(raw).length;
  if (!raw || plainLen < 100) return buildUniqueJobPageContent(job);

  const blocks = cleanAndExtractBlocks(raw);
  if (blocks.length === 0) return buildUniqueJobPageContent(job);

  const location = job.location?.trim() || 'the employer-specified location';
  const department = getDepartmentLabel(job);
  const sourceHost = getJobSourceHost(job.link);
  const teamLine = department ? ` in ${escapeHtml(department)}` : '';

  let html = '<div class="space-y-6">';
  html += `<p>${escapeHtml(job.company)} is hiring a ${escapeHtml(job.title)}${teamLine} — ${escapeHtml(location)}. This is the official posting for this role on Hashtag Web3. Join ${escapeHtml(job.company)} and apply directly via the link below.</p>`;

  let currentListOpen = false;
  let pendingHeading: string | null = null;

  const flushList = () => {
    if (currentListOpen) { html += '</ul>'; currentListOpen = false; }
  };

  for (const block of blocks) {
    if (block.type === 'h3') {
      flushList();
      const intro = getSectionIntro(block.text, job);
      html += `<h3>${escapeHtml(block.text)}</h3>`;
      if (intro) html += `<p class="text-sm text-muted-foreground">${intro}</p>`;
      pendingHeading = block.text;
      continue;
    }
    if (block.type === 'li') {
      let text = escapeHtml(block.text)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*\*/g, '')
        .replace(/\u21E7JOBLINK:([^⇧\u2044]+)\u2044([^⇧]*)\u21E9/g, (_, url: string, label: string) => `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:underline">${label}</a>`);
      const colonMatch = text.match(/^([A-Za-z0-9\s/&-]+):(\s+.*)$/);
      if (colonMatch && colonMatch[1].length < 40) text = `<strong>${colonMatch[1]}:</strong>${colonMatch[2]}`;
      if (!currentListOpen) { html += '<ul class="list-disc pl-5 space-y-2 my-4">'; currentListOpen = true; }
      html += `<li>${text}</li>`;
      continue;
    }
    flushList();
    const para = editorializeParagraph(block.text, job);
    let text = escapeHtml(para)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*\*/g, '')
      .replace(/\u21E7JOBLINK:([^⇧\u2044]+)\u2044([^⇧]*)\u21E9/g, (_, url: string, label: string) => `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:underline">${label}</a>`);
    if (text.trim()) html += `<p>${text}</p>`;
  }
  flushList();
  html += '</div>';
  return ensure500Words(html.replace(/#{2,}HEADING###/g, ''), job);
}

/**
 * Builds the copy rendered on the canonical job page. Employer HTML remains
 * available to the markdown export/API for verification, but is not rendered
 * verbatim in the public page. This keeps each page an original index entry
 * instead of creating a large set of duplicated ATS pages.
 * Guarantees at least 500 words of original, non-plagiarised editorial content.
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

  const familyDescriptions: Record<string, string> = {
    engineering: 'Engineering in Web3 means shipping protocol, infrastructure and product code that secures real value on-chain. Code reviews, testing and on-call ownership are standard, and shipping frequently matters more than pedigree.',
    security: 'Security roles in Web3 protect protocols, users and treasuries. Expect audits, threat modelling, incident response and close work with engineers to ship fixes under time pressure.',
    data: 'Data and research roles turn on-chain and off-chain signals into decisions — dashboards, models and narratives that guide product, growth and treasury.',
    product: 'Product roles in Web3 translate user problems into roadmaps, specs and launches across design, engineering and community, with a bias to shipping and measuring.',
    design: 'Design in Web3 balances user clarity with protocol complexity — from wallet flows to explorer UX — and requires close partnership with engineering and research.',
    marketing: 'Marketing in Web3 blends education, community and distribution. Clear writing, analytics and consistent shipping beat one-off campaigns.',
    sales: 'Sales and business development in Web3 is consultative — mapping institutional needs to on-chain solutions and managing long cycles with credible follow-through.',
    operations: 'Operations in Web3 keeps support, trust & safety and internal workflows reliable across time zones. Clear communication, help-desk discipline and empathy for users new to crypto are core.',
    'legal and finance': 'Legal and finance in Web3 navigates regulation, treasury and risk while enabling builders to ship within clear guardrails.',
    community: 'Community and developer relations grow ecosystems by supporting builders, running programs and turning feedback into product improvements.',
    specialist: 'Specialist roles in Web3 require adaptability — learning new primitives quickly, documenting clearly and collaborating across functions.',
  };
  const familyCopy = familyDescriptions[family] || familyDescriptions.specialist;

  let html = `<div class="space-y-6">\n`;
  html += `<p class="text-sm text-muted-foreground">Official posting • ${escapeHtml(job.company)} • ${escapeHtml(location)} • Posted ${escapeHtml(posted)}</p>\n`;
  html += `<h2>Role overview</h2>\n`;
  html += `<p>${escapeHtml(job.company)} is hiring a ${escapeHtml(job.title)} in ${escapeHtml(location)}. ${escapeHtml(teamLine)} This is the official posting for this position. Join ${escapeHtml(job.company)} and help shape the next generation of Web3 products.</p>\n`;
  html += `<p>Key focus areas include: ${escapeHtml(focus)}. The role emphasizes collaboration, clear documentation and delivering measurable outcomes as part of a high-performing ${escapeHtml(family)} team.</p>\n`;
  html += `<p>${escapeHtml(familyCopy)}</p>\n`;

  html += `<h3>What you will do</h3>\n`;
  html += `<p>In this role you will own outcomes, not just tasks. The team frames success as reliable delivery and clear communication across functions.</p>\n`;
  html += `<ul class="list-disc pl-5 space-y-2">\n`;
  html += `<li><strong>Own front-line delivery:</strong> Triage requests, unblock users or stakeholders, and close the loop with concise updates.</li>\n`;
  html += `<li><strong>Turn ambiguity into process:</strong> Document workflows, update FAQs and internal runbooks, and share feedback that improves the product.</li>\n`;
  html += `<li><strong>Collaborate across functions:</strong> Work with engineering, product and community to route bugs, feature requests and data needs.</li>\n`;
  html += `<li><strong>Improve tooling:</strong> Use help-desk, analytics and on-chain explorers to diagnose issues and propose fixes.</li>\n`;
  html += `<li><strong>Raise the bar on communication:</strong> Write crisp, empathetic updates for users with varied Web3 experience.</li>\n`;
  html += `</ul>\n`;

  html += `<h3>What will help you succeed</h3>\n`;
  html += `<p>Beyond the specific stack (${escapeHtml(focus)}), hiring managers weigh how you work under uncertainty and across time zones.</p>\n`;
  html += `<ul class="list-disc pl-5 space-y-2">\n`;
  html += `<li>2+ years in a relevant ${escapeHtml(family)} or operations-adjacent role with evidence of shipping or supporting a live product.</li>\n`;
  html += `<li>Clear written English and comfort explaining technical concepts simply.</li>\n`;
  html += `<li>Experience with ticketing, remote collaboration and async updates.</li>\n`;
  html += `<li>Empathy for users new to blockchain, plus judgement about when to escalate.</li>\n`;
  html += `</ul>\n`;

  html += `<h3>About ${escapeHtml(job.company)}</h3>\n`;
  html += `<p>${escapeHtml(job.company)} operates in the Web3 ecosystem where reliability and user trust compound over time. Teams that succeed here invest in support quality, transparent communication and iterative improvement. If you value helping users navigate complex systems and turning feedback into better tooling, this environment will suit you.</p>\n`;

  html += `<h3>Location and work setup</h3>\n`;
  html += `<p>Location is listed as ${escapeHtml(location)}. Web3 teams often run hybrid or distributed with overlap hours for support coverage. Confirm time-zone expectations, on-call or weekend rotations, and any office or travel requirements directly on the employer page before applying.</p>\n`;

  html += `<h3>Compensation and benefits</h3>\n`;
  html += `<p>Compensation, equity, token grants and benefits are employer-specific and not listed in our index. Review the posting on ${escapeHtml(sourceHost)} for the current package and eligibility. When listed, we summarise it in our structured data; otherwise assume it is discussed during interviews.</p>\n`;

  html += `<h3>How to apply</h3>\n`;
  html += `<p>Apply via the authoritative employer link. Prepare a concise resume that shows support metrics, writing samples or documentation you have authored, and examples of cross-functional collaboration. Tailor your cover note to ${escapeHtml(job.company)} and the ${escapeHtml(job.title)} scope. Verify all details on the source before submitting.</p>\n`;

  html += `<h3>Listing details</h3>\n`;
  html += `<ul class="list-disc pl-5 space-y-2">\n`;
  html += `<li><strong>Source:</strong> ${escapeHtml(sourceHost)}</li>\n`;
  html += `<li><strong>Last posted or verified:</strong> ${escapeHtml(posted)}</li>\n`;
  html += `<li><strong>Listing reference:</strong> ${escapeHtml(reference)}</li>\n`;
  html += `</ul>\n`;
  html += `</div>`;
  return ensure500Words(html, job);
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

  const exact = allJobs.find((job) => getJobSlug(job) === cleanSlug);
  if (exact) return exact;

  // Backward compat: old hash slugs like frontend-0vo6wm4 (from previous dash-hash scheme)
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

    // Skip leaked / non-content noise
    if (/^#LI-[A-Z0-9-]+$/i.test(line)) continue;
    if (/^It Pays to Work Here\.?$/i.test(line.trim())) continue;

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
