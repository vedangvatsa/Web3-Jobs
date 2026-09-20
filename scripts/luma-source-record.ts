import type { EventTicketOffer, Web3Event } from '../src/lib/events';
import { normalizeCountry } from '../src/lib/events';
import { hasDetailedStreetAddress } from '../src/lib/event-address';
import { proseMirrorToFormattedText } from './luma-page-description';

export type LumaSnapshot = {
  url: string;
  fetchedAt: string;
  method: 'apify' | 'luma-page' | 'luma-api';
  apifyRunId?: string;
  data: Record<string, unknown>;
};

export function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function canonicalLumaUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!/^(?:www\.)?(?:lu\.ma|luma\.com)$/i.test(url.hostname) || url.pathname === '/') return null;
    return `https://luma.com${url.pathname.replace(/\/$/, '')}`;
  } catch {
    return null;
  }
}

function httpUrl(value: unknown): string | undefined {
  const raw = text(value);
  try {
    const url = new URL(raw);
    return /^https?:$/.test(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

function date(value: unknown): string | undefined {
  const raw = text(value);
  return /^\d{4}-\d{2}-\d{2}(?:T.*(?:Z|[+-]\d{2}:\d{2}))?$/.test(raw) && Number.isFinite(Date.parse(raw)) ? raw : undefined;
}

function sourceData(data: Record<string, unknown>): Record<string, unknown> {
  if (object(data.event).api_id) return data;
  if (!data.eventId || data.detailsFetched !== true) throw new Error('Apify result is missing full event details');
  const location = object(data.location);
  const ticketing = object(data.ticketing);
  return {
    description: data.description,
    event: {
      api_id: data.eventId, name: data.name, start_at: data.startAt, end_at: data.endAt,
      timezone: data.timezone, cover_url: data.coverUrl,
      location_type: location.isVirtual === true ? 'online' : data.eventType === 'in_person' ? 'offline' : undefined,
      geo_address_info: {
        city: location.city, country: location.country, region: location.region,
        address: location.name, full_address: location.address, sublocality: location.neighborhood,
      },
      coordinate: { latitude: location.latitude, longitude: location.longitude },
    },
    hosts: data.hosts,
    ticket_info: { is_free: ticketing.isFree, is_sold_out: ticketing.isSoldOut, require_approval: ticketing.requiresApproval },
    ticket_types: (Array.isArray(data.ticketTypes) ? data.ticketTypes : []).map((value) => {
      const ticket = object(value);
      return {
        name: ticket.name,
        type: ticket.price === 0 ? 'free' : 'paid',
        cents: typeof ticket.price === 'number' ? ticket.price * 100 : undefined,
        currency: ticket.currency,
        spots_remaining: ticket.available === false ? 0 : undefined,
      };
    }),
  };
}

export function lumaSourcePatch(snapshot: LumaSnapshot): Partial<Web3Event> {
  const data = sourceData(snapshot.data);
  const event = object(data.event);
  const name = text(event.name);
  const startDate = date(event.start_at);
  const eventId = text(event.api_id);
  if (!name || !startDate || !eventId.startsWith('evt-')) throw new Error(`Incomplete Luma event at ${snapshot.url}`);
  const geo = object(event.geo_address_info);
  const ticketInfo = object(data.ticket_info);
  const calendar = object(data.calendar);
  const online = event.location_type === 'online';
  const hidden = !online && (geo.mode === 'obfuscated' || event.geo_address_visibility === 'guests-only');
  const country = normalizeCountry(text(geo.country) || text(geo.country_code));
  const cityCandidate = text(geo.city) || text(geo.city_state).split(',')[0].trim();
  const isCityState = ['Singapore', 'Hong Kong', 'Monaco', 'Vatican City'].includes(country);
  const city = !isCityState && normalizeCountry(cityCandidate) === country ? '' : cityCandidate;
  const fullAddress = hidden ? '' : text(geo.full_address);
  const shortAddress = hidden ? '' : text(geo.short_address);
  const hosts = Array.isArray(data.hosts) ? data.hosts.map((host) => text(object(host).name)).filter(Boolean) : [];
  const offers: EventTicketOffer[] = [];
  for (const item of Array.isArray(data.ticket_types) ? data.ticket_types : []) {
    const ticket = object(item);
    if (ticket.is_hidden === true || ticket.is_disabled === true || ticket.is_flexible === true) continue;
    const currency = text(ticket.currency).toUpperCase();
    const price = ticket.type === 'free' ? 0 : typeof ticket.cents === 'number' && /^[A-Z]{3}$/.test(currency) ? ticket.cents / 100 : undefined;
    if (price === undefined || price < 0) continue;
    const soldOut = data.sold_out === true || ticketInfo.is_sold_out === true || ticket.spots_remaining === 0;
    offers.push({
      name: text(ticket.name) || undefined,
      url: snapshot.url,
      price,
      ...(currency ? { priceCurrency: currency } : {}),
      ...(soldOut ? { availability: 'SoldOut' as const } : data.registration_availability === 'open' ? { availability: 'InStock' as const } : {}),
      ...(date(ticket.valid_start_at) ? { validFrom: date(ticket.valid_start_at) } : {}),
    });
  }
  const lowest = [...offers].sort((a, b) => a.price - b.price)[0];
  const price = ticketInfo.is_free === true ? 'Free' : lowest ? lowest.price === 0 ? 'Free' : `${lowest.priceCurrency} ${lowest.price}` : undefined;
  const coordinate = object(event.coordinate);
  const latitude = coordinate.latitude;
  const longitude = coordinate.longitude;
  const description = proseMirrorToFormattedText(data.description_mirror).trim() || text(data.description);
  const endDate = date(event.end_at);
  if (endDate && Date.parse(endDate) < Date.parse(startDate)) throw new Error(`Invalid source date range at ${snapshot.url}`);

  return {
    name, startDate, endDate,
    ...(description ? { description } : {}),
    timezone: text(event.timezone) || undefined,
    registrationUrl: snapshot.url,
    coverImage: httpUrl(event.cover_url) || null,
    attendanceMode: online ? 'online' : event.location_type === 'offline' ? 'offline' : undefined,
    visibility: ['public', 'private', 'unlisted'].includes(text(event.visibility)) ? event.visibility as Web3Event['visibility'] : undefined,
    locationHidden: hidden,
    city: online ? undefined : city || undefined,
    country: online ? undefined : country || undefined,
    location: online ? 'Online' : fullAddress || [city, country].filter(Boolean).join(', ') || 'Location to be announced',
    venueName: !hidden && !online && normalizeCountry(text(geo.address)) !== country ? text(geo.address) || undefined : undefined,
    streetAddress: !online && hasDetailedStreetAddress(shortAddress) ? shortAddress : !online && hasDetailedStreetAddress(fullAddress) ? fullAddress : undefined,
    addressLocality: !hidden && !online ? city || undefined : undefined,
    addressRegion: !hidden && !online ? text(geo.region) || undefined : undefined,
    addressCountry: !hidden && !online ? text(geo.country_code) || country || undefined : undefined,
    postalCode: !hidden && !online ? text(geo.postal_code) || undefined : undefined,
    neighborhood: !hidden && !online ? text(geo.sublocality) || undefined : undefined,
    coordinates: !hidden && !online && (city || (fullAddress && normalizeCountry(fullAddress) !== country)) && typeof latitude === 'number' && typeof longitude === 'number' && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 ? { latitude, longitude } : undefined,
    hosts,
    organizer: calendar.is_personal === false && text(calendar.name) ? {
      type: 'Organization', name: text(calendar.name),
      url: httpUrl(calendar.website) || (text(calendar.slug) ? `https://luma.com/${text(calendar.slug)}` : undefined),
    } : undefined,
    price,
    approvalRequired: typeof ticketInfo.require_approval === 'boolean' ? ticketInfo.require_approval : undefined,
    ticketOffers: offers.length ? offers : undefined,
    registrationAvailability: text(data.registration_availability) || undefined,
    ...(event.cancelled_at ? { eventStatus: 'EventCancelled' as const } : {}),
    sourceVerification: { url: snapshot.url, eventId, fetchedAt: snapshot.fetchedAt, method: snapshot.method, ...(snapshot.apifyRunId ? { apifyRunId: snapshot.apifyRunId } : {}) },
  };
}
