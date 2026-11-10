/**
 * Collect every description candidate a source page can offer, then compose
 * the published description from the best one that reaches the word minimum.
 *
 * Candidates, in order of trust:
 *  1. the organiser's own copy embedded in the page (Luma rich text);
 *  2. the page's structured event description (JSON-LD / official section);
 *  3. the page meta description;
 *  4. the page's readable body text, accepted only when it clearly describes
 *     the same event.
 */
import { load } from 'cheerio';
import { extractOfficialEventDescription, matchesEventIdentity } from '../official-event-description';
import type { EventFacts } from './event-description-compose';
import {
  extractLumaDescriptionsFromHtml,
  normalizeLumaDescriptionForStorage,
  pickBestLumaOrganizerDescription,
} from '../luma-page-description';

export type DescriptionMethod = 'event-jsonld' | 'official-section' | 'official-meta';

export type DescriptionCandidate = {
  copy: string;
  method: DescriptionMethod;
  pageTitle: string;
};

const clean = (value?: unknown) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

export function readablePageText(html: string): string {
  const $ = load(html);
  $('script, style, nav, footer, form, button, noscript, svg, iframe, [hidden], [aria-hidden="true"]').remove();
  $('br').replaceWith('\n');
  $('h1,h2,h3,h4,h5,h6').each((_, element) => { $(element).replaceWith(`\n\n${$(element).text().trim()}\n\n`); });
  $('li').each((_, element) => { $(element).prepend('\n• ').append('\n'); });
  $('p,div,section,ul,ol,blockquote').append('\n\n');
  return $
    .root()
    .text()
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function pageDescriptionCandidates(
  html: string,
  event: { name: string; startDate?: string },
  options: { allowReadableWithoutIdentity?: boolean } = {},
): DescriptionCandidate[] {
  const candidates: DescriptionCandidate[] = [];
  const $ = load(html);
  const pageTitle =
    clean($('meta[property="og:title"]').attr('content')) || clean($('title').text()) || event.name;

  const organizer = pickBestLumaOrganizerDescription(extractLumaDescriptionsFromHtml(html));
  if (organizer) {
    candidates.push({
      copy: normalizeLumaDescriptionForStorage(organizer),
      method: 'official-section',
      pageTitle,
    });
  }

  const official = extractOfficialEventDescription(html, {
    name: event.name,
    startDate: event.startDate || '',
  });
  if (official.result?.description) {
    candidates.push({
      copy: official.result.description.trim(),
      method: official.result.method,
      pageTitle: official.result.pageTitle || pageTitle,
    });
  }

  const meta =
    clean($('meta[property="og:description"]').attr('content')) ||
    clean($('meta[name="description"]').attr('content'));
  if (meta) candidates.push({ copy: meta, method: 'official-meta', pageTitle });

  const readable = readablePageText(html);
  if (readable && (matchesEventIdentity(event.name, readable) || options.allowReadableWithoutIdentity)) {
    candidates.push({ copy: readable, method: 'official-section', pageTitle });
  }

  return candidates.filter((candidate) => candidate.copy.length >= 80);
}


const cleanValue = (value?: unknown) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

function hostDisplayName(host: Record<string, unknown>): string {
  const full = `${cleanValue(host.first_name)} ${cleanValue(host.last_name)}`.trim();
  const name = cleanValue(host.name);
  if (name && full && name.toLowerCase() !== full.toLowerCase()) return name;
  return name || full;
}

/** Organiser-authored facts published in a Luma event page payload. */
export function lumaPageFacts(html: string, event: { name?: string; startDate?: string }): { facts: EventFacts; extras: string[] } {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  let data: Record<string, unknown> = {};
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      const props = parsed?.props?.pageProps || {};
      const initial = props.initialData || {};
      data = (initial.data || initial.event || initial) as Record<string, unknown>;
    } catch {
      data = {};
    }
  }
  const ev = (data.event || {}) as Record<string, unknown>;
  const geo = (ev.geo_address_info || {}) as Record<string, unknown>;
  const hosts = Array.isArray(data.hosts) ? (data.hosts as Record<string, unknown>[]) : [];
  const calendar = (data.calendar || {}) as Record<string, unknown>;
  const ticketInfo = (data.ticket_info || {}) as Record<string, unknown>;
  const ticketPrice = (ticketInfo.price || {}) as Record<string, unknown>;

  let price = '';
  if (ticketInfo.is_free === true) price = 'Free';
  else if (typeof ticketPrice.cents === 'number' && ticketPrice.cents > 0) {
    const currency = cleanValue(ticketPrice.currency).toUpperCase() || 'USD';
    price = `${currency} ${(ticketPrice.cents / 100).toLocaleString('en-US')}`;
  }

  const hostBios = hosts
    .map((host) => {
      const bio = cleanValue(host.bio_short);
      const name = hostDisplayName(host);
      return bio ? `${name} — ${bio}` : '';
    })
    .filter(Boolean)
    .slice(0, 4);

  const ticketTypes = (Array.isArray(data.ticket_types) ? (data.ticket_types as Record<string, unknown>[]) : [])
    .filter((ticket) => ticket.is_hidden !== true && ticket.is_disabled !== true)
    .map((ticket) => {
      const name = cleanValue(ticket.name) || 'Standard';
      const cents = ticket.cents;
      if (cents === 0) return `${name} (free)`;
      if (typeof cents === 'number' && cents > 0) {
        const currency = cleanValue(ticket.currency).toUpperCase() || 'USD';
        return `${name} (${currency} ${(cents / 100).toLocaleString('en-US')})`;
      }
      return name;
    })
    .slice(0, 6);

  const organiserAbout = cleanValue(calendar.description_short);
  const extras: string[] = [];
  if (hostBios.length) extras.push(`## Hosts\n\n${hostBios.join('\n')}`);
  if (organiserAbout) extras.push(`About the organiser: ${organiserAbout}`);
  if (ticketTypes.length) extras.push(`## Tickets\n\n${ticketTypes.join('\n')}`);

  return {
    extras,
    facts: {
      startsAt: cleanValue(ev.start_at) || event.startDate,
      endsAt: cleanValue(ev.end_at),
      timezone: cleanValue(ev.timezone),
      online: cleanValue(ev.location_type).toLowerCase() === 'online',
      venue: cleanValue(geo.address),
      address: cleanValue(geo.full_address),
      city: cleanValue(geo.city),
      country: cleanValue(geo.country),
      neighbourhood: cleanValue(geo.sublocality),
      hosts: hosts.map(hostDisplayName).filter(Boolean).slice(0, 5),
      hostBios,
      ticketTypes,
      organiserAbout,
      organizer: calendar.is_personal === false ? cleanValue(calendar.name) : undefined,
      price,
      approvalRequired: ticketInfo.require_approval === true,
      registration: cleanValue(data.registration_availability),
    },
  };
}
