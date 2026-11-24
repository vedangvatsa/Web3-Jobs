import * as cheerio from 'cheerio';

/** Goldman Higher / Oracle CE section banners (often fused into one <p> with <br>). */
export const GOLDMAN_SECTION_HEADING =
  /^(?:OUR IMPACT|YOUR IMPACT|ABOUT THIS JOB|HOW YOU WILL FULFILL YOUR POTENTIAL|BASIC QUALIFICATIONS|PREFERRED QUALIFICATIONS|RESPONSIBILITIES|QUALIFICATIONS)$/i;

/** Short division labels that follow OUR IMPACT in lateral postings. */
const GOLDMAN_SUBSECTION =
  /^(?:Wealth Management|Asset & Wealth Management|Global Investment Research|Engineering|Risk|Compliance|Operations|Controllers|Human Capital Management)$/i;

function normalizeLineForHeading(text: string): string {
  return text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function isGoldmanJobHtml(html: string, company?: string): boolean {
  if (company === 'Goldman Sachs') return true;
  return /\bOUR IMPACT\b/.test(html) && /\bGoldman Sachs\b/i.test(html);
}

/** Split Oracle <br> blobs, promote GS banners to headings, repair `o` pseudo-bullets. */
export function normalizeGoldmanSachsJobHtml(html: string, company?: string): string {
  if (!html?.trim() || !isGoldmanJobHtml(html, company)) return html;

  let $ = cheerio.load(html);

  $('[style]').removeAttr('style');

  $('p').each((_, el) => {
    const $p = $(el);
    const inner = ($p.html() || '').trim();
    if (!inner) {
      $p.remove();
      return;
    }

    const segments = inner
      .split(/<br\s*\/?>/i)
      .map((part) => cheerio.load(part).text().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    if (segments.length <= 1) {
      const text = normalizeLineForHeading($p.text());
      if (GOLDMAN_SECTION_HEADING.test(text)) {
        $p.replaceWith(`\n###HEADING###${text}\n`);
        return;
      }
      if (GOLDMAN_SUBSECTION.test(text)) {
        $p.replaceWith(`\n###HEADING###${text}\n`);
        return;
      }
      return;
    }

    const replacement: string[] = [];
    for (const segment of segments) {
      if (GOLDMAN_SECTION_HEADING.test(segment)) {
        replacement.push(`\n###HEADING###${segment}\n`);
      } else if (GOLDMAN_SUBSECTION.test(segment)) {
        replacement.push(`\n###HEADING###${segment}\n`);
      } else if (/^o\s+\S/i.test(segment)) {
        replacement.push(`<li>${segment.replace(/^o\s+/i, '')}</li>`);
      } else {
        replacement.push(`<p>${segment}</p>`);
      }
    }
    $p.replaceWith(replacement.join('\n'));
  });

  $('p').each((_, el) => {
    const text = normalizeLineForHeading($(el).text());
    if (/^o\s+\S/i.test(text)) {
      $(el).replaceWith(`<li>${text.replace(/^o\s+/i, '')}</li>`);
    }
  });

  const htmlOut = $.root().html() || html;
  return htmlOut
    .replace(/\brole is(meant|designed|focused|built)\b/gi, 'role is $1')
    .replace(/\bThis role is(meant|designed|focused|built)\b/gi, 'This role is $1');
}