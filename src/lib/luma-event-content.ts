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

/** Build detail-page editorial from `event.description` only (Luma organiser copy in JSON). */
export function buildEditorialFromOrganizerDescription(event: Web3Event): EventEditorialArticle {
  const resolvedPlace = formatEventLocation(event);
  const locationStr = resolvedPlace === 'Virtual / TBA' ? 'online' : `in ${resolvedPlace}`;
  const formattedDates = formatEventDate(event.startDate, event.endDate);

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

function isHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 60 || trimmed.length < 2) return false;
  if (/^[-*•·▪–—#]/.test(trimmed)) return false;
  if (/^[A-Za-z0-9\s&/'°!?,.-]{2,50}:$/.test(trimmed)) return true;
  if (/^(?:agenda|schedule|speakers|hosts|co-hosts?|partners|community partners|venue|location|rules|about the event)$/i.test(trimmed)) return true;
  return false;
}

function parseOrganizerDescriptionSections(ownDescription: string): { lead: string; sections: Array<{ heading: string; content: string[] }> } {
  const lines = ownDescription.split('\n');
  const normalizedBlocks: string[] = [];
  let currentBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (isHeaderLine(trimmed) && currentBlockLines.length > 0) {
      normalizedBlocks.push(currentBlockLines.join('\n').trim());
      currentBlockLines = [line];
    } else {
      if (trimmed === '') {
        if (currentBlockLines.length > 0) {
          normalizedBlocks.push(currentBlockLines.join('\n').trim());
          currentBlockLines = [];
        }
      } else {
        currentBlockLines.push(line);
      }
    }
  }
  if (currentBlockLines.length > 0) {
    normalizedBlocks.push(currentBlockLines.join('\n').trim());
  }

  const rawParagraphs = normalizedBlocks.filter((p) => p.length > 0);
  if (rawParagraphs.length === 0) return { lead: '', sections: [] };

  const lead = rawParagraphs[0];
  const remaining = rawParagraphs.slice(1);

  const sections: Array<{ heading: string; content: string[] }> = [];
  let currentHeading = 'About the event';
  let currentContent: string[] = [];

  for (const block of remaining) {
    const blockLines = block.split('\n');
    const firstLine = blockLines[0].trim();
    if (isHeaderLine(firstLine)) {
      if (currentContent.length > 0) {
        sections.push({ heading: currentHeading, content: currentContent });
        currentContent = [];
      }
      currentHeading = firstLine.replace(/:$/, '').trim();
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

  const { lead: firstSummaryParagraph, sections } = parseOrganizerDescriptionSections(ownDescription);

  const firstSummarySentence = firstSummaryParagraph
    ? firstSummaryParagraph.endsWith('.')
      ? firstSummaryParagraph
      : `${firstSummaryParagraph}.`
    : '';

  const summaryLead = firstSummarySentence
    ? `${event.name} on ${formattedDates} ${locationStr}. ${firstSummarySentence}`
    : `${event.name} on ${formattedDates} ${locationStr}.`;

  return {
    summaryLead,
    sections,
  };
}
