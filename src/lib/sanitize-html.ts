/**
 * Universal HTML Sanitizer & Formatter for Web3-Jobs
 * Ensures job descriptions, company summaries, and articles render clean HTML
 * without corrupted attributes, Slack/Greenhouse/Ashby junk data, or bad linebreaks.
 */

import { hasVerbatimText, transformOutsideVerbatim } from './preserve-verbatim';

/** Greenhouse/Coinbase accessibility promo leaked from ATS equal-opportunity footers. */
export function stripAtsScreenReaderPromo(html: string): string {
  if (!html) return html;
  // Works on decoded HTML and entity-escaped shards (&lt;a&gt;, &quot;, &#39;).
  return html.replace(
    /(?:&nbsp;|&#160;|\s)*Need screen reading technology\?[\s\S]*?(?:compatible screen reader|view the)[\s\S]*?tutorial[\s\S]*?(?:\.|&lt;\/a&gt;|<\/a>)/gi,
    '',
  );
}

/**
 * Some ATS responses / cache writes store markup entity-escaped inside a wrapper;
 * without decoding, cheerio treats tags as visible text and block extraction breaks.
 */
function looksLikeEntityEncodedMarkup(html: string): boolean {
  if (!html.includes('&lt;')) return false;
  const encodedTags = html.match(/&lt;\/?[a-z][a-z0-9-]*/gi);
  if ((encodedTags?.length ?? 0) >= 2) return true;
  // Wrapper paragraph around an entity-escaped blob (common in scraped shards).
  return /<[a-z][^>]*>\s*&lt;\/?[a-z]/i.test(html);
}

export function decodeEntityEscapedMarkup(html: string): string {
  let s = html;
  for (let pass = 0; pass < 3 && looksLikeEntityEncodedMarkup(s); pass += 1) {
    s = s
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&amp;/g, '&');
  }
  return s;
}

export function inferCompanyBrandToken(company?: string): string | null {
  if (!company?.trim()) return null;
  const first = company.trim().split(/\s+/)[0] || '';
  if (/^[A-Za-z0-9][A-Za-z0-9.&-]{0,10}$/.test(first)) return first;
  return null;
}

/**
 * Greenhouse/Slack highlight spans sometimes lose inner text during scrape, leaving
 * `<span class="..."> Group` or `<span Trading` in the HTML.
 */
export function repairCorruptedHighlightMarkup(html: string, company?: string): string {
  let s = html;
  const brand = inferCompanyBrandToken(company);

  s = s.replace(
    /<span class="[^"]*(?:_kqswh2mm|_5pioz8co|x_c-mrkdwnhighlight)[^"]*"\s+(?=[A-Za-z])/gi,
    brand ? `${brand} ` : '',
  );

  if (brand) {
    s = s.replace(/<span\s+(Trading|group)\b/gi, `${brand} $1`);
  } else {
    s = s.replace(/<span\s+(?!(?:class|style)=)([A-Za-z])/g, '$1');
  }
  s = s.replace(/&(?:amp;)?\s*<span\s+insurance\b/gi, '& disability insurance');

  s = s.replace(/<p[^>]*>\s*<strong\s+Us\s*<\/strong>\s*:\s*<\/span>\s*<\/p>/gi, '');
  s = s.replace(/<strong\s+Us\s*<\/strong>\s*:\s*(?:<\/span>)?/gi, '');
  s = s.replace(/<p[^>]*>\s*<strong\s+Us\s*<\/strong>\s*:\s*(?:<\/span>\s*)?<\/p>/gi, '');
  s = s.replace(/<p[^>]*>\s*:\s*<\/p>/gi, '');

  return s;
}

/** Patterns that must never appear in rendered job body HTML (visible leaks / corruption). */
export const JOB_DESCRIPTION_LEAK_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: 'entity-escaped-tags', re: /&lt;\/?(?:p|span|div|strong)\b/i },
  { name: 'screen-reader-promo', re: /Need screen reading technology\?/i },
  { name: 'orphan-span-trading', re: /<span\s+Trading\b/i },
  { name: 'broken-about-header', re: /<strong\s+Us\b/i },
  { name: 'lone-colon-paragraph', re: /<p[^>]*>\s*:\s*<\/p>/i },
  { name: 'raw-slack-highlight-class', re: /_kqswh2mm|_5pioz8co _189e1dm9/i },
];

export function sanitizeJobDescriptionHtml(html: string, company?: string): string {
  return sanitizeHtml(html, { company, forJobDescription: true });
}

export function sanitizeHtml(
  html: string,
  options?: { company?: string; forJobDescription?: boolean },
): string {
  if (!html || typeof html !== 'string') return '';
  if (options?.forJobDescription && hasVerbatimText(html)) {
    return transformOutsideVerbatim(html, part => sanitizeHtmlPart(part, options));
  }
  return sanitizeHtmlPart(html, options);
}

function sanitizeHtmlPart(html: string, options?: { company?: string; forJobDescription?: boolean }): string {
  const company = options?.company;
  let cleaned = decodeEntityEscapedMarkup(html);
  cleaned = stripAtsScreenReaderPromo(cleaned);
  if (options?.forJobDescription) {
    cleaned = repairCorruptedHighlightMarkup(cleaned, company);
  }

  // 1. Convert plain text without HTML tags to basic HTML paragraphs
  if (!/<[a-z][\s\S]*>/i.test(cleaned)) {
    const paragraphs = cleaned.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    cleaned = paragraphs.map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n');
  }

  // 2. Remove Slack/Greenhouse/Ashby data-stringify and highlighted span junk
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*x_c-mrkdwnhighlight[^"]*"[^>]*>(.*?)<\/span>/gi, '$1');
  cleaned = cleaned.replace(/<span[^>]*data-highlighted="[^"]*"[^>]*>(.*?)<\/span>/gi, '$1');
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*_kqswh2mm[^"]*"[^>]*>(.*?)<\/span>/gi, '$1');
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*_5pioz8co[^"]*"[^>]*>(.*?)<\/span>/gi, '$1');
  // Unclosed highlight wrappers (corrupted scrape)
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*_kqswh2mm[^"]*"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*_5pioz8co[^"]*"[^>]*>/gi, '');
  cleaned = cleaned.replace(/\sclass="[^"]*(?:_kqswh2mm|_5pioz8co)[^"]*"/gi, '');
  cleaned = cleaned.replace(/<div class="content-intro">(.*?)<\/div>/gi, '$1');

  // 3. Strip all data-* attributes (Slack, Greenhouse, Ashby, Notion)
  cleaned = cleaned.replace(/\s+data-[a-z0-9_-]+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  cleaned = cleaned.replace(/\s+[a-z0-9_-]+""="?"/gi, '');
  cleaned = cleaned.replace(/\s+[a-z0-9_-]+""/gi, '');

  // 4. Strip inline font/style corruptions
  cleaned = cleaned.replace(/\s*style=""\s*[^"'>]*/gi, '');
  cleaned = cleaned.replace(/\s*font-size:"=""\s*[^"'>]*/gi, '');
  cleaned = cleaned.replace(/\s*font-weight:"=""\s*[^"'>]*/gi, '');
  cleaned = cleaned.replace(/\s*font-family:"=""\s*[^"'>]*/gi, '');
  cleaned = cleaned.replace(/\s*style="min-height:\s*1\.[57]em;?"/gi, '');

  // Fix corrupted href attributes
  cleaned = cleaned.replace(/href=""\s*(https?:[^\s"'>]+)""\s*target=""\s*_blank""[^>]*>/gi, 'href="$1" target="_blank" rel="noopener noreferrer">');
  cleaned = cleaned.replace(/href=""\s*([^"'>]+)""[^>]*>/gi, 'href="$1" target="_blank" rel="noopener noreferrer">');

  // Strip empty class="", id="", style="" attributes
  cleaned = cleaned.replace(/\s+(class|id|style)=""/gi, '');

  // 5. Strip unneeded span tags wrapping plain text
  cleaned = cleaned.replace(/<span>(.*?)<\/span>/gi, '$1');
  cleaned = cleaned.replace(/<span style="">(.*?)<\/span>/gi, '$1');
  cleaned = cleaned.replace(/<span style="font-weight:\s*400;?">(.*?)<\/span>/gi, '$1');
  cleaned = cleaned.replace(/<span style="color:\s*rgb\(0,\s*0,\s*0\);?">(.*?)<\/span>/gi, '$1');

  // 6. Remove tracking code tags
  cleaned = cleaned.replace(/<p[^>]*>\s*#LI-[A-Z0-9]+\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/#LI-[A-Z0-9]+/gi, '');

  // 7. Convert trapped section headers inside <p><strong>...</strong></p> to <h3>
  const headerRegex = /<p[^>]*>\s*<(strong|b)>\s*(About Us|About|Overview|Responsibilities|Key Responsibilities|Qualifications|Requirements|What You'll Do|What You Need|Who You Are|Why Join Us|Why Work With Us|Benefits|Perks|Perks & Benefits|Benefits & Perks|How to Apply|Hiring Process|Where We Work|Culture|Equal Opportunity)\s*:?\s*<\/\1>\s*:?\s*<\/p>/gi;
  cleaned = cleaned.replace(headerRegex, (match, tag, headerText) => `<h3>${headerText.trim()}</h3>`);

  // Convert <h2> to <h3> for clean consistent hierarchy
  cleaned = cleaned.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, '<h3$1>$2</h3>');

  // 8. Fix mid-sentence line breaks (<br> followed by lowercase letter)
  if (!options?.forJobDescription) {
    cleaned = cleaned.replace(/<br\s*\/?>\s*([a-z0-9,;\.])/g, ' $1');
    cleaned = cleaned.replace(/([a-z0-9,;])\s*<br\s*\/?>\s*/gi, '$1 ');
  }

  // 9. Convert pseudo-bullets (* item, - item, • item) inside <p> or separated by <br> into <ul><li>
  cleaned = cleaned.replace(/(?:<p[^>]*>\s*[*•\-]\s+(.*?)<\/p>\s*)+/gi, (match) => {
    const items = match.split(/<\/p>\s*<p[^>]*>/).map((line) => {
      const text = line.replace(/<\/?p[^>]*>/g, '').replace(/^\s*[*•\-]\s*/, '').trim();
      return text ? `<li>${text}</li>` : '';
    }).filter(Boolean);
    return `<ul>${items.join('')}</ul>`;
  });

  // 10. Remove empty paragraphs and empty list items
  cleaned = cleaned.replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>)*\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<li>\s*(?:&nbsp;|<br\s*\/?>)*\s*<\/li>/gi, '');
  cleaned = cleaned.replace(/<ul>\s*<\/ul>/gi, '');
  cleaned = cleaned.replace(/<ol>\s*<\/ol>/gi, '');

  if (options?.forJobDescription) {
    cleaned = repairCorruptedHighlightMarkup(cleaned, company);
  }

  // 11. Fix double spaces and clean up whitespace
  cleaned = cleaned.replace(/ {2,}/g, ' ');
  cleaned = stripAtsScreenReaderPromo(cleaned);
  cleaned = cleaned.trim();

  return cleaned;
}
