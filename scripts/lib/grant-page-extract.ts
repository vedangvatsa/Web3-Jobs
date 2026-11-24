import { load, type Cheerio, type CheerioAPI } from 'cheerio';

export type GrantExtractedSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GrantPageExtract = {
  method: 'jsonld' | 'sections' | 'paragraphs' | 'meta';
  pageTitle: string;
  sections: GrantExtractedSection[];
  wordCount: number;
  leadParagraph?: string;
};

const UA = 'HashtagWeb3 Grant Index/1.0 (+https://hashtagweb3.com)';
const ERROR_PAGE =
  /access denied|just a moment|verify (?:that )?you are human|page not found|enable javascript|checking your browser|attention required|403 forbidden/i;
const UI_TEXT =
  /^(?:skip to (?:main )?content|menu|close|sign (?:in|up)|log in|register(?: now)?|apply now|learn more|read more|accept all|reject all|manage cookies|cookie (?:policy|preferences)|privacy policy|terms (?:of use|and conditions)|all rights reserved|subscribe(?: to our newsletter)?|get started|contact us)[.!\s]*$/i;
const MARKDOWN_JUNK =
  /^(?:published time:|url source:|markdown content:|title:|\!\[image)/i;

export function grantFetchUserAgent(): string {
  return UA;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function isRelatedMediaParagraph(text: string): boolean {
  const t = cleanText(text);
  if (/^(?:magazine|related|listen|watch|podcast|video):/i.test(t)) return true;
  if (/\.?\s*source:\s*youtube\s*$/i.test(t)) return true;
  if (/\b(?:x\s+)?hall of flame\s*$/i.test(t)) return true;
  if (/^related:\s/i.test(t)) return true;
  return false;
}

function isUsefulParagraph(text: string): boolean {
  const t = cleanText(text);
  if (MARKDOWN_JUNK.test(t)) return false;
  if (t.includes('?') && wordCount(t) >= 4) return !isRelatedMediaParagraph(t);
  if (t.length < 40) return false;
  if (isRelatedMediaParagraph(t)) return false;
  if (UI_TEXT.test(t)) return false;
  if (/cookie|privacy policy|terms of service|all rights reserved/i.test(t) && t.length < 120) return false;
  if (/do not submit passwords|report malicious form/i.test(t)) return false;
  if (
    t.endsWith('?') &&
    wordCount(t) < 25 &&
    /^(?:what |tell us |share any |how |who |when |where )/i.test(t)
  ) {
    return false;
  }
  return wordCount(t) >= 8;
}

function isUsefulHeading(text: string): boolean {
  const t = cleanText(text);
  if (!t || t.length > 120) return false;
  if (UI_TEXT.test(t)) return false;
  return true;
}

function collectJsonLdDescriptions(html: string): string[] {
  const $ = load(html);
  const out: string[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    const node = value as Record<string, unknown>;
    if (typeof node.description === 'string' && node.description.trim().length >= 40) {
      out.push(cleanText(node.description));
    }
    if (node['@graph']) visit(node['@graph']);
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      visit(JSON.parse($(el).text()));
    } catch {
      /* ignore invalid JSON-LD */
    }
  });
  return [...new Set(out)];
}

function metaCandidates($: CheerioAPI): string[] {
  const items = [
    $('meta[property="og:description"]').attr('content'),
    $('meta[name="description"]').attr('content'),
    $('meta[name="twitter:description"]').attr('content'),
  ]
    .filter((v): v is string => typeof v === 'string' && v.trim().length >= 40)
    .map(cleanText);
  return [...new Set(items)];
}

function contentRoot($: CheerioAPI): Cheerio<unknown> {
  const selectors = ['main', 'article', '[role="main"]', '#main-content', '.main-content', '#content', '.content'];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length && cleanText(el.text()).length > 200) return el;
  }
  return $('body');
}

function isStandaloneStrongQuestion($: CheerioAPI, el: unknown, text: string): boolean {
  if (!text || text.length > 280) return false;
  if ($(el as never).parents('p,li,a,button,label').length) return false;
  if (UI_TEXT.test(text)) return false;
  return text.includes('?') || /\b(?:how|what|where|when|why|can|do|does|is|are|will)\b/i.test(text);
}

function stripHeadingEmoji(text: string): string {
  return cleanText(text.replace(/\p{Extended_Pictographic}/gu, '').replace(/^[?\s❓]+/, '').trim());
}

function sectionsFromHeadings($: CheerioAPI, root: Cheerio<unknown>): GrantExtractedSection[] {
  const sections: GrantExtractedSection[] = [];
  let current: GrantExtractedSection | null = null;
  let pendingQuestion: string | null = null;

  const flush = () => {
    if (!current) return;
    if (pendingQuestion) {
      current.paragraphs.push(pendingQuestion);
      pendingQuestion = null;
    }
    current.paragraphs = current.paragraphs.filter(isUsefulParagraph);
    current.bullets = current.bullets?.filter((b) => isUsefulParagraph(b) && b.length < 400);
    if (current.paragraphs.length || (current.bullets && current.bullets.length)) {
      sections.push(current);
    }
    current = null;
  };

  root.find('h1,h2,h3,h4,h5,h6,p,ul,ol,strong').each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    const text = cleanText($(el).text());
    if (!text) return;

    if (tag && /^h[1-6]$/.test(tag)) {
      if (!isUsefulHeading(stripHeadingEmoji(text))) return;
      flush();
      current = { heading: stripHeadingEmoji(text), paragraphs: [], bullets: [] };
      pendingQuestion = null;
      return;
    }

    if (!current) {
      current = { heading: 'Program overview', paragraphs: [], bullets: [] };
    }

    if (tag === 'strong') {
      if (isStandaloneStrongQuestion($, el, text)) {
        pendingQuestion = text;
      }
      return;
    }

    if (tag === 'p' && isUsefulParagraph(text)) {
      const merged = pendingQuestion ? `${pendingQuestion}\n\n${text}` : text;
      current.paragraphs.push(merged);
      pendingQuestion = null;
      return;
    }

    if (tag === 'ul' || tag === 'ol') {
      if (pendingQuestion) {
        current.paragraphs.push(pendingQuestion);
        pendingQuestion = null;
      }
      $(el)
        .find('li')
        .each((__, li) => {
          const liText = cleanText($(li).text());
          if (isUsefulParagraph(liText) && liText.length < 500) {
            current!.bullets!.push(liText);
          }
        });
    }
  });

  flush();
  return sections;
}

function paragraphsOnly(root: Cheerio<unknown>, $: CheerioAPI): GrantExtractedSection[] {
  const paragraphs: string[] = [];
  root.find('p').each((_, el) => {
    const text = cleanText($(el).text());
    if (isUsefulParagraph(text)) paragraphs.push(text);
  });
  const unique = [...new Set(paragraphs)].slice(0, 12);
  if (!unique.length) return [];
  return [{ heading: 'Program overview', paragraphs: unique }];
}

function totalWords(sections: GrantExtractedSection[]): number {
  const text = sections
    .flatMap((s) => [...s.paragraphs, ...(s.bullets || [])])
    .join(' ');
  return wordCount(text);
}

function markdownToSections(markdown: string): GrantExtractedSection[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const sections: GrantExtractedSection[] = [];
  let current: GrantExtractedSection = { heading: 'Program overview', paragraphs: [], bullets: [] };
  let pendingQuestion: string | null = null;

  const flushSection = () => {
    if (pendingQuestion) {
      current.paragraphs.push(pendingQuestion);
      pendingQuestion = null;
    }
    current.paragraphs = current.paragraphs.filter(isUsefulParagraph);
    current.bullets = current.bullets?.filter((b) => isUsefulParagraph(b));
    if (current.paragraphs.length || (current.bullets && current.bullets.length)) sections.push(current);
    current = { heading: 'Program overview', paragraphs: [], bullets: [] };
  };

  const pushParagraph = (text: string) => {
    const line = cleanText(text);
    if (!line || MARKDOWN_JUNK.test(line) || /^!\[/.test(line)) return;
    const qOnly = line.match(/^\*\*(.+?)\*\*\s*$/);
    if (qOnly && qOnly[1].includes('?')) {
      pendingQuestion = cleanText(qOnly[1]);
      return;
    }
    if (/^\*\*(.+?)\*\*\s*$/.test(line)) return;
    if (line.endsWith('?') && wordCount(line) >= 4 && line.length < 220) {
      pendingQuestion = line.replace(/^\*\*|\*\*$/g, '');
      return;
    }
    if (isUsefulParagraph(line)) {
      const merged = pendingQuestion ? `${pendingQuestion}\n\n${line}` : line;
      current.paragraphs.push(merged);
      pendingQuestion = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const h = line.match(/^#{1,4}\s+(.+)$/);
    if (h) {
      flushSection();
      if (isUsefulHeading(stripHeadingEmoji(h[1]))) {
        current = { heading: stripHeadingEmoji(h[1]), paragraphs: [], bullets: [] };
      }
      continue;
    }
    if (/^[-*•]\s+/.test(line)) {
      if (pendingQuestion) {
        current.paragraphs.push(pendingQuestion);
        pendingQuestion = null;
      }
      const bullet = cleanText(line.replace(/^[-*•]\s+/, '').replace(/^\*\*|\*\*$/g, ''));
      if (isUsefulParagraph(bullet)) current.bullets!.push(bullet);
      continue;
    }
    pushParagraph(line);
  }
  flushSection();
  return sections.slice(0, 10);
}

export function extractGrantPageMarkdown(markdown: string, grantName: string): { result?: GrantPageExtract; reason?: string } {
  const body = markdown.replace(/^Title:\s*.*\n+/m, '').trim();
  if (body.length < 80) return { reason: 'insufficient-source-content' };
  const sections = markdownToSections(body).filter((s) => s.heading.toLowerCase() !== grantName.toLowerCase());
  const words = totalWords(sections);
  if (words < 30) return { reason: 'insufficient-source-content' };
  return {
    result: {
      method: 'paragraphs',
      pageTitle: grantName,
      sections,
      wordCount: words,
      leadParagraph: sections[0]?.paragraphs[0],
    },
  };
}

export function extractGrantPageContent(html: string, grantName: string): { result?: GrantPageExtract; reason?: string } {
  const $ = load(html);
  const pageTitle = cleanText($('meta[property="og:title"]').attr('content') || $('title').first().text());
  if (ERROR_PAGE.test(pageTitle) || ERROR_PAGE.test(cleanText($('body').text().slice(0, 500)))) {
    return { reason: 'blocked-or-error-page' };
  }

  const jsonLd = collectJsonLdDescriptions(html);
  if (jsonLd.length) {
    const sections: GrantExtractedSection[] = jsonLd.slice(0, 3).map((desc, i) => ({
      heading: i === 0 ? 'Program overview' : `Details`,
      paragraphs: [desc],
    }));
    const words = totalWords(sections);
    if (words >= 25) {
      return {
        result: {
          method: 'jsonld',
          pageTitle,
          sections,
          wordCount: words,
          leadParagraph: jsonLd[0],
        },
      };
    }
  }

  const root = contentRoot($);
  $('script, style, nav, footer, form, noscript, svg, iframe, header').remove();

  let sections = sectionsFromHeadings($, root).filter((s) => s.heading.toLowerCase() !== grantName.toLowerCase());
  if (sections.length < 2 || totalWords(sections) < 50) {
    const paraSections = paragraphsOnly(root, $);
    if (totalWords(paraSections) > totalWords(sections)) {
      sections = paraSections;
    }
  }

  if (sections.length && totalWords(sections) >= 30) {
    const words = totalWords(sections);
    return {
      result: {
        method: sections.some((s) => s.heading !== 'Program overview') ? 'sections' : 'paragraphs',
        pageTitle,
        sections: sections.slice(0, 8),
        wordCount: words,
        leadParagraph: sections[0]?.paragraphs[0],
      },
    };
  }

  const meta = metaCandidates($).find((m) => wordCount(m) >= 20);
  if (meta) {
    const sections: GrantExtractedSection[] = [{ heading: 'Program overview', paragraphs: [meta] }];
    return {
      result: {
        method: 'meta',
        pageTitle,
        sections,
        wordCount: wordCount(meta),
        leadParagraph: meta,
      },
    };
  }

  return { reason: 'insufficient-source-content' };
}