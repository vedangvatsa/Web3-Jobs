import type { Job, Company } from '@/types';
import { getJobs } from './jobs';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { cleanPublishText, cleanPublishHtml } from './noslop';
import { isGeneralOrPlaceholderJobTitle } from './job-filters';
import { sanitizeHtml } from './sanitize-html';

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
  const slugKey = (job as any).slug;
  const raw = cache[job.id] || (slugKey ? cache[slugKey] : null) || cache[getJobContentKey(job)] || job.description || '';
  return sanitizeHtml(raw);
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
  const isFlattened = Boolean(cached && cached.length > 200 && !cached.includes('\n') && !cached.includes('<p') && !cached.includes('<div') && !cached.includes('<li') && !cached.includes('<h'));
  if (cached && plainTextFromHtml(cached).length >= 100 && !isFlattened) return cached;
  return await fetchJobOriginalContent(job);
}

function spinJobPostingBlock(text: string, type: 'h3' | 'h4' | 'p' | 'li', isAboutSection: boolean): string {
  let cleaned = text.trim();
  if (!cleaned) return '';

  if (type === 'h4') {
    return cleaned.replace(/[:]+$/, '');
  }

  if (type === 'h3') {
    const lower = cleaned.toLowerCase();
    // Canonical renames. When the source heading carries substantial extra
    // prose beyond the canonical phrase (e.g. "Responsibilities span the
    // following areas"), the canonical name is kept ONLY if it covers most of
    // the text; otherwise the author's fuller heading is preserved verbatim so
    // no words are silently dropped (the old code returned just the canonical
    // name and deleted the remainder).
    const mappings: Array<[RegExp, string]> = [
      [/^(what you will do|what you.?ll do|key responsibilities|responsibilities|core responsibilities|the role|your role|duties|what the role entails)/i, 'Key Responsibilities'],
      [/^(what we.?re looking for|requirements|qualifications|key requirements|minimum qualifications|basic qualifications|you.?ll excel in this role|you will excel in this role)/i, 'Qualifications & Requirements'],
      [/^(who you are|who you.?re|about you|candidate profile|profile|what you bring)/i, 'Candidate Profile & Mindset'],
      [/^(bonus points|nice to have|preferred qualifications|preferred skills|plus points|what.?s nice to have)/i, 'Preferred / Nice-to-Have Qualifications'],
      [/^(what we offer|benefits|perks|compensation|rewards|why join us|life at|our perks|perks that empower you)/i, 'Perks & Compensation'],
      [/^(you.?ll know you.?re winning|how success is measured|what success looks like|measuring success)/i, 'What Success Looks Like'],
      [/^(why this role matters|why you.?ll love)/i, "Why This Role Matters & What's In It For You"],
      [/^(the opportunity|opportunity|the mission|mission|role overview)/i, 'The Opportunity & Scope'],
      [/^(about the organization|about the foundation)/i, 'About the Organization'],
      [/^(about us|about the company|who we are|company overview)/i, 'About the Company'],
    ];
    for (const [pattern, canonical] of mappings) {
      if (pattern.test(lower)) {
        const stripped = cleaned.replace(/[:]+$/, '').trim();
        if (stripped.length > canonical.length + 12) return stripped;
        return canonical;
      }
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
  let pendingHeading: string | null = null;
  let pendingIntro: string | null = null;

  const flushList = () => {
    if (currentListOpen) { html += '</ul>'; currentListOpen = false; }
  };

  // Normalized text of the last emitted h3: ATS postings (esp. Lever `lists`)
  // often repeat a section heading back-to-back ("Key Responsibilities" x2).
  // Emitting the repeat splits one list in two; the repeat is dropped and its
  // items merge under the first. Only CONSECUTIVE repeats merge — a different
  // heading in between means a genuinely new section, which stays faithful.
  let lastEmittedH3Norm = '';
  const normHeading = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
  // True when the pending heading came from a trailing-label split (below)
  // rather than a real heading block: a subsequent REAL heading supersedes
  // it (dropped, never rendered as a lone header).
  let pendingIsTrailLabel = false;

  const emitPendingHeading = () => {
    if (pendingHeading) {
      html += pendingHeading;
      if (pendingIntro) html += `<p class="text-sm text-muted-foreground mb-3">${pendingIntro}</p>`;
      pendingHeading = null;
      pendingIntro = null;
      pendingIsTrailLabel = false;
    }
  };
  const dropTrailPendingHeading = () => {
    if (pendingIsTrailLabel) {
      pendingHeading = null;
      pendingIntro = null;
      pendingIsTrailLabel = false;
    }
  };

  const emitParagraphHtml = (text: string) => {
    if (text.trim()) {
      emitPendingHeading();
      html += `<p class="text-muted-foreground leading-relaxed">${text}</p>`;
    }
  };

  for (const block of blocks) {
    if (block.type === 'h3' || block.type === 'h4') {
      flushList();
      dropTrailPendingHeading();
      emitPendingHeading();
      const isH3 = block.type === 'h3';
      if (isH3) isAboutSection = /about|who we are|company overview|mission/i.test(block.text);
      const spunHeading = spinJobPostingBlock(block.text, block.type, isAboutSection).replace(/[:]+$/, '').trim();
      // Safety net: a heading that somehow still carries a paragraph (>140
      // chars) is demoted to a paragraph rather than rendered as a giant <h3>.
      if (!spunHeading || spunHeading.length > 140) {
        if (spunHeading) emitParagraphHtml(renderInlineMd(escapeHtml(spunHeading)));
        continue;
      }
      const norm = normHeading(spunHeading);
      if (isH3 && norm && norm === lastEmittedH3Norm) continue;
      if (!isH3) lastEmittedH3Norm = '';
      // Skip title-echo headings ("WEEX-Backend Engineer (Java)" as an <h3>):
      // the page H1 already carries the title, so echo headings only add noise.
      if (isH3 && job?.title) {
        const titleNorm = normHeading(job.title);
        if (titleNorm.length >= 8 && norm.includes(titleNorm) && spunHeading.length < 120) continue;
      }
      const intro = isH3 ? getSectionIntro(spunHeading, job) : null;
      const rendered = renderInlineMd(escapeHtml(spunHeading));
      pendingHeading = isH3
        ? `<h3 class="text-xl font-bold tracking-tight text-foreground mt-8 mb-3">${rendered}</h3>`
        : `<h4 class="text-lg font-semibold tracking-tight text-foreground mt-6 mb-2">${rendered}</h4>`;
      pendingIntro = intro || null;
      pendingIsTrailLabel = false;
      if (isH3 && norm) lastEmittedH3Norm = norm;
      continue;
    }
    if (block.type === 'li') {
      const spunText = spinJobPostingBlock(block.text, 'li', isAboutSection);
      let text = renderInlineMd(escapeHtml(spunText));
      text = text.replace(/^[-*•·▪–—]\s+/, '');
      // Trailing section labels glued to the last bullet ("...temperatures
      // Safety Requirements", "...skills Physical requirements and work
      // environment") become a pending sub-heading for what follows instead
      // of dangling inside the bullet. The trimmed bullet renders first under
      // the current section; the label stays pending (dropped silently if a
      // real heading or nothing follows, so lone headers never render).
      // (First label word must be capitalized: lowercase tails like "...meets
      // all safety requirements" are prose, not labels. Later words accept
      // either case: "...Physical requirements and work environment".)
      const trailLabel = text.match(/^(.*?\S)\s+((?:Safety Requirements|Physical Demands|Physical [Rr]equirements|About the (?:Company|Role|Team))(?:\s+and\s+(?:[Ww]ork [Ee]nvironment|Safety Requirements|Physical Demands))?)\s*$/);
      if (trailLabel && trailLabel[1].length > 20) {
        text = trailLabel[1];
        const headColon = text.match(/^([A-Za-z0-9\s/&-]+):(\s+.*)$/);
        if (headColon && headColon[1].length < 40) text = `<strong>${headColon[1]}:</strong>${headColon[2]}`;
        emitPendingHeading();
        if (!currentListOpen) { html += '<ul class="list-disc pl-5 space-y-2 my-4">'; currentListOpen = true; }
        html += `<li>${text}</li>`;
        flushList();
        pendingHeading = `<h4 class="text-lg font-semibold tracking-tight text-foreground mt-6 mb-2">${renderInlineMd(escapeHtml(trailLabel[2]))}</h4>`;
        pendingIntro = null;
        pendingIsTrailLabel = true;
        continue;
      }
      const colonMatch = text.match(/^([A-Za-z0-9\s/&-]+):(\s+.*)$/);
      if (colonMatch && colonMatch[1].length < 40) text = `<strong>${colonMatch[1]}:</strong>${colonMatch[2]}`;
      emitPendingHeading();
      if (!currentListOpen) { html += '<ul class="list-disc pl-5 space-y-2 my-4">'; currentListOpen = true; }
      html += `<li>${text}</li>`;
      continue;
    }
    flushList();
    const spunPara = spinJobPostingBlock(block.text, 'p', isAboutSection);
    const text = renderInlineMd(escapeHtml(spunPara));
    if (text.trim()) {
      emitPendingHeading();
      html += `<p class="text-muted-foreground leading-relaxed">${text}</p>`;
    }
  }
  flushList();
  html += '</div>';
  // Fuse back-to-back lists (e.g. after a duplicate-heading merge) so one
  // section renders as one continuous bullet list, not two stacked ones.
  html = html.replace(/<\/ul>\s*<ul[^>]*>/g, '');
  const cleanedHtml = cleanPublishHtml(html.replace(/#{2,}HEADING###/g, ''));
  const visibleText = plainTextFromHtml(cleanedHtml);
  if (visibleText.length < 350 || blocks.length < 3) {
    return buildUniqueJobPageContent(job, raw);
  }
  return cleanedHtml;
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
  html += `<p class="leading-relaxed text-muted-foreground">Click <strong>Apply Now</strong> above to submit your application and review the full role specifications directly on <strong>${escapeHtml(job.company)}</strong>'s official careers portal.</p>\n`;
  html += `</div>`;
  return cleanPublishHtml(html);
}

export function buildUniqueJobMetaDescription(job: Job): string {
  const raw = getCachedRawContent(job);
  let text = plainTextFromHtml(raw);

  if (text && text.length >= 40) {
    const title = (job.title || '').trim();
    const company = (job.company || '').trim();
    const escapedTitle = title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const escapedCompany = company.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Strip boilerplate headers, ATS preambles, and repeated titles
    text = text
      .replace(new RegExp('^\\s*' + escapedTitle + '[:\\s-]*', 'i'), '')
      .replace(/^Role Overview:?\s*/i, '')
      .replace(/^Position Overview:?\s*/i, '')
      .replace(/^Job Description:?\s*/i, '')
      .replace(/^About the (role|position|job):?\s*/i, '')
      .replace(new RegExp('^About (the )?' + escapedCompany + '[:\\s-]*', 'i'), '')
      .replace(/^About (the )?[^:]{2,35}:\s*/i, '')
      .replace(/^Overview:?\s*/i, '')
      .replace(/^Company Description:?\s*/i, '')
      .replace(/^Who we are:?\s*/i, '')
      .replace(/^Responsibilities:?\s*/i, '')
      .replace(/^Key Responsibilities:?\s*/i, '')
      .replace(new RegExp('^\\s*' + escapedTitle + '[:\\s-]*', 'i'), '')
      .replace(/^Role Overview:?\s*/i, '')
      .trim();

    // Protect common abbreviations from splitting sentences falsely
    const normalized = text.replace(/\b(Inc|Corp|Ltd|Co|No|vs|approx|e\.g|i\.e)\.\s+/g, '$1_DOT_ ');
    const rawSentences = normalized.match(/[^.!?]+[.!?]+/g) || [];
    const sentences = rawSentences.map((s) => s.replace(/_DOT_\s+/g, '. ').trim());

    const isJunk = (s: string) => {
      return (
        /equal opportunity|affirmative action|accommodations|privacy notice|background check|cookie|upgrade your browser|browser is not supported|all qualified applicants|without regard to|veteran status|disability status/i.test(s) ||
        s.length < 40
      );
    };

    // Scan first 8 sentences for an ideal, complete sentence between 50 and 125 characters
    for (const s of sentences.slice(0, 8)) {
      let clean = s
        .replace(/^(Role Overview|Responsibilities|About the role|Position Overview|Job Description):?\s*/i, '')
        .replace(/^About [^:]{2,35}:\s*/i, '')
        .replace(/.*?\b(Who we are|About us|About the company|About our team):?\s*/i, '')
        .replace(/^[^a-zA-Z0-9"'(]+/, '')
        .trim();

      if (isJunk(clean)) continue;

      if (clean.length >= 50 && clean.length <= 125) {
        if (!/[.!?]$/.test(clean)) clean += '.';
        return clean;
      }
    }
  }

  // Graceful, informative, un-truncated fallback strictly under 115 characters
  const cleanTitle = (job.title || 'Role').replace(/\s*[\(\[].*?[\)\]]/g, '').trim();
  const shortTitle = cleanTitle.length > 36 ? cleanTitle.slice(0, 34).trim() : cleanTitle;
  const company = job.company?.trim() || 'the team';

  const opt1 = `Join ${company} as ${shortTitle}. View responsibilities, requirements, and apply directly.`;
  if (opt1.length <= 120) return opt1;

  const opt2 = `Explore the ${shortTitle} role at ${company} on Hashtag Web3.`;
  if (opt2.length <= 120) return opt2;

  return `Explore this ${company} opening on Hashtag Web3.`;
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
  // Only applies to single-token short slugs (no hyphens) with at least 4 digits or 5-char hex
  if (!cleanSlug.includes('-')) {
    let trailingSnippet: string | null = null;
    const digitMatch = cleanSlug.match(/^[a-z]+(\d{4,})$/);
    if (digitMatch) {
      trailingSnippet = digitMatch[1];
    } else {
      const hexMatch = cleanSlug.match(/^[a-z]+([a-f0-9]{5})$/);
      if (hexMatch && /\d/.test(hexMatch[1])) {
        trailingSnippet = hexMatch[1];
      }
    }

    if (trailingSnippet) {
      const matchByShortId = allJobs.find((job) => {
        const cleanId = (job.id || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
        return cleanId.endsWith(trailingSnippet!);
      });
      if (matchByShortId) return matchByShortId;
    }
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
function cleanAndExtractBlocks(html: string, job?: Job): Array<{ type: 'h3' | 'h4' | 'p' | 'li'; text: string }> {
  let decoded = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Strip trailing dash after period before line/tag break
  decoded = decoded.replace(/\.\s*[-–—]\s*(?=<\/p>|\n|$)/g, '.');

  // Pre-split headings that collide with sentence end or start of text.
  // NOTE: the space-separated (colon-less) form must only fire when the next
  // character is truly uppercase. The pattern carries the /i flag, which also
  // makes [A-Z0-9] lookaheads match lowercase — so the check is re-done here
  // with a case-SENSITIVE test. Without this, mid-sentence phrases like
  // "Responsibilities span..." lose the header word to a phantom heading and
  // orphan the remainder ("span the following areas:") as a fragment.
  const headerWords = 'Requirements|Responsibilities|Core Responsibilities|Key Responsibilities|Qualifications|What you will do|What you.ll do|What we.re looking for|Candidate Profile|Who you are|Benefits|Perks|Compensation|About the company|About the role|Working terms|Skills|Mission|What we offer';
  decoded = decoded.replace(
    new RegExp(`(?:^|([.!?]))\\s*(${headerWords})\\s*(?::\\s*|\\s+(?=[A-Z0-9]))[-*•·▪]?\\s*`, 'gi'),
    (full: string, p1: string, p2: string, offset: number, whole: string) => {
      const tail = full.slice(full.toLowerCase().lastIndexOf(p2.toLowerCase()) + p2.length);
      if (!tail.includes(':')) {
        // Strictly require an uppercase/digit boundary. In particular a "<"
        // (tag) does NOT qualify: the header word may sit inside markup
        // mid-phrase ("...skills <strong>requirements</strong> and..."),
        // where splitting eats the word and orphans the rest.
        const nextChar = whole[offset + full.length] || '';
        if (!/[A-Z0-9]/.test(nextChar)) return full;
      }
      return (p1 ? `${p1}\n\n` : '') + `###HEADING###${p2}\n`;
    },
  );

  decoded = cleanPublishText(decoded);

  // Pre-split Chinese bracket headings like 【岗位职责】 or 【任职要求】
  decoded = decoded.replace(/(?:<br\s*\/?>|\n|^)\s*([【\[][^】\]]+[】\]])/g, '\n\n###HEADING###$1\n');
  decoded = decoded.replace(/(?:<br\s*\/?>|\n)\s*(\d+[、．])/g, '\n- $1');

  // Pre-split inline bullets (run after cleanPublishText so converted dashes are caught)
  decoded = decoded.replace(/([;\.\?!])\s*[-*•·▪–—]\s+([A-Z0-9])/g, '$1\n- $2');
  decoded = decoded.replace(/([a-z0-9\)])\s*\.-\s*([A-Z])/g, '$1.\n- $2');
  decoded = decoded.replace(/:\s*[-*•·▪–—]\s+([A-Z0-9])/g, ':\n- $1');
  decoded = decoded.replace(/([;\.\?!:])\s*\*\s+([A-Z0-9])/g, '$1\n- $2');

  let $ = cheerio.load(decoded);

  // If a scoped job description container exists (e.g. Ripple / custom ATS wrapper dumps), focus on it
  if ($('.single-job-content').length > 0) {
    const sub = $('.single-job-content').html();
    if (sub) $ = cheerio.load(sub);
  }

  // Remove non-content tags and navigation / apply button boilerplate
  $('script, style, iframe, noscript, svg, button, form, input, select, nav, footer, header, .navbar, .logo, .role-back, .apply-row, .role-meta, .job-details-content__sidebar, .job-details-content__apply-section, .share-links, .fb-xfbml-parse-ignore, [class*="share-button"], [class*="social-share"], [class*="sharethis"], [class*="addthis"], #apply, .h-header, .h-header-content, .h-header-menu, .custom-footer, .custom-footer-social-link, .boards-cookie-banner, .hosted-job-header, .hosted-job-office-locations, .hosted-job-preheader, [data-component="pf-popover"], [data-controller*="clipboard"], .credit, .sr-only, .visually-hidden').remove();

  // Convert <br> and <hr> tags to newlines before text extraction
  $('br, hr').replaceWith('\n');

  // Flatten definition lists (Workday metadata: <dt>locations</dt>
  // <dd>New York</dd>) with explicit separators — otherwise text extraction
  // fuses them into "locationsNew York".
  $('dt').each((_, el) => {
    const t = $(el).text().trim();
    $(el).replaceWith(t ? `\n${t}: ` : '\n');
  });
  $('dd').each((_, el) => {
    const t = $(el).text().trim();
    $(el).replaceWith(t ? `${t}\n` : '\n');
  });

  // Separate adjacent inline elements with a space BEFORE text extraction:
  // ATS markup like <span>locations</span><span>Hong Kong</span> (or
  // "Engineering</h3><p>Engineering") otherwise concatenates to
  // "locationsHong Kong". Labels are trimmed at use sites, and block
  // whitespace collapses downstream, so the extra spaces are harmless.
  $('span, a, strong, b, em, i, u, small, label, font').each((_, el) => {
    $(el).append(' ');
  });

  // Strip links pointing to internal career lists or apply endpoints, handle empty anchors cleanly
  $('a').each((_, el) => {
    const $el = $(el);
    const href = ($el.attr('href') || '').trim();
    const label = $el.text().trim();
    if (!label) {
      // Image-only links ("explore our [logo] for more"): keep the image alt
      // text so the sentence doesn't dangle. Otherwise drop silently — host
      // names of share-widget pixels ("facebook.com") must never become
      // visible body copy.
      const imgAlt = $el.find('img').attr('alt')?.trim();
      $el.replaceWith(imgAlt ? ` ${imgAlt} ` : ' ');
      return;
    }
    if (!href || !/^https?:\/\//i.test(href) || /fillout\.com|apply/i.test(href) || /←|all open roles/i.test(label)) {
      $el.replaceWith(` ${label} `);
      return;
    }
    // Drop RTE junk links: self-referential bare-domain links ("Next.js" ->
    // http://next.js) and common-word mislinks ("us." -> http://us.how/).
    // Text is always preserved; only the bogus hyperlink is removed.
    try {
      const parsed = new URL(href);
      const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
      const labelNorm = label.replace(/[.\s]+$/g, '').toLowerCase();
      const bareWord = label.replace(/[^a-z]/gi, '').toLowerCase();
      const isRootPath = parsed.pathname === '/' || parsed.pathname === '';
      if (isRootPath && (host === labelNorm || (label.trim().length <= 4 && ['us', 'me', 'we', 'our', 'you'].includes(bareWord)))) {
        $el.replaceWith(` ${label} `);
        return;
      }
    } catch { /* keep link if URL unparseable */ }
    $el.replaceWith(` ⇧JOBLINK:${href}⁄${label}⇩ `);
  });

  // Unwrap redundant <b><strong>X</strong></b> nesting (Rippling/Google-
  // Translate span soup) so split headings become mergeable siblings below.
  $('b').each((_, el) => {
    const $b = $(el);
    const kids = $b.contents().filter((_, n: any) => !(n.type === 'text' && !String(n.data || '').trim()));
    if (kids.length === 1 && (kids[0] as any).type === 'tag' && ((kids[0] as any).name === 'strong' || (kids[0] as any).name === 'b')) {
      $b.replaceWith($(kids[0]));
    }
  });

  // Convert standalone <strong> or <b> section headers into explicit heading markers.
  // ATS editors often split one heading across adjacent bold elements
  // (<strong>About the O</strong><strong>pportunity</strong>); merge those
  // first so the heading is tested (and emitted) whole instead of orphaning
  // a fragment ("pportunity...") as body text.
  $('strong, b').each((_, el) => {
    const $el = $(el);
    let combined = $el.text();
    let mergedSiblings = false;
    // Climb through single-child wrappers (<b><strong>X</strong></b>) so the
    // scan continues at the phrase level, not the nesting level.
    const climb = (): any => {
      let n: any = ($el[0] as any).next;
      let scope: any = ($el[0] as any).parent;
      while (!n && scope && scope.type === 'tag' && !/^(p|div|li|h[1-6]|td|th|tr|tbody|table|ul|ol|body|html)$/i.test(scope.name || '')) {
        n = scope.next;
        scope = scope.parent;
      }
      return n;
    };
    let node: any = climb();
    while (node) {
      if (node.type === 'text') {
        if (node.data.trim() !== '') break;
        node = node.next;
        continue;
      }
      // Whitespace-only wrappers between split bolds (<span> </span>) are
      // dropped so the merge isn't blocked by formatting spans.
      if (node.type === 'tag' && node.name !== 'strong' && node.name !== 'b') {
        if ($(node).text().trim() !== '') break;
        const doomed: any = node;
        node = node.next;
        $(doomed).remove();
        continue;
      }
      if (node.type === 'tag' && (node.name === 'strong' || node.name === 'b')) {
        const piece = $(node).text();
        // Tight-join mid-word fragments ("O"+"pportunity", "e"+"Bay"): the
        // previous chunk ends in a lone single letter, which is never a
        // complete word (except a/I, which are excluded). Boundary spaces
        // appended for tag-concat separation are trimmed before testing so
        // they don't force a false space.
        const frag = combined.trimEnd().match(/(?:^|\s)([A-Za-z])$/)?.[1];
        const tight = !!frag && !/[aAI]/.test(frag) && /^[a-z]/.test(piece.trimStart());
        if (tight) combined = combined.trimEnd();
        combined += (tight ? '' : ' ') + piece;
        const doomed: any = node;
        node = node.next;
        $(doomed).remove();
        mergedSiblings = true;
        continue;
      }
      break;
    }
    const text = combined.trim();
    if (mergedSiblings && text) {
      // Keep the merged words in the DOM even when they are not a heading;
      // otherwise the removed siblings' text would be lost.
      $el.text(combined);
    }
    // A single (unmerged) bold phrase only counts as a heading when it stands
    // alone in its parent block. Mid-sentence emphasis ("learn more about
    // the company below") must never split the sentence into heading +
    // orphan fragments. Multi-strong merges are exempt: adjacent bolds are a
    // heading container by construction.
    let standsAlone = mergedSiblings;
    if (!standsAlone) {
      const $parent = $el.parent();
      if ($parent.length > 0) {
        const $pc = $parent.clone();
        $pc.find('strong,b').remove();
        standsAlone = $pc.text().trim() === '';
      }
    }
    if (!standsAlone) return;
    // Single generic words ("What", "About", "Bonus") are heading fragments,
    // not headings — headifying them orphans the rest ("What" + "you'll do
    // Payroll..."). Only complete single-word sections qualify alone.
    const isMultiWord = /\s/.test(text);
    const isStandaloneSection = /^(overview|responsibilities|requirements|qualifications|benefits|perks|compensation|values|culture|profile|skills|mission|location|department|salary|schedule|team)$/i.test(text);
    if (text.length > 2 && text.length < 80 && !text.includes('.') && !text.includes(';') && !text.includes(',') && (isMultiWord || isStandaloneSection)) {
      if (/^(about|overview|why|what|responsibilities|requirements|qualifications|benefits|perks|compensation|values|culture|profile|who|skills|bonus|location|physical demands|reports to|salary|employment type|job type|work location|schedule|department|team|requisition|disclaimer|visa sponsorship|work authorization|role|the role|the team|your impact|how to apply|the opportunity|opportunity|nice to have|who you are|who we are|how we work|how we hire|why work with us|position summary|role summary|job summary|about the organization|about the foundation|about the team|about the role|role overview|position overview|about you|what you.?ll do|what you will do|what we.?re looking for|working terms|ai usage)/i.test(text)) {
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

  // Normalize list items (process bottom-up so container <li> tags don't flatten nested elements)
  $('li').get().reverse().forEach((el) => {
    const $el = $(el);
    if ($el.find('li, h1, h2, h3, h4, h5, h6').length > 0) return;
    const text = $el.text().trim();
    if (text) {
      const items = text
        .split(/\s+[•·]\s+|\s+\*\s+(?=[A-Z0-9])|(?<=\.)\s+[-*•·▪–—]\s+(?=[A-Z])/)
        // ATS-fused dash chains ("Afines. - Experiencia...") split further;
        // ranges ("1 - 3 years") and hyphens ("full-time") are untouched.
        .flatMap((item) => splitFusedDashItems(item))
        .map((item) => item.replace(/^[-*•·▪–—]\s+/, '').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      $el.replaceWith(items.map((item) => `\n- ${item}\n`).join(''));
    }
  });

  // Append newlines after block containers and headings
  $('p, div, section, article, h1, h2, h3, h4, h5, h6').each((_, el) => {
    $(el).append('\n\n');
  });

  const fullText = $('body').text();
  const rawBlocks: Array<{ type: 'h3' | 'h4' | 'p' | 'li'; text: string }> = [];

  const MAJOR_HEADING_REGEX = /^(?:the opportunity|about (?:the |our )?(?:company|organization|foundation|team|us|you|the role)|who (?:you are|we are)|what (?:you(?:'ll| will) do|you(?:'ll| will) be doing|you bring|we(?:'re| are) looking for|we look for|we offer)|responsibilities|key responsibilities|core responsibilities|the role|role overview|requirements|key requirements|qualifications|minimum qualifications|basic qualifications|preferred qualifications|nice to have|bonus points|benefits|perks|compensation|our values|culture|company culture|working terms|hiring process|our interview process|interview process|where we work|how to apply|your journey with us|you(?:'ll| will) excel in this role(?: if you)?|you(?:'ll| will) know you(?:'re| are) winning(?: when)?|why this role matters(?: & what(?:'s| is) in it for you)?|perks that empower you|ready to build what(?:'s| is) next\??)[:]?$/i;

  const INTRO_LEADIN_REGEX = /^(?:here(?:'s| is) what.*|in this role.*|as an? \w+.*|we are looking for someone who.*|our ideal candidate.*|your responsibilities will include.*|key deliverables include.*|you will be responsible for.*)[:]?$/i;

  const lines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Strip boilerplate sentences (privacy-consent footers, equal-opportunity
    // boilerplate) before classification so the remainder re-classifies
    // naturally; skip the line if nothing substantive remains.
    if (!line.includes('###HEADING###')) {
      const stripped = stripBoilerplateSentences(line);
      if (!stripped) continue;
      if (stripped !== line) {
        line = stripped;
        lines[i] = stripped;
      }
      // Help-center page-dump artifacts (nav menus, bylines, signup promos)
      if (isNavMenuDump(line)) continue;
      if (/^By:\s*.+\|\s*\d*\s*$/.test(line)) continue;
      if (/find us on\s*:?\s*$/i.test(line) && line.length < 60) continue;
    }

    if (line.includes('###HEADING###')) {
      // Marker may sit mid-line when a heading <strong> was inline inside a
      // paragraph; split so the lead-in stays a paragraph and the marker
      // portion becomes the heading.
      const [before, ...rest] = line.split('###HEADING###');
      const beforeText = before.replace(/[:]+$/, '').trim();
      if (beforeText) {
        rawBlocks.push({ type: 'p', text: beforeText });
      }
      const hText = rest.join('').replace(/[:]+$/, '').trim();
      // Equal-opportunity headers and share/footer headings are boilerplate,
      // never section headings — drop them outright (their body sentences
      // are stripped separately).
      if (/^(equal opportunity|eeo)\b/i.test(hText)) continue;
      if (/^(share(\s+on|\s+this)?|follow us|connect with us)\s*:?\s*$/i.test(hText)) continue;
      if (hText && hText.length < 100) {
        rawBlocks.push({ type: 'h3', text: hText });
      } else if (hText) {
        rawBlocks.push({ type: 'p', text: hText });
      }
      continue;
    }

    // Skip decorative divider lines (____, ----, ====, ****)
    if (/^[-_=*~\u2022\u00b7\u2013\u2014\s]{3,}$/.test(line)) continue;

    // Skip leaked / non-content noise
    if (/^#LI-[A-Z0-9-]+$/i.test(line)) continue;
    if (/^Skip to (main content|navigation|search)\b/i.test(line.trim())) continue;
    if (/^page is loaded\.?\s*$/i.test(line.trim())) continue;
    if (/^It Pays to Work Here\.?$/i.test(line.trim())) continue;
    if (/^←\s*All open roles/i.test(line.trim())) continue;
    if (/^(Apply|Apply now|Share|Copy|Link|Share to|Job openings|Full-time|Part-time|Contract|Remote)$/i.test(line.trim())) continue;
    if (/^(Powered by|English|Українська|Polski|Español|Português|Deutsch|Slovenčina|Magyar)$/i.test(line.trim())) continue;
    if (/^By:\s*/i.test(line.trim())) continue;
    if (/^Related articles\b/i.test(line.trim())) continue;
    if (/^(share(\s+on|\s+this)?|follow us|connect with us)\s*:?\s*$/i.test(line.trim())) continue;
    if (/^(job description|position description|job overview)[:]?$/i.test(line.trim())) continue;
    // Social-link farm paragraphs (help-center / ATS footers like "Share on
    // Terms of service Privacy Cookies"): a paragraph that is almost entirely
    // links is a footer, never prose.
    if ((line.match(/⇧JOBLINK:/g) || []).length >= 3 && line.replace(/⇧JOBLINK:[^⇩]*⇩/g, '').trim().length < 80) continue;
    if ((line.match(/⇧JOBLINK:/g) || []).length >= 4 && (line.replace(/⇧JOBLINK:[^⇩]*⇩/g, '').trim().length < 300) && ((line.match(/\|/g) || []).length >= 3 || /find us on|follow us|supported platforms|join our community/i.test(line))) continue;
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
    if (/Due to the (?:large amount|high volume) of (?:the )?applications/i.test(line.trim())) continue;
    if (/Feel free to send (?:your|you) CV to/i.test(line.trim())) continue;
    if (/This role is remote and engaged through our [^.]*entity/i.test(line.trim())) continue;
    if (/Apply now, and our Recruitment team will contact you/i.test(line.trim())) continue;
    if (job?.title && line.trim().toLowerCase() === job.title.trim().toLowerCase()) continue;
    if (job?.department && typeof job.department === 'string' && line.trim().toLowerCase() === job.department.trim().toLowerCase()) continue;

    // Bullet item
    const bulletMatch = line.match(/^[-*•·▪–—]\s*(.*)$/);
    if (bulletMatch) {
      const bulletItems = bulletMatch[1]
        .split(/\s+[•·]\s+|\s+\*\s+(?=[A-Z0-9])|(?<=\.)\s+[-*•·▪–—]\s+(?=[A-Z])/)
        .flatMap((item) => splitFusedDashItems(item))
        .map((item) => item.replace(/^[-*•·▪–—]\s*/, '').trim())
        .filter(Boolean);
      for (const item of bulletItems) {
        // A previous bullet ending with a trailing dash usually soft-wraps
        // ("full- / time role") — but a capitalized, standalone next item
        // ("afines.- / Experiencia requerida...") is a NEW bullet whose
        // stray dash must be stripped instead of fused.
        const last = rawBlocks[rawBlocks.length - 1];
        if (last && last.type === 'li' && /[-–—]$/.test(last.text)) {
          const looksContinuation = /^[a-z]/.test(item) || item.length < 40;
          if (looksContinuation) {
            last.text = last.text.replace(/[-–—]+$/, '').trim() + ' - ' + item;
          } else {
            last.text = last.text.replace(/[-–—]+$/, '').trim();
            rawBlocks.push({ type: 'li', text: item });
          }
        } else {
          rawBlocks.push({ type: 'li', text: item });
        }
      }
      continue;
    }

    // Numbered subheading check: "1) Risk Measurement & Monitoring (BAU)" or "1. Partner Relationship"
    const numSubheadingMatch = line.match(/^(\d+)[\.\)]\s+([A-Z][^.!?]{2,80})$/);
    if (numSubheadingMatch) {
      const nextLine = lines[i + 1] || '';
      const isNextBullet = /^[-*•·▪–—]/.test(nextLine);
      const isNextNum = /^\d+[\.\)]/.test(nextLine);
      if (isNextBullet || (!isNextNum && nextLine.length > 25)) {
        rawBlocks.push({ type: 'h4', text: line.replace(/[:]+$/, '').trim() });
        continue;
      }
    }

    // Numbered list item: "1. Develop..." or "1、开发..."
    const numMatch = line.match(/^\d+[\.\)丶、．]\s*(.*)$/);
    if (numMatch && numMatch[1].trim()) {
      for (const item of splitFusedDashItems(numMatch[1].trim())) {
        rawBlocks.push({ type: 'li', text: item });
      }
      continue;
    }

    // Fused section-label split (single-line form; the merged-blocks form is
    // handled again after the merge pass below).
    if (line.length > 90) {
      const leadSplit = line.match(LEAD_SPLIT_RE);
      if (leadSplit) {
        rawBlocks.push({ type: 'h3', text: leadSplit[1] });
        const rest = line.slice(leadSplit[0].length).trim();
        if (rest) rawBlocks.push({ type: 'p', text: rest });
        continue;
      }
    }

    // Standalone heading line detection. The colon arm rejects sentence
    // fragments ("Span the following areas:") — a label rarely has a
    // determiner as its second word.
    if (
      line.length < 80 &&
      !INTRO_LEADIN_REGEX.test(line) &&
      (
        MAJOR_HEADING_REGEX.test(line) ||
        (line.endsWith(':') && /^[A-Z]/.test(line) && !line.includes('. ') && !line.includes('; ') && !/^[A-Z][a-z]+\s+(the|a|an|following|these|those|this|that|your|our|their|its|his|her)\b/.test(line)) ||
        /^(?:ready to build what's next|why join us|who we are|what we offer)\??$/i.test(line)
      )
    ) {
      rawBlocks.push({ type: 'h3', text: line.replace(/[:]+$/, '').trim() });
      continue;
    }

    // Continuation check: if previous block is li or p, and this line continues it
    const lastBlock = rawBlocks[rawBlocks.length - 1];
    if (lastBlock) {
      if (lastBlock.type === 'li') {
        const isLiContinuation =
          /^[a-z]/.test(line) ||
          !/[.!?:]$/.test(lastBlock.text) ||
          (/^(?:and|or|including|with|to|for|in|on|at|by|from|as|such as|plus|across|into|through|via)\b/i.test(line) && !/[.!?:]$/.test(lastBlock.text)) ||
          /[,\-–—(\/\\]$/.test(lastBlock.text);

        if (isLiContinuation) {
          lastBlock.text += ' ' + line;
          continue;
        }
      } else if (lastBlock.type === 'p') {
        const isParaContinuation =
          /^[a-z]/.test(line) ||
          !/[.!?:]$/.test(lastBlock.text) ||
          /^(?:and|or|including|with|to|for|in|on|at|by|from|as|such as|plus|across|into|through|via)\b/i.test(line);

        if (isParaContinuation) {
          lastBlock.text += ' ' + line;
          continue;
        }
      }
    }

    rawBlocks.push({ type: 'p', text: line });
  }

  // Merge any accidental fragment blocks into the previous block.
  // Headings are NEVER merge targets: a paragraph starting with a
  // continuation word ("As the role...", "At Ethena...") or a lowercase
  // token ("eToro is...") is a new block, not a heading continuation.
  // Merging those swallowed whole paragraphs into <h3> on 400+ pages.
  const blocks: Array<{ type: 'h3' | 'h4' | 'p' | 'li'; text: string }> = [];
  for (const block of rawBlocks) {
    const prev = blocks[blocks.length - 1];
    if (
      prev &&
      (prev.type === 'p' || prev.type === 'li') &&
      block.type === 'p' &&
      (
        /^[a-z]/.test(block.text) ||
        /^(?:including|and|or|with|to|for|in|on|at|by|from|as|such as|plus|across|into|through|via)\b/i.test(block.text) ||
        (prev.type === 'p' && !/[.!?:]$/.test(prev.text) && prev.text.length < 120) ||
        (prev.type === 'li' && /[,\-–—(\/\\]$/.test(prev.text))
      )
    ) {
      prev.text += ' ' + block.text;
    } else {
      blocks.push(block);
    }
  }

  // Re-strip boilerplate on MERGED blocks: trigger phrases split across source
  // lines ("Riot is an equal | opportunity employer.") evade the per-line
  // pass and only become visible after merging. Drop blocks emptied by it.
  for (let bi = blocks.length - 1; bi >= 0; bi--) {
    const b = blocks[bi];
    if (b.type !== 'p' && b.type !== 'li') continue;
    const rest = stripBoilerplateSentences(b.text);
    if (!rest) {
      blocks.splice(bi, 1);
    } else {
      b.text = rest;
    }
  }

  // Drop help-center nav-menu paragraphs that only assembled AFTER short menu
  // lines merged above (per-line length guards can't see the merged result).
  for (let bi = blocks.length - 1; bi >= 0; bi--) {
    if (blocks[bi].type === 'p' && isNavMenuDump(blocks[bi].text)) {
      blocks.splice(bi, 1);
    }
  }

  // Split fused section labels that only assembled after the merge above
  // ("How We Work We're remote-first..." from adjacent label/content divs).
  for (let bi = 0; bi < blocks.length; bi++) {
    const b = blocks[bi];
    if (b.type !== 'p' || b.text.length <= 90) continue;
    const m = b.text.match(LEAD_SPLIT_RE);
    if (!m) continue;
    const rest = b.text.slice(m[0].length).trim();
    if (!rest) continue;
    blocks.splice(bi, 1, { type: 'h3', text: m[1] }, { type: 'p', text: rest });
    bi++;
  }

  // Split trailing dash-chains inside paragraphs ("...spoken English. -
  // Bonus: visa help"): ATS dash-bullets that lost their line breaks. Only
  // the TAIL is peeled — ". - Capital…" segments (<140 chars, a single
  // sentence) become list items; the head stays a paragraph. Ranges
  // ("1 - 3 years") and mid-prose dashes never match (no preceding period).
  for (let bi = 0; bi < blocks.length; bi++) {
    const b = blocks[bi];
    if (b.type !== 'p') continue;
    const items: string[] = [];
    let head = b.text;
    for (;;) {
      const m = head.match(/^(.*)\.\s+-\s+([A-Z][\s\S]{5,140})$/);
      if (!m) break;
      const tail = m[2].trim();
      if (/[.?!]\s+[A-Z]/.test(tail)) break;
      items.unshift(tail);
      head = `${m[1].trim()}.`;
      if (items.length >= 12) break;
    }
    if (items.length > 0 && head.length >= 30) {
      const nb: typeof blocks = [{ type: 'p', text: head }, ...items.map((text) => ({ type: 'li' as const, text }))];
      blocks.splice(bi, 1, ...nb);
      bi += nb.length - 1;
    }
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
 * Shared inline-markdown renderer for ALREADY-ESCAPED text. Applies to every
 * block type (h3/h4/p/li): previously headings skipped this, leaking raw
 * `**bold**` markers into <h3> on dozens of pages (e.g. `**expanding**`).
 */
function renderInlineMd(escaped: string): string {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])__([^_]+)__/g, '$1<strong>$2</strong>')
    .replace(/\*\*/g, '')
    .replace(/⇧JOBLINK:([^⇧⁄]+)⁄([^⇧]*)⇩/g, (_m, url: string, label: string) => `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-primary hover:underline">${label}</a>`)
    .replace(/\s+([,.:;!?])/g, '$1')
    // Tighten boundary spaces introduced by tag-concat separation:
    // "( Radar )" back to "(Radar)". Runs here (not at extraction) so link
    // labels and bold spans keep their separators until the very end.
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+/g, ' ');
}

/**
 * Splits ATS-fused dash chains inside list-bound text:
 * "Fluent English. - Nice to have: - Prior crypto experience" ->
 * ["Fluent English.", "Nice to have: Prior crypto experience"].
 * Only splits after `.`/`:` + dash + Capital, so ranges ("1 - 3 years"),
 * hyphens ("full-time") and prose ("Austin - Remote") are untouched.
 */
function splitFusedDashItems(text: string): string[] {
  const folded = text.replace(/:\s*[-–—]\s+(?=[A-Z])/g, ': ');
  return folded
    .split(/\.\s*[-–—]\s+(?=[A-Z])/)
    .map((part, i, arr) => (i < arr.length - 1 ? `${part.trim()}.` : part.trim()))
    .map((part) => part.replace(/^[-*•·▪–—]\s+/, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/**
 * Boilerplate sentences stripped per line before block classification, so the
 * remainder re-classifies naturally. Covers ATS privacy-consent footers and
 * equal-opportunity boilerplate (the meta-description builder already treats
 * these as junk; the body must too).
 */
const BOILER_SENTENCE_RES: RegExp[] = [
  /[^.!?]*\bpage is loaded\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\bby submitting your application to us, you consent\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\bplease consider your application as unsuccessful\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\bequal opportunity employers?\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\ball qualified applicants\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\baffirmative action\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\bwithout regard to\b[^.!?]*(?:race|color|religion|sex|national origin)[^.!?]*[.!?]*/gi,
  // E-Verify / eligibility boilerplate ("...required to verify identity and
  // eligibility to work...") and diversity-boilerplate sentences that carry
  // no role information.
  /[^.!?]*\bverify identity and eligibility\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\bdiverse and inclusive workplace\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\bcommitted to creating an inclusive environment\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\binclusive environment for all employees\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\bdoes not make [\w\s]*decisions on the basis of\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\bdo not discriminate\b[^.!?]*[.!?]*/gi,
  /[^.!?]*\bcelebrat\w+ (?:our |the )?(?:diverse|differences)\b[^.!?]*[.!?]*/gi,
];

function stripBoilerplateSentences(line: string): string {
  let out = line;
  for (const re of BOILER_SENTENCE_RES) {
    re.lastIndex = 0;
    out = out.replace(re, ' ');
  }
  // Standalone recruiter-timeline / signup-promo sentences
  out = out.replace(/Sign up for a \w+ account now:?\s*/gi, ' ');
  // Help-article bylines embedded mid-line ("By: WEEX | 0 ...")
  out = out.replace(/\bBy:\s*[A-Za-z0-9_.)(-]+\s*\|\s*\d+/gi, ' ');
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Fused section-label openers ("About the Role Bybit is seeking...",
 * "How We Work We're remote-first..."): a heading glued to its paragraph at
 * a tag boundary. Only fragmentary openers qualify — grammatical starts
 * ("The Team is...", "About the company, we...") stay prose.
 */
const LEAD_SPLIT_RE = /^(About the (?:Company|Role|Team|Organization|Foundation)|About Us|Position Summary|Role Summary|Job Summary|The Position|Ideal Candidate|Desired Candidate|Preferred Candidate|How We Work|Why Work With Us|What We Offer|Who We Are|How We Hire|What You.ll Do|Your Mission|Your Impact)\s*[-:—]?\s*(?=[A-Z][\s\S]{40,})/;

/** Help-center nav keywords: a long period-less line hitting 3+ is a menu dump, not prose. */
const NAV_MENU_KWS = [
  'popular topics', 'latest articles', 'featured articles', 'latest updates',
  'announcements', 'community channels', 'account security', 'terms of use',
  'deposit/withdrawal', 'getting started', 'how-to guides', 'quick buy',
  'download the app', 'copy trading', 'futures guide', 'spot trading',
];

function isNavMenuDump(line: string): boolean {
  // Drop link URLs but KEEP their labels: help-center menu items ARE links,
  // and wiping the labels too would erase the very keywords we count (the
  // href dots would otherwise also fake sentence ends and exempt the dump).
  const deLinked = line.replace(/⇧JOBLINK:[^⇩⁄]*⁄([^⇩]*)⇩/g, ' $1 ').replace(/https?:\/\/\S+/g, ' ');
  if (deLinked.length < 200) return false;
  const lower = deLinked.toLowerCase();
  let hits = 0;
  for (const kw of NAV_MENU_KWS) {
    if (lower.includes(kw)) hits++;
  }
  // 6+ distinct menu terms never co-occur in genuine prose — even when the
  // blob absorbed a real sentence (with periods) at its edge.
  if (hits >= 6) return true;
  return hits >= 3 && !/[.!?]/.test(deLinked);
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
      text = text.replace(/^[-*•·▪–—]\s+/, '');
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
      } else if (block.type === 'h4') {
        html += `<h4>${text}</h4>`;
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
  const isFlattened = Boolean(rawContent && rawContent.length > 200 && !rawContent.includes('\n') && !rawContent.includes('<p') && !rawContent.includes('<div') && !rawContent.includes('<li') && !rawContent.includes('<h'));
  if (isFlattened) {
    rawContent = '';
  }

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
        const workdayMatch = url.match(/([a-z0-9-]+)\.(wd\d+)\.myworkdayjobs\.com\/([^\/]+)\/job\/([^?#]+)/i);
        if (workdayMatch) {
          const [, tenant, wdShard, boardName, jobPath] = workdayMatch;
          try {
            const endpoint = `https://${tenant}.${wdShard}.myworkdayjobs.com/wday/cxs/${tenant}/${boardName}/job/${jobPath}`;
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

      // 3d. Hurma URL (e.g. whitebit.hurma.work/public-vacancies/1174)
      if (!rawContent) {
        const hurmaMatch = url.match(/([a-z0-9-]+)\.hurma\.work\/public-vacancies\/(\d+)/i);
        if (hurmaMatch) {
          const [, subdomain, vacancyId] = hurmaMatch;
          try {
            const endpoint = `https://${subdomain}.hurma.work/api/v1/public-vacancies/${vacancyId}`;
            const res = await fetch(endpoint, {
              headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
              },
              next: { revalidate: 86400 },
            });
            if (res.ok) {
              const data = await res.json();
              const desc = data?.data?.description_html;
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
