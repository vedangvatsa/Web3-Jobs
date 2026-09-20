import * as cheerio from 'cheerio';

export type FormattingIssue = { kind: string; sample: string };

export function descriptionFormattingIssues(html: string): FormattingIssue[] {
  const $ = cheerio.load(html);
  const issues: FormattingIssue[] = [];
  const add = (kind: string, sample: string) => issues.push({ kind, sample: sample.slice(0, 400) });
  $('h1,h2,h3,h4,p,li').each((_, el) => {
    if ($(el).parents('pre,code').length) return;
    const text = $(el).clone().find('ul,ol,pre,code').remove().end().text().trim();
    if (/^h[1-4]$/.test(el.tagName) && (!text || text.length > 180)) add('heading', text);
    if (el.tagName === 'p' && /^\s*(?:#{1,6}\s+|[-*•▪]\s+|\d+[.)]\s+[A-Z])/.test(text)) add('unformatted-block', text);
    if (/###(?:HEADING|BLOCK|STRUCTURE:\d+)###|⇧JOBLINK:|<\/?(?:p|div|strong|span)(?:\s|>)/.test(text)) add('markup-leak', text);
    if (el.tagName === 'p' && (text.match(/Zone [A-D]:/g) || []).length > 1) add('salary-rows', text);
    if (el.tagName === 'p' && /compensation\.Application Guidelines/.test(text)) add('fused-heading', text);
  });
  $('ul,ol').each((_, el) => {
    if (!$(el).children('li').length) add('empty-list', $.html(el));
    if ($(el).children().not('li').length) add('invalid-list-child', $.html(el));
  });
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (/\s|[<>]/.test(href) || !/^(?:https?:\/\/|mailto:|tel:|\/|#)/i.test(href)) add('link', href);
  });
  return issues;
}
