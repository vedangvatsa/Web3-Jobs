import type { EventEditorialArticle, Web3Event } from '@/lib/events';
import { formatEventDate, formatEventLocation } from '@/lib/events';
import { isThinEventListingDescription } from '@/lib/event-editorial-facts';
import { cleanPublishText } from '@/lib/noslop';
import { polishEventDescriptionLinks } from '@/lib/event-description-links';

const LUMA_HOST = /^(?:www\.)?(?:luma\.com|lu\.ma)$/i;

const LUMA_SOURCE_PREFIXES = ['luma-crypto', 'luma-india', 'kbw-luma', 'ibw-luma'] as const;

function hostFromUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  try {
    return new URL(url.trim()).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function isLumaHost(url?: string | null): boolean {
  const host = hostFromUrl(url);
  return host ? LUMA_HOST.test(host) : false;
}

/** Event is registered on Luma — editorial must come from stored organiser copy, not generated guides. */
export function isLumaListedEvent(
  event: Pick<Web3Event, 'source' | 'url' | 'registrationUrl' | 'website'>,
): boolean {
  const source = (event.source || '').toLowerCase();
  if (source === 'luma' || source === 'luma-trusted' || source.startsWith('luma-')) return true;
  if (LUMA_SOURCE_PREFIXES.some((prefix) => source.startsWith(prefix))) return true;
  if (isLumaHost(event.registrationUrl) || isLumaHost(event.website) || isLumaHost(event.url)) {
    return true;
  }
  return false;
}

const SECTION_LABELS =
  /^(?:agenda|schedule|itinerary|program(?:me)?|speakers|hosts|co-hosts?|partners|community partners|media partners?|sponsors?|venue|location|rules|about(?: the event| us| the hosts| [\p{L}\p{N} &'’.-]{2,45})?|what to expect|who should attend|who it'?s for|who is this for|how we network|event (?:description|details|info|highlights)|highlights|details|format|event format|(?:the )?prizes?|participants?|panels?|the panels?|mission|our mission|focus areas?|previous speakers|past activations|past events|hike info|how to get (?:here|there)|registration|tickets|please note|important (?:notes|information)|the challenge|disclaimer|track [a-z0-9]+|inspiration tracks(?:\s+for\s+solutions)?)$/iu;

function headingText(line: string): string {
  return line.trim().replace(/^#{1,6}\s+/, '').replace(/^\*\*(.+)\*\*$/, '$1').replace(/[:.]$/, '').trim();
}

function isHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length <= 160 && /^#{1,6}\s+\S/.test(trimmed)) return true;
  if (!trimmed || trimmed.length > 60 || trimmed.length < 2) return false;
  if (/^[-*•·▪–—]\s+/.test(trimmed)) return false;
  // A trailing colon alone does not make a heading: agenda sub-labels like
  // "Speaker:" or "Time:" must stay in the text flow, otherwise every agenda
  // slot fragments into its own H2 section. A trailing question mark and any
  // inline URLs are ignored for matching only ("About X (https://...)" still
  // displays as written before display cleanup).
  const headerLabel = headingText(trimmed)
    .replace(/\?$/, '')
    .replace(/\(\s*https?:\/\/[^\s)]+\s*\)/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return SECTION_LABELS.test(headerLabel);
}

/** Luma exports use single newlines between paragraphs; blank lines often separate list items only. */
function normalizeDescriptionParagraphBlocks(ownDescription: string): string[] {
  const lines = ownDescription.split('\n');
  const trimmedLines = lines.filter(line => line.trim());
  if (trimmedLines.length <= 1) return trimmedLines;

  const blocks: string[] = [];
  let bulletRun: string[] = [];
  let numberedRun: string[] = [];
  let codeRun: string[] | null = null;

  const flushBullets = () => {
    if (bulletRun.length > 0) {
      blocks.push(bulletRun.join('\n'));
      bulletRun = [];
    }
  };

  const flushNumbered = () => {
    if (numberedRun.length >= 2) {
      blocks.push(numberedRun.map((entry) => entry.replace(/^(\d{1,2})\s*[-–]\s+/, '$1. ')).join('\n'));
    } else {
      blocks.push(...numberedRun);
    }
    numberedRun = [];
  };

  for (const rawLine of trimmedLines) {
    // Organizers sometimes style full sentences as headings for emphasis.
    // A sentence-long "heading" renders as an oversized H2, so demote it to
    // body copy while keeping the text.
    const line = /^\s*#{1,6}\s+\S/.test(rawLine) && rawLine.trim().length > 100
      ? rawLine.replace(/^\s*#{1,6}\s+/, '')
      : rawLine;
    if (/^\s*```/.test(line)) {
      flushBullets();
      if (codeRun) { blocks.push([...codeRun, line].join('\n')); codeRun = null; }
      else codeRun = [line];
      continue;
    }
    if (codeRun) { codeRun.push(line); continue; }
    // "1 - Item" style numbered lines only form a list when 2+ run together,
    // so quantities ("10 - 20 attendees"), years and times stay body copy.
    const dashNumbered = /^\s*(\d{1,2})\s*[-–]\s+(\S.*)$/.exec(line);
    if (/^\s*\d{1,2}\s*[-–]\s+\S/.test(line) && !/^\s*\d{1,2}:\d{2}/.test(line) && !/^\s*\d{3,}/.test(line)) {
      flushBullets();
      numberedRun.push(line.trim());
      continue;
    }
    flushNumbered();
    if (/^\s*(?:[-*•·▪–—]|\d+[.)])\s+/.test(line)) {
      bulletRun.push(line);
      continue;
    }
    if (bulletRun.length && /^\s{2,}\S/.test(line)) {
      bulletRun.push(line);
      continue;
    }
    flushBullets();
    flushNumbered();
    blocks.push(line.trim());
  }
  if (codeRun) blocks.push(codeRun.join('\n'));
  flushBullets();
  flushNumbered();
  return blocks;
}

function parseOrganizerDescriptionSections(ownDescription: string): {
  lead: string;
  sections: Array<{ heading: string; content: string[] }>;
} {
  const rawParagraphs = normalizeDescriptionParagraphBlocks(ownDescription);
  if (rawParagraphs.length === 0) return { lead: '', sections: [] };

  const startsWithHeading = isHeaderLine(rawParagraphs[0]);
  const lead = startsWithHeading ? '' : rawParagraphs[0];
  const remaining = startsWithHeading ? rawParagraphs : rawParagraphs.slice(1);

  const sections: Array<{ heading: string; content: string[] }> = [];
  let currentHeading = 'About the event';
  let currentContent: string[] = [];

  for (const block of remaining) {
    const blockLines = block.split('\n');
    const firstLine = blockLines[0].trim();
    if (isHeaderLine(firstLine) && blockLines.length === 1) {
      if (currentContent.length > 0) {
        sections.push({ heading: currentHeading, content: currentContent });
        currentContent = [];
      }
      currentHeading = headingText(firstLine);
    } else if (isHeaderLine(firstLine) && blockLines.length > 1) {
      if (currentContent.length > 0) {
        sections.push({ heading: currentHeading, content: currentContent });
        currentContent = [];
      }
      currentHeading = headingText(firstLine);
      const rest = blockLines.slice(1).join('\n').trim();
      if (rest) currentContent.push(rest);
    } else {
      currentContent.push(block);
    }
  }

  if (currentContent.length > 0) {
    sections.push({ heading: currentHeading, content: currentContent });
  }

  return { lead, sections };
}

/** Build detail-page editorial from `event.description` only (Luma organiser copy in JSON). */
export function buildEditorialFromOrganizerDescription(event: Web3Event): EventEditorialArticle {
  const resolvedPlace = formatEventLocation(event);
  const online = event.attendanceMode === 'online' || /^(?:online|virtual)(?:\b|\s*\/)/i.test(event.location || '') && event.location !== 'Virtual / TBA';
  const locationStr = online ? 'online' : resolvedPlace === 'Virtual / TBA' ? '(venue to be announced)' : `in ${resolvedPlace}`;
  const formattedDates = formatEventDate(event.startDate, event.endDate, event.timezone);

  const rawDescription = polishEventDescriptionLinks(
    cleanPublishText((event.description || '').trim()),
  );
  const ownDescription =
    rawDescription && !isThinEventListingDescription(rawDescription) ? rawDescription : '';

  // Verifiable record facts only: hosts, price, approval, timezone.
  const hostNames = Array.isArray(event.hosts)
    ? event.hosts.filter((h): h is string => typeof h === 'string' && !!h.trim()).slice(0, 4)
    : [];
  const organizerName = event.organizer && event.organizer.name ? event.organizer.name : '';
  const factsLine = [
    hostNames.length ? `Hosted by ${hostNames.join(', ')}` : organizerName ? `Hosted by ${organizerName}` : '',
    (event.price || '').trim() ? `Tickets ${(event.price || '').trim()}` : '',
    event.approvalRequired ? 'approval required to attend' : '',
    event.timezone ? `(${event.timezone} time)` : '',
  ]
    .filter(Boolean)
    .join('. ');

  if (!ownDescription) {
    return {
      summaryLead: factsLine
        ? `${event.name} on ${formattedDates} ${locationStr}. ${factsLine}.`
        : `${event.name} on ${formattedDates} ${locationStr}.`,
      sections: factsLine ? [{ heading: 'Event facts', content: [`${factsLine}.`] }] : [],
    };
  }

  const { lead: firstSummaryParagraph, sections: parsedSections } =
    parseOrganizerDescriptionSections(ownDescription);

  const summaryLead = event.eventStatus === 'EventPostponed'
    ? `${event.name} has been postponed. New dates have not been announced.`
    : firstSummaryParagraph
      ? ''
      : factsLine
    ? `${event.name} on ${formattedDates} ${locationStr}. ${factsLine}.`
    : `${event.name} on ${formattedDates} ${locationStr}.`;

  let sections = parsedSections;
  if (firstSummaryParagraph) {
    if (sections.length === 0) {
      sections = [{ heading: 'About the event', content: [firstSummaryParagraph] }];
    } else {
      // Last matching index: sections[0] is often the implicit lead-in bucket
      // carrying the same default heading, so a first-match search would stop
      // there and leave the organizer's own About section duplicated.
      let aboutIndex = -1;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        if (sections[i].heading.toLowerCase() === 'about the event') {
          aboutIndex = i;
          break;
        }
      }
      if (aboutIndex >= 0) {
        // Fold the implicit lead-in bucket (sections[0] when it carries the
        // default heading) into the organizer's own About section, so the
        // heading never renders twice back-to-back.
        const leadIn =
          aboutIndex > 0 && sections[0].heading.toLowerCase() === 'about the event'
            ? sections[0].content
            : [];
        sections = sections
          .map((section, index) =>
            index === aboutIndex
              ? { ...section, content: [firstSummaryParagraph, ...leadIn, ...section.content] }
              : section,
          )
          .filter((_, index) => !(index === 0 && aboutIndex > 0 && leadIn.length > 0));
      } else {
        sections = [{ heading: 'About the event', content: [firstSummaryParagraph] }, ...sections];
      }
    }
  }

  // Strip URLs out of headings first, so repeats that differ only by a link
  // ("Schedule (https://x)" vs "Schedule") fold together below.
  sections = stripHeadingUrls(sections);

  // Fold repeated headings (multi-day agendas reusing "Agenda" / "What to
  // expect") into their first occurrence, preserving content order.
  const seenHeadings = new Map<string, number>();
  const folded: typeof sections = [];
  for (const section of sections) {
    const key = section.heading.toLowerCase().trim();
    const at = seenHeadings.get(key);
    if (at === undefined) {
      seenHeadings.set(key, folded.length);
      folded.push(section);
    } else {
      folded[at] = { ...folded[at], content: [...folded[at].content, ...section.content] };
    }
  }
  sections = folded;
  sections = finalizeSectionContent(sections);

  return {
    summaryLead,
    sections,
  };
}

/** Abbreviations and initials that must not end a sentence when splitting. */
const SENTENCE_GUARD = /(?:\b(?:e\.g|i\.e|Mr|Mrs|Ms|Dr|St|vs|etc|Fig|approx|U\.S|U\.K|D\.C|a\.m|p\.m)|\b[A-Z]\.|^\d+\.)$/i;

/** Split a very long paragraph into readable chunks at sentence boundaries. */
function splitLongParagraph(block: string, max = 700): string[] {
  if (block.length <= max || block.includes('\n')) return [block];
  const flat = block.replace(/\s+/g, ' ');
  const raw = flat.match(/[^.!?]+[.!?]+["'”)\]]*\s*/g) || [flat];
  const sentences: string[] = [];
  for (const sentence of raw) {
    const last = sentences[sentences.length - 1];
    if (last && SENTENCE_GUARD.test(last.trimEnd())) sentences[sentences.length - 1] = last + sentence;
    else sentences.push(sentence);
  }
  if (sentences.length < 2) return [block];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > max) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 1 ? chunks : [block];
}

const HEADING_URL = /https?:\/\/[^\s<>"')\]]+/gi;

/** Headings should name the topic, not carry raw URLs: move links out of
 * headings into link lines under the heading so no source link is lost. */
function stripHeadingUrls(
  sections: Array<{ heading: string; content: string[] }>,
): Array<{ heading: string; content: string[] }> {
  const cleaned: Array<{ heading: string; content: string[] }> = [];
  for (const section of sections) {
    const urls = [...new Set(section.heading.match(HEADING_URL) || [])];
    const heading = section.heading
      .replace(/\(\s*https?:\/\/[^\s<>"')\]]+\s*\)/gi, '')
      .replace(HEADING_URL, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/[\s(\[{\-–—:;,.]+$/, '')
      .trim();
    if (!heading) {
      // A heading that was only a URL becomes body copy under the previous section.
      const linkLines = [...urls, ...section.content];
      if (cleaned.length > 0) cleaned[cleaned.length - 1].content.push(...linkLines);
      else cleaned.push({ heading: 'About the event', content: linkLines });
      continue;
    }
    let content = section.content;
    if (urls.length) {
      // A paragraph restating the heading ("Name (url) is ...") would repeat
      // the extracted link, so drop the parenthesized copy and keep the name.
      const restated = new RegExp(
        `^(.+?)\\s*\\(\\s*(${urls.map(escapeRegExp).join('|')})\\s*\\)`,
        'i',
      );
      content = content.map((block) => {
        const match = restated.exec(block);
        if (match && heading.toLowerCase().includes(match[1].toLowerCase())) {
          return block.replace(restated, '$1');
        }
        return block;
      });
      content = [...urls, ...content];
    }
    cleaned.push({ heading, content });
  }
  return cleaned;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Split over-long paragraphs and drop exact-duplicate blocks in a section. */
function finalizeSectionContent(
  sections: Array<{ heading: string; content: string[] }>,
): Array<{ heading: string; content: string[] }> {
  return sections.map((section) => ({
    ...section,
    content: section.content
      .filter((block, index, all) => {
        // An exact repeat inside one section is pasted duplication, not emphasis.
        if (block.trim().length <= 60) return true;
        return all.findIndex((other) => other.trim() === block.trim()) === index;
      })
      .flatMap((block) => splitLongParagraph(block)),
  }));
}
