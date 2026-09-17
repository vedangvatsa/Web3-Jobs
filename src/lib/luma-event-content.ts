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

  const rawParagraphs = ownDescription
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const firstSummarySentence =
    rawParagraphs.length > 0
      ? rawParagraphs[0].endsWith('.')
        ? rawParagraphs[0]
        : `${rawParagraphs[0]}.`
      : '';

  const summaryLead = firstSummarySentence
    ? `${event.name} on ${formattedDates} ${locationStr}. ${firstSummarySentence}`
    : `${event.name} on ${formattedDates} ${locationStr}.`;

  if (rawParagraphs.length <= 1) {
    return { summaryLead, sections: [] };
  }

  return {
    summaryLead,
    sections: [
      {
        heading: 'About the event',
        content: rawParagraphs.slice(1),
      },
    ],
  };
}
