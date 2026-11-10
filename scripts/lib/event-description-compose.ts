/**
 * Compose an event description from source-backed material only.
 *
 * Rules:
 * - the organiser's own copy leads the description;
 * - any missing length is filled with verified event facts taken from the same
 *   source page (date, format, venue, hosts, organiser, tickets, registration);
 * - nothing is invented, padded or repeated to hit a word count.
 */
import { formatEventDate } from '../../src/lib/events';

export type EventFacts = {
  startsAt?: string;
  endsAt?: string;
  timezone?: string;
  online?: boolean;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  neighbourhood?: string;
  hosts?: string[];
  hostBios?: string[];
  organizer?: string;
  organiserAbout?: string;
  ticketTypes?: string[];
  price?: string;
  registration?: string;
  approvalRequired?: boolean;
  sourceUrl?: string;
};

export const MIN_DESCRIPTION_WORDS = 100;

export function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function clean(value?: string): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

/** Factual detail lines sourced from the event page. */
export function buildFactLines(facts: EventFacts): string[] {
  const lines: string[] = [];

  if (facts.startsAt) {
    const date = formatEventDate(facts.startsAt, facts.endsAt, facts.timezone);
    const time = new Date(facts.startsAt);
    const clock = Number.isFinite(time.getTime())
      ? time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: facts.timezone || 'UTC' })
      : '';
    lines.push(`Date: ${date}${clock ? `, ${clock}` : ''}${facts.timezone ? ` (${facts.timezone})` : ''}`);
  }
  if (facts.online) {
    lines.push('Format: online event');
  } else {
    const place = clean(facts.venue) || clean(facts.address) || clean([facts.city, facts.country].filter(Boolean).join(', '));
    if (place) lines.push(`Venue: ${place}`);
    else if (facts.city || facts.country) lines.push(`Location: ${clean([facts.city, facts.country].filter(Boolean).join(', '))}`);
  }
  if (facts.neighbourhood) lines.push(`Area: ${facts.neighbourhood}`);
  if (facts.hosts?.length) lines.push(`Hosts: ${facts.hosts.join(', ')}`);
  if (facts.hostBios?.length) lines.push(`Host background: ${facts.hostBios.join('; ')}`);
  if (facts.organizer) lines.push(`Organised by: ${facts.organizer}`);
  if (facts.organiserAbout) lines.push(`About the organiser: ${facts.organiserAbout}`);
  if (facts.ticketTypes?.length) lines.push(`Ticket types: ${facts.ticketTypes.join(', ')}`);
  if (facts.price) lines.push(`Tickets: ${facts.price}`);
  if (facts.approvalRequired) lines.push('Registration: requires approval from the organiser');
  else if (facts.registration) lines.push(`Registration: ${facts.registration}`);
  if (facts.sourceUrl) lines.push(`Event page: ${facts.sourceUrl}`);
  return lines;
}

/**
 * Returns a description of at least MIN_DESCRIPTION_WORDS when the source
 * material allows it, otherwise the best available factual description.
 */
export function composeEventDescription(
  organizerCopy: string,
  facts: EventFacts,
  extraParagraphs: string[] = [],
): { description: string; words: number; reachedMinimum: boolean } {
  const paragraphs: string[] = [];
  const body = clean(organizerCopy);
  if (body) paragraphs.push(body);
  for (const paragraph of extraParagraphs) {
    const text = clean(paragraph);
    if (text) paragraphs.push(text);
  }

  const factLines = buildFactLines(facts);
  let description = paragraphs.join('\n\n');
  let words = countWords(description);

  if (words < MIN_DESCRIPTION_WORDS && factLines.length) {
    const details = `## Event details\n\n${factLines.join('\n')}`;
    description = paragraphs.length ? `${description}\n\n${details}` : details;
    words = countWords(description);
  }

  return { description, words, reachedMinimum: words >= MIN_DESCRIPTION_WORDS };
}
