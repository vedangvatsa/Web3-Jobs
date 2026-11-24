/**
 * Sanitize + conservative text polish for stored job description HTML.
 */
import * as cheerio from 'cheerio';
import { stripThirdPartyCommunityPromo } from './community-link-sanitizer';
import { catalogIntegrityOk, catalogLineEdit } from './catalog-line-editorial';
import { isGrammarJunkParagraph } from './grant-grammar';
import { sanitizeJobDescriptionHtml } from './sanitize-html';

const TEXT_TAGS = new Set(['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'blockquote']);

function polishVisibleText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return text;
  const edited = catalogLineEdit(trimmed);
  if (!edited || isGrammarJunkParagraph(edited)) return '';
  if (edited === trimmed) return text;
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trail = text.match(/\s*$/)?.[0] ?? '';
  return `${lead}${edited}${trail}`;
}

function polishJobDescriptionHtmlOnce(html: string, company?: string): string {
  let cleaned = sanitizeJobDescriptionHtml(html, company);
  cleaned = stripThirdPartyCommunityPromo(cleaned);

  const $ = cheerio.load(cleaned);
  const selector = [...TEXT_TAGS].join(',');
  $(selector).each((_, el) => {
    const node = $(el);
    const inner = node.html();
    if (!inner || !inner.trim()) return;
    const hasElements = /<\s*[a-z]/i.test(inner);
    if (hasElements) return;
    const next = polishVisibleText(inner);
    if (!next) {
      node.remove();
      return;
    }
    node.html(next);
  });

  return sanitizeJobDescriptionHtml($.root().html() || '', company);
}

export function polishJobDescriptionHtml(html: string, company?: string): string {
  const before = html?.trim() || '';
  if (!before) return '';

  let normalized = polishJobDescriptionHtmlOnce(before, company);
  for (let pass = 0; pass < 3; pass += 1) {
    const next = polishJobDescriptionHtmlOnce(normalized, company);
    if (next === normalized) break;
    normalized = next;
  }

  if (!catalogIntegrityOk(before, normalized)) return sanitizeJobDescriptionHtml(before, company);
  return normalized;
}