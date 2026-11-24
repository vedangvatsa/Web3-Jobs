import { stripThirdPartyCommunityPromo } from '@/lib/community-link-sanitizer';
import { isGrammarJunkParagraph, normalizeGrantGrammarLine } from '@/lib/grant-grammar';

export type GrantSectionShape = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

function sanitizeGrantCopy(text: string): string {
  return normalizeGrantGrammarLine(stripThirdPartyCommunityPromo(text));
}

const JUNK_PARAGRAPH =
  /press enter or click to view image|published time:|blob:http|!\[[^\]]*\]\(blob:/i;
/** Scraped Google Forms / Airtable anti-abuse lines and bare application fields. */
const FORM_SCRAPE_JUNK =
  /do not submit passwords|report malicious form|never submit passwords/i;
const FORM_FIELD_ONLY =
  /^(?:what (?:does|is)|tell us about|share any additional links|links to current pitch deck|try to split this up into)/i;
const NUMERIC_STEP_HEADING = /^\d{1,3}$/;
const STAT_HEADING = /^\d{1,3}%$/;

/** Normalize scrape artifacts before grant detail render. */
export function normalizeGrantSections<T extends GrantSectionShape>(sections: T[]): T[] {
  const out: T[] = [];

  for (const section of sections) {
    const heading = section.heading
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/^[?\s❓]+/, '')
      .trim();
    const paragraphs = expandStepParagraphs(
      (section.paragraphs || [])
        .filter(
          (p) =>
            !JUNK_PARAGRAPH.test(p) &&
            !FORM_SCRAPE_JUNK.test(p) &&
            !FORM_FIELD_ONLY.test(p.trim()) &&
            !isGrammarJunkParagraph(p),
        )
        .map(stripMarkdownBold)
        .map(sanitizeGrantCopy)
        .map((p) => p.replace(/^(.+\?)\s+([A-Z])/u, '$1\n\n$2')),
    );
    const bullets = section.bullets?.map((b) => sanitizeGrantCopy(stripMarkdownBold(b)));

    if (NUMERIC_STEP_HEADING.test(heading) && out.length > 0) {
      const prev = out[out.length - 1]!;
      prev.paragraphs.push(`${heading}. ${paragraphs.join(' ')}`.trim());
      continue;
    }

    if (STAT_HEADING.test(heading)) {
      const merged = `${heading} — ${paragraphs.join(' ')}`.trim();
      if (out.length > 0) {
        out[out.length - 1]!.paragraphs.push(merged);
      } else {
        out.push({ ...section, heading: 'Program highlights', paragraphs: [merged], bullets });
      }
      continue;
    }

    if (!paragraphs.length && !bullets?.length) continue;

    out.push({
      ...section,
      heading,
      paragraphs,
      bullets: bullets?.length ? bullets : undefined,
    });
  }

  return out;
}

function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/__/g, '').trim();
}

/** Split Medium-style numbered step runs into separate lines for list detection. */
function expandStepParagraphs(paragraphs: string[]): string[] {
  const out: string[] = [];
  for (const paragraph of paragraphs) {
    const chunks = paragraph.split(/(?=\d+\.\s)/).map((c) => c.trim()).filter(Boolean);
    if (chunks.length > 1) {
      out.push(...chunks);
    } else {
      out.push(paragraph);
    }
  }
  return out.filter((p) => p.length > 0 && !/^\d{1,4}[+%]?$/.test(p.trim()));
}