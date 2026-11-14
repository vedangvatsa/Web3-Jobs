import * as cheerio from 'cheerio';
import { STANDALONE_STAT_LINE } from '../../src/lib/event-description-cleanup';

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

/**
 * Text-level junk detectors for published event descriptions.
 *
 * Scraped organizer pages leave broken formatting on the page. Legitimate
 * agenda formatting is excluded everywhere: markdown headings, bullets,
 * numbered steps, time-prefixed rows, "Label:" rows (ASCII and full-width
 * colon), table rows, CJK lines and emoji-led lines.
 *
 * HARD failures (near-certain scrape damage, zero known false positives):
 *   - `chopped-sentence`: a run of lines that all end mid-sentence with a
 *     lowercase/opening-paren continuation line — a sentence chopped into
 *     fragments by a bad scrape ("Hello, the / Whitepaper Reading Club / is
 *     collaborating with").
 *   - `stat-line`: a standalone stat/price fragment that survived the render
 *     cleanup ("1200", "+10.00") — the cleanup pipeline is supposed to drop
 *     these, so one on the page means the pipeline broke.
 * SOFT signal (operator-visible warning, may hit legitimate styles such as
 * multi-line addresses): `junk-run`, three-plus short unpunctuated lines.
 */
export function textJunkRunIssues(text: string): FormattingIssue[] {
  if (!text) return [];
  const lines = text.split('\n').map(line => line.trim());
  const isExcluded = (line: string) =>
    !line
    || /^#{1,6}\s/.test(line)
    || /^[-*•▪–—]\s/.test(line)
    || /^\d+(?:[.)])\s/.test(line)
    || /^\d{1,2}:\d{2}/.test(line)
    || /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i.test(line)
    || /^[A-Za-z0-9][^:：]{0,48}[:：]\s/.test(line)
    || (line.startsWith('|') && line.endsWith('|'))
    || /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u.test(line)
    || /^\p{Extended_Pictographic}/u.test(line);
  const endsOpen = (line: string) => !/[.!?…:；;！？]['")\]]?$/.test(line);
  const continuesSentence = (line: string) => /^(?:[a-z(,])/.test(line);
  const joinsRun = (line: string) =>
    !isExcluded(line)
    && endsOpen(line)
    && line.length <= 40
    && !/https?:\/\//.test(line);

  const issues: FormattingIssue[] = [];
  let run: string[] = [];
  const flush = () => {
    if (run.length >= 3) {
      const chopped = run.some((_, index) => index + 1 < run.length && continuesSentence(run[index + 1]));
      issues.push({ kind: chopped ? 'chopped-sentence' : 'junk-run', sample: run.join(' | ').slice(0, 400) });
    }
    run = [];
  };
  for (const line of lines) {
    if (joinsRun(line)) run.push(line); else flush();
  }
  flush();

  for (const line of lines) {
    if (STANDALONE_STAT_LINE.test(line)) issues.push({ kind: 'stat-line', sample: line.slice(0, 400) });
  }
  return issues;
}
