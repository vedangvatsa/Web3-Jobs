import type { EventEditorialArticle, Web3Event } from '@/lib/events';
import { formatEventDate, formatEventLocation } from '@/lib/events';
import { isThinEventListingDescription } from '@/lib/event-editorial-facts';
import { cleanPublishText } from '@/lib/noslop';

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
  /^(?:agenda|schedule|itinerary|program(?:me)?|speakers|hosts|co-hosts?|partners|community partners|venue|location|rules|about(?: the event| us| [\p{L}\p{N} &'’.-]{2,45})?|what to expect|who should attend|event (?:description|details|info)|hike info|how to get (?:here|there)|registration|tickets|please note|important (?:notes|information)|the challenge|disclaimer|inspiration tracks(?:\s+for\s+solutions)?)$/iu;

function headingText(line: string): string {
  return line.trim().replace(/^#{1,6}\s+/, '').replace(/^\*\*(.+)\*\*$/, '$1').replace(/[:.]$/, '').trim();
}

function isHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length <= 160 && /^#{1,6}\s+\S/.test(trimmed)) return true;
  if (!trimmed || trimmed.length > 60 || trimmed.length < 2) return false;
  if (/^[-*•·▪–—]\s+/.test(trimmed)) return false;
  // A trailing colon alone does not make a heading: agenda sub-labels like
  // "Participants:", "Speaker:" or "Time:" must stay in the text flow,
  // otherwise every agenda slot fragments into its own H2 section.
  const headerLabel = headingText(trimmed);
  return SECTION_LABELS.test(headerLabel);
}

/** Luma exports use single newlines between paragraphs; blank lines often separate list items only. */
function normalizeDescriptionParagraphBlocks(ownDescription: string): string[] {
  const lines = ownDescription.split('\n');
  const trimmedLines = lines.filter(line => line.trim());
  if (trimmedLines.length <= 1) return trimmedLines;

  const blocks: string[] = [];
  let bulletRun: string[] = [];
  let codeRun: string[] | null = null;

  const flushBullets = () => {
    if (bulletRun.length > 0) {
      blocks.push(bulletRun.join('\n'));
      bulletRun = [];
    }
  };

  for (const line of trimmedLines) {
    if (/^\s*```/.test(line)) {
      flushBullets();
      if (codeRun) { blocks.push([...codeRun, line].join('\n')); codeRun = null; }
      else codeRun = [line];
      continue;
    }
    if (codeRun) { codeRun.push(line); continue; }
    if (/^\s*(?:[-*•·▪–—]|\d+[.)])\s+/.test(line)) {
      bulletRun.push(line);
      continue;
    }
    if (bulletRun.length && /^\s{2,}\S/.test(line)) {
      bulletRun.push(line);
      continue;
    }
    flushBullets();
    blocks.push(line.trim());
  }
  if (codeRun) blocks.push(codeRun.join('\n'));
  flushBullets();
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

  const rawDescription = cleanPublishText((event.description || '').trim());
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

  const summaryLead = factsLine
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

  return {
    summaryLead,
    sections,
  };
}
