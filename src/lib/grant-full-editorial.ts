import type { GrantProgram } from '@/types';
import { countStoredGrantWords, GRANT_DETAIL_MIN_WORDS } from '@/lib/grant-editorial';
import { isGrammarJunkParagraph, normalizeGrantGrammarLine } from '@/lib/grant-grammar';

type Section = NonNullable<GrantProgram['sections']>[number];

const TARGET_MIN_WORDS = 150;
const FILLER =
  /^(?:In fact,|We warmly welcome|It is worth noting that|We are thrilled to announce|Don't forget that|Please note that|As mentioned above,)\s+/i;

const JUNK_LINE =
  /^(?:!Image|blob:|You signed in with another tab|\[!\[|Press enter or click|Overview \[|Resources \[|Tools & Docs \[|Community Programs \[|Who’s Building \[|Connect \[)/i;

function polishLine(text: string): string {
  let line = normalizeGrantGrammarLine(text.trim());
  line = line.replace(FILLER, '');
  line = line.replace(/\*\*|__/g, '');
  line = line.replace(/\p{Extended_Pictographic}/gu, '').trim();
  line = line.replace(/^\/\/\/\s*/, '');
  line = line.replace(/^\.\s+/, '');
  line = line.replace(/\s+([\u2014\u2013])\s+/g, '. ');
  line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  line = line.replace(/\s{2,}/g, ' ');
  return line.trim();
}

function isJunk(line: string): boolean {
  const t = line.trim();
  if (!t || t.length < 12) return true;
  if (isGrammarJunkParagraph(t)) return true;
  if (JUNK_LINE.test(t)) return true;
  if ((t.match(/https?:\/\//g) || []).length >= 2) return true;
  if (t.length > 500 && (t.match(/\[/g) || []).length >= 4) return true;
  if (/^\[[^\]]+\]\(/.test(t) && t.length < 120) return true;
  return false;
}

function capitalizeLead(text: string): string {
  if (!text || /^[A-Z("(]/.test(text)) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function sentenceChunks(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && !isJunk(s));
}

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of lines) {
    const line = polishLine(raw);
    if (isJunk(line)) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function hasFaqFormat(lines: string[]): boolean {
  return lines.some((l) => l.includes('?') && l.includes('\n\n'));
}

function extractApplyParagraphs(lines: string[]): string[] {
  return lines.filter((l) =>
    /\b(?:apply|submit|application form|fill out|intake|proposal)\b/i.test(l),
  );
}

/** Full editorial restructure using only text already stored on the grant. */
export function polishGrantProgram(grant: GrantProgram): GrantProgram {
  const beforeWords = countStoredGrantWords(grant);
  const shellOnly = beforeWords < 80;
  if (shellOnly) return ensureEditorialShell(grant);

  const rawParagraphs: string[] = [];
  const rawBullets: string[] = [];
  let faqParagraphs: string[] = [];

  for (const section of grant.sections || []) {
  const isFaq = /faq/i.test(section.heading);
    if (isFaq) {
      faqParagraphs.push(...(section.paragraphs || []));
      continue;
    }
    rawParagraphs.push(...(section.paragraphs || []));
    rawBullets.push(...(section.bullets || []));
  }

  const paragraphs = uniqueLines(rawParagraphs);
  const bullets = uniqueLines(rawBullets);
  faqParagraphs = uniqueLines(faqParagraphs);

  let description = polishLine(grant.description || '');
  if (isJunk(description)) description = '';
  description = capitalizeLead(description);

  const descKey = description.toLowerCase();
  const overviewParas = paragraphs.filter((p) => p.toLowerCase() !== descKey);

  if (!description && overviewParas.length) {
    const joined = overviewParas.slice(0, 2).join(' ');
    const sentences = sentenceChunks(joined).slice(0, 3);
    description = capitalizeLead(sentences.join(' '));
  } else if (description) {
    const sentences = sentenceChunks(description);
    description = capitalizeLead(sentences.slice(0, 3).join(' '));
  }

  const sections: Section[] = [];

  const overviewBody = overviewParas.filter((p) => p.toLowerCase() !== description.toLowerCase());
  const overviewChunks: string[] = [];
  for (const p of overviewBody.slice(0, 8)) {
    for (const s of sentenceChunks(p)) overviewChunks.push(s);
  }
  const overviewUnique = uniqueLines(overviewChunks).slice(0, 6);

  if (overviewUnique.length) {
    sections.push({
      heading: 'Program overview',
      paragraphs: overviewUnique.slice(0, 4),
    });
    const extra = overviewUnique.slice(4);
    if (extra.length >= 2) {
      sections.push({
        heading: 'Program details',
        paragraphs: extra.slice(0, 4),
      });
    }
  }

  const fundingBullets = bullets.filter(
    (b) => b.length > 20 && b.length < 280 && !/\b(?:Overview|Resources|Connect|Tools)\b\[/.test(b),
  );

  if (fundingBullets.length >= 3) {
    sections.push({
      heading: 'What gets funded',
      paragraphs: [],
      bullets: fundingBullets.slice(0, 8),
    });
  } else if (fundingBullets.length > 0) {
    sections.push({
      heading: 'Focus areas',
      paragraphs: fundingBullets.slice(0, 3),
    });
  }

  const applyLines = extractApplyParagraphs([...overviewBody, ...uniqueLines(faqParagraphs)]);
  const applyParas = applyLines.length
    ? uniqueLines(applyLines).slice(0, 2)
    : [
        polishLine(
          'Review eligibility on the official program page linked above, then submit using the application channel the operator publishes.',
        ),
      ];

  sections.push({
    heading: 'How to apply',
    paragraphs: applyParas,
  });

  if (hasFaqFormat(faqParagraphs) || faqParagraphs.some((p) => p.includes('?'))) {
    sections.push({
      heading: 'Frequently asked questions',
      paragraphs: faqParagraphs.slice(0, 12),
    });
  }

  if (!sections.some((s) => /program overview/i.test(s.heading)) && description) {
    sections.unshift({
      heading: 'Program overview',
      paragraphs: [description],
    });
  }

  if (!sections.some((s) => /how to apply/i.test(s.heading))) {
    sections.push({
      heading: 'How to apply',
      paragraphs: [
        polishLine(
          'Review eligibility on the official program page linked above, then submit using the application channel the operator publishes.',
        ),
      ],
    });
  }

  // If polish condensed too aggressively, restore unique source paragraphs into Program details.
  let next: GrantProgram = {
    ...grant,
    description: description || capitalizeLead(overviewUnique[0] || grant.name),
    sections,
  };

  let afterWords = countStoredGrantWords(next);
  const floor = Math.max(GRANT_DETAIL_MIN_WORDS, Math.min(beforeWords, TARGET_MIN_WORDS));
  if (afterWords < floor && overviewBody.length > overviewUnique.length) {
    const restore = uniqueLines(overviewBody).slice(0, 12);
    const idx = next.sections!.findIndex((s) => /program details/i.test(s.heading));
    if (idx >= 0) {
      next.sections![idx].paragraphs = uniqueLines([
        ...(next.sections![idx].paragraphs || []),
        ...restore,
      ]).slice(0, 6);
    } else {
      next.sections!.splice(1, 0, {
        heading: 'Program details',
        paragraphs: restore.slice(0, 6),
      });
    }
    afterWords = countStoredGrantWords(next);
  }

  if (afterWords < GRANT_DETAIL_MIN_WORDS) {
    return grant;
  }

  return next;
}

/** Ensures standard sections exist without dropping stored prose. */
export function ensureEditorialShell(grant: GrantProgram): GrantProgram {
  const sections = [...(grant.sections || [])];
  const description = capitalizeLead(polishLine(grant.description || ''));

  if (!sections.some((s) => /program overview/i.test(s.heading))) {
    const first = sections.shift();
    sections.unshift({
      heading: 'Program overview',
      paragraphs: first?.paragraphs?.length ? first.paragraphs : description ? [description] : [],
      bullets: first?.bullets,
    });
  }

  if (!sections.some((s) => /how to apply/i.test(s.heading))) {
    sections.push({
      heading: 'How to apply',
      paragraphs: [
        polishLine(
          'Review eligibility on the official program page linked above, then submit using the application channel the operator publishes.',
        ),
      ],
    });
  }

  return { ...grant, description: description || grant.description, sections };
}