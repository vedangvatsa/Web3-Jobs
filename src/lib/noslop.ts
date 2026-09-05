/**
 * Mandatory publish-time cleanup (see /noslop.md and ARTICLE_STYLE_GUIDE.md).
 *
 * Every user-facing string that we render or upsert should pass through
 * cleanPublishText (plain) or cleanPublishHtml (HTML bodies).
 */

/** Typographic junk -> plain ASCII-friendly forms */
const PUNCT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/—/g, ' - '], // em dash
  [/–/g, '-'], // en dash
  [/−/g, '-'], // minus
  [/…/g, '...'],
  [/\u00A0/g, ' '], // nbsp
  [/[“”„‟]/g, '"'],
  [/[‘’‚‛]/g, "'"],
  [/•/g, '-'],
  [/·/g, '-'],
  [/\u200B|\u200C|\u200D|\uFEFF/g, ''], // zero-width
];

// Emoji ranges - strip all pictographic symbols for clean job publishing
const EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u2300-\u23FF\u2B50\u2700-\u27BF\u{1FA70}-\u{1FAFF}]/gu;
const EMOJI_VARIATION_RE = /[\uFE0F\u200D]/g;

/** Soft AI/marketing filler phrases we strip only in our own copy helpers */
const FILLER_PHRASES: Array<[RegExp, string]> = [
  [/\bIn today'?s fast[- ]paced (?:digital )?world,?\s*/gi, ''],
  [/\bIt is important to note that\s+/gi, ''],
  [/\bAt the end of the day,?\s*/gi, ''],
  [/\bIt'?s worth noting that\s+/gi, ''],
];

export type NoslopReport = {
  changed: boolean;
  emDashes: number;
  enDashes: number;
  curlyQuotes: number;
  ellipses: number;
};

export function auditPublishText(input: string): NoslopReport {
  return {
    changed: false,
    emDashes: (input.match(/—/g) || []).length,
    enDashes: (input.match(/–/g) || []).length,
    curlyQuotes: (input.match(/[“”„‟‘’‚‛]/g) || []).length,
    ellipses: (input.match(/…/g) || []).length,
  };
}

/**
 * Clean plain text for publish. Safe for titles, meta, UI strings, Telegram, newsletter.
 */
export function cleanPublishText(
  input: string | null | undefined,
  opts?: { stripFiller?: boolean }
): string {
  if (!input) return '';
  let s = String(input);

  for (const [re, rep] of PUNCT_REPLACEMENTS) {
    s = s.replace(re, rep);
  }
  // Strip LinkedIn internal tracking tags (e.g. #LI-MM1, #LI-Remote)
  s = s.replace(/#LI-[A-Za-z0-9_-]+/gi, '');

  // Strip documentation site / GitBook leaked scraper artifacts
  s = s.replace(/For the complete documentation index, see[\s\S]*?\.(?:\s*This page is also available as Markdown\.)?/gi, '');
  s = s.replace(/This page is also available as (?:\[Markdown\]\([^)]*\)|Markdown|HTML|PDF)\.?/gi, '');
  s = s.replace(/Previous\s*[A-Za-z0-9\s()]+\s+Next\s*[A-Za-z0-9\s()]+/gi, '');
  s = s.replace(/Last updated \d+ (?:month|day|year)s? ago/gi, '');
  s = s.replace(/Was this (?:page )?helpful\?/gi, '');

  // Strip OKX / corporate anti-third-party disclaimers & candidate privacy notices
  s = s.replace(/(?:Notice:\s*)?All official [^.]*vacancies are published on this (?:website|job board)[\s\S]*?(?:official careers website|official channels)\.?/gi, '');
  s = s.replace(/While roles may appear on selected third-party platforms[\s\S]*?(?:official careers website|official channels)\.?/gi, '');
  s = s.replace(/If in doubt, please apply directly through our official careers website\.?/gi, '');
  s = s.replace(/We do not use third-party platforms or agencies for recruitment unless clearly stated\.?\s*All open roles are listed on our official channels\.?/gi, '');
  s = s.replace(/Information collected and processed as part of the recruitment process[\s\S]*?Candidate Privacy Notice\.?/gi, '');
  s = s.replace(/Candidate Privacy Notice\.?/gi, '');
  s = s.replace(/\*?Due to the (?:large amount|high volume) of (?:the )?applications, please consider your application as unsuccessful should you not be contacted within \d+ weeks from your application date\.?/gi, '');
  s = s.replace(/Feel free to send (?:your|you) CV[^\n<]*/gi, '');
  s = s.replace(/This role is remote and engaged through our [^.]*entity[^.]*\.?/gi, '');
  s = s.replace(/Apply now, and our Recruitment team will contact you with the next steps\.?/gi, '');
  s = s.replace(/Powered by\s+(?:Rippling|Greenhouse|Lever|Ashby|Workday|SmartRecruiters|Workable|BambooHR|Pinpoint|Recruitee|Breezy|JazzHR|Jobvite|Taleo|iCIMS|SuccessFactors|MokaHR|Hurma|Personio|Freshteam|Zoho|Bullhorn|Ceipal)\.?[^\n<]*/gi, '');

  // Strip emojis for noslop job pages
  s = s.replace(EMOJI_RE, '').replace(EMOJI_VARIATION_RE, '');

  // HTML entity forms that often sneak into scraped JDs
  s = s
    .replace(/&mdash;/gi, ' - ')
    .replace(/&ndash;/gi, '-')
    .replace(/&#8212;/g, ' - ')
    .replace(/&#8211;/g, '-')
    .replace(/&#x2014;/gi, ' - ')
    .replace(/&#x2013;/gi, '-')
    .replace(/&hellip;/gi, '...')
    .replace(/&#8230;/g, '...')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'");

  if (opts?.stripFiller) {
    for (const [re, rep] of FILLER_PHRASES) {
      s = s.replace(re, rep);
    }
  }

  // Collapse whitespace left by dash rewrites
  s = s
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +\./g, '.')
    .replace(/ +,/g, ',')
    .trim();

  return s;
}

/**
 * Clean HTML job bodies while preserving tags.
 */
export function cleanPublishHtml(input: string | null | undefined): string {
  if (!input) return '';
  let s = String(input);

  // Entity forms first
  s = s
    .replace(/&mdash;/gi, ' - ')
    .replace(/&ndash;/gi, '-')
    .replace(/&#8212;/g, ' - ')
    .replace(/&#8211;/g, '-')
    .replace(/&#x2014;/gi, ' - ')
    .replace(/&#x2013;/gi, '-')
    .replace(/&hellip;/gi, '...')
    .replace(/&#8230;/g, '...')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'");

  // Strip documentation site / GitBook & ATS leaked scraper artifacts
  s = s.replace(/<div class="sr-only">For the complete documentation index[\s\S]*?<\/div>/gi, '');
  s = s.replace(/For the complete documentation index, see[\s\S]*?\.(?:\s*This page is also available as Markdown\.)?/gi, '');
  s = s.replace(/This page is also available as (?:<a href="[^"]*">Markdown<\/a>|\[Markdown\]\([^)]*\)|Markdown|HTML|PDF)\.?/gi, '');
  s = s.replace(/<div class="max-w-3xl layout-wide:max-w-6xl mx-auto w-full mt-6 flex[\s\S]*?<\/div>\s*<\/div>/gi, '');
  s = s.replace(/PreviousBecome a Chef[\s\S]*?Was this helpful\?/gi, '');
  s = s.replace(/Last updated \d+ (?:month|day|year)s? ago/gi, '');
  s = s.replace(/Was this (?:page )?helpful\?/gi, '');

  // Strip ATS widget boilerplate & corporate anti-third-party disclaimers
  s = s.replace(/<a[^>]*>[\s\S]*?Back to jobs<\/a>/gi, '');
  s = s.replace(/Back to (?:all )?jobs/gi, '');
  s = s.replace(/<div class="job-alert[\s\S]*?<\/div>\s*<\/div>/gi, '');
  s = s.replace(/<div class="job-alert[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  s = s.replace(/<div class="application--container[\s\S]*?<\/div>\s*<\/div>/gi, '');
  s = s.replace(/<div class="application--header[\s\S]*?<\/div>\s*<\/div>/gi, '');
  s = s.replace(/\*?\s*indicates a required field\.?/gi, '');
  s = s.replace(/Create a Job Alert\.?/gi, '');
  s = s.replace(/Create alert\.?/gi, '');
  s = s.replace(/Interested in building your career at [^?]+\? Get future opportunities sent straight to your email\.?/gi, '');
  s = s.replace(/Apply for this job\.?/gi, '');
  s = s.replace(/(?:<p[^>]*>|<div[^>]*>)?\s*Powered by\s+(?:Rippling|Greenhouse|Lever|Ashby|Workday|SmartRecruiters|Workable|BambooHR|Pinpoint|Recruitee|Breezy|JazzHR|Jobvite|Taleo|iCIMS|SuccessFactors|MokaHR|Hurma|Personio|Freshteam|Zoho|Bullhorn|Ceipal)\.?[^<]*(?:<\/p>|<\/div>)?/gi, '');

  // Strip OKX / corporate anti-third-party disclaimers HTML + text forms
  s = s.replace(/(?:<div[^>]*>)?\s*(?:<span[^>]*>)*\s*(?:Notice:\s*(?:<br>)?\s*)?All official[\s\S]*?vacancies are published on this (?:website|job board)[\s\S]*?official careers website\.?\s*(?:<\/span>)*\s*(?:<\/div>)?/gi, '');
  s = s.replace(/All official [^.]*vacancies are published on this (?:website|job board)[\s\S]*?(?:official careers website|official channels)\.?/gi, '');
  s = s.replace(/While roles may appear on selected third-party platforms[\s\S]*?(?:official careers website|official channels)\.?/gi, '');
  s = s.replace(/If in doubt, please apply directly through our official careers website\.?/gi, '');
  s = s.replace(/We do not use third-party platforms or agencies for recruitment unless clearly stated\.?\s*All open roles are listed on our official channels\.?/gi, '');
  s = s.replace(/Information collected and processed as part of the recruitment process[\s\S]*?Candidate Privacy Notice\.?/gi, '');
  s = s.replace(/Information collected and processed as part of the recruitment process[\s\S]*?Privacy Notice\.?/gi, '');
  s = s.replace(/<a[^>]*>(?:[A-Za-z0-9\s-]+)?Applicant Privacy Notice<\/a>\.?/gi, '');
  s = s.replace(/Candidate Privacy Notice\.?/gi, '');
  s = s.replace(/<div class="content-conclusion">\s*<\/div>/gi, '');

  // Strip PeopleForce / external ATS leaked navbar, footer, language selectors & logo wrappers
  s = s.replace(/<nav class="[^"]*navbar[^"]*"[\s\S]*?<\/nav>/gi, '');
  s = s.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  s = s.replace(/<select[^>]*>[\s\S]*?<\/select>/gi, '');
  s = s.replace(/<img class="[^"]*logo[^"]*"[^>]*>/gi, '');
  s = s.replace(/<link\s+[^>]*>/gi, '');
  s = s.replace(/[?&;](?:X-Amz-[^"'\\s<>]+|AWSAccessKeyId=[^"'\\s<>]+)/gi, '');
  s = s.replace(/AKIA[0-9A-Z]{16}/g, '');

  // Strip Notion Spr.so header wrappers
  s = s.replace(/<div class="notion-header[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi, '');
  s = s.replace(/<div class="notion-header[^"]*"[\s\S]*?<\/div>/gi, '');

  // Strip recruiter contact, timeline notices & entity engagement
  s = s.replace(/Feel free to send (?:your|you) CV[^\n<]*/gi, '');
  s = s.replace(/Apply now, and our Recruitment team will contact you with the next steps\.?/gi, '');
  s = s.replace(/\*?Due to the (?:large amount|high volume) of (?:the )?applications, please consider your application as unsuccessful should you not be contacted within \d+ weeks from your application date\.?/gi, '');
  s = s.replace(/This role is remote and engaged through our [^.]*entity[^.]*\.?/gi, '');

  // Strip empty trailing headings
  s = s.replace(/<h[1-6][^>]*>\s*(?:<strong>)?\s*(?:How to Apply|Apply Now|Apply)\s*(?:<\/strong>)?\s*<\/h[1-6]>\s*(?:<\/div>)?$/gi, '</div>');

  // Unicode punctuation
  for (const [re, rep] of PUNCT_REPLACEMENTS) {
    s = s.replace(re, rep);
  }
  s = s.replace(/#LI-[A-Za-z0-9_-]+/gi, '');
  s = s.replace(EMOJI_RE, '').replace(EMOJI_VARIATION_RE, '');

  // Tighten double spaces
  s = s.replace(/[ \t]{2,}/g, ' ');
  return s;
}

/** True if text still contains banned punctuation. */
export function hasPublishSlop(input: string | null | undefined): boolean {
  if (!input) return false;
  return /[—–…]|[“”„‟‘’‚‛]/.test(input);
}

const BANNED_SLOP_LEXICON =
  /\b(delve|tapestry|pivotal|vibrant|meticulous|testament to|groundbreaking|leverage|utilize|synergy|holistic|seamless|cutting-edge|game-changer|supercharge|reimagine|revolutionize|world-class|best-in-class|state-of-the-art)\b/i;

/** True if copy still uses banned AI lexicon. */
export function hasBannedSlopLexicon(input: string | null | undefined): boolean {
  return BANNED_SLOP_LEXICON.test(String(input || ''));
}
