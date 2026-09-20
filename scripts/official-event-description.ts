import { load, type CheerioAPI } from 'cheerio';
import type { Web3Event } from '../src/lib/events';

export type OfficialDescription = {
  description: string;
  method: 'event-jsonld' | 'official-section' | 'official-meta';
  pageTitle: string;
  eventFacts?: Partial<Pick<Web3Event, 'startDate' | 'endDate' | 'attendanceMode' | 'venueName' | 'streetAddress' | 'addressLocality' | 'addressRegion' | 'addressCountry' | 'postalCode' | 'location' | 'city' | 'country'>>;
};

const ERROR_PAGE = /access denied|just a moment|verify (?:that )?you are human|page not found|enable javascript|checking your browser/i;
const UI_TEXT = /^(?:skip to (?:main )?content|menu|close|sign (?:in|up)|log in|register(?: now)?|buy tickets|get tickets|learn more|read more|accept all|reject all|manage cookies|cookie (?:policy|preferences)|privacy policy|terms (?:of use|and conditions)|all rights reserved|subscribe(?: to our newsletter)?)[.!\s]*$/i;
const GENERIC_META = /(?:website|site) (?:was )?(?:built|created|made) (?:with|using)|find (?:local|upcoming) events|browse (?:all )?events|cookie policy|domain (?:is )?for sale/i;
const normalize = (text: string) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function matchesEventIdentity(name: string, evidence: string): boolean {
  const ignored = new Set(['the', 'and', 'by', 'at', 'in', 'of', 'on', 'a', 'an', 'day', 'official', 'edition']);
  const words = normalize(name).split(' ').filter((word) => word.length > 1 && !/^\d+$/.test(word) && !ignored.has(word));
  const normalizedEvidence = normalize(evidence);
  if (!words.length) return false;
  const acronym = words.map((word) => word[0]).join('');
  const statedAcronym = name.match(/\(([A-Z]{3,8})\)/)?.[1]?.toLowerCase();
  for (const alias of [acronym.length >= 3 && acronym.length <= 6 ? acronym : '', statedAcronym || '']) {
    if (alias && new RegExp(`\\b${alias}(?:20\\d{2})?\\b`, 'i').test(normalizedEvidence)) return true;
  }
  if (/^ethtokyo\s+week\b/i.test(name) && /\bethtokyo\b/.test(normalizedEvidence)) return true;
  const compact = normalizedEvidence.replace(/ /g, '');
  if (compact.includes(words.join(''))) return true;
  const matches = words.filter((word) => normalizedEvidence.split(' ').includes(word));
  return matches.length >= Math.min(2, words.length) && matches.length / words.length >= 0.7;
}

function readableHtml(html: string): string {
  const $ = load(html);
  $('script, style, nav, footer, form, button, noscript, svg, iframe, [hidden], [aria-hidden="true"]').remove();
  $('br').replaceWith('\n');
  $('h1,h2,h3,h4,h5,h6').each((_, element) => { $(element).replaceWith(`\n\n## ${$(element).text().trim()}\n\n`); });
  $('li').each((_, element) => { $(element).prepend('\n• ').append('\n'); });
  $('p,div,section,ul,ol,blockquote').append('\n\n');
  return $.root().text().replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function structuredEvents($: CheerioAPI): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    const node = value as Record<string, unknown>;
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    if (types.some((type) => typeof type === 'string' && /Event$/.test(type))) found.push(node);
    if (node['@graph']) visit(node['@graph']);
    if (node.subEvent) visit(node.subEvent);
  };
  $('script[type="application/ld+json"]').each((_, element) => {
    try { visit(JSON.parse($(element).text())); } catch { /* Invalid markup is not source evidence. */ }
  });
  return found;
}

function eventFacts(item: Record<string, unknown>, eventName: string): OfficialDescription['eventFacts'] {
  const facts: NonNullable<OfficialDescription['eventFacts']> = {};
  // A parent conference's dates do not replace a separately listed session/day.
  if (!/\b(?:day|round|ceremony|practice|qualifying|after.party|vip night)\b/i.test(eventName)) {
    for (const key of ['startDate', 'endDate'] as const) {
      const value = item[key];
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) && Number.isFinite(Date.parse(value))) facts[key] = value;
    }
    if (facts.startDate && facts.endDate && Date.parse(facts.endDate) < Date.parse(facts.startDate)) delete facts.endDate;
  }
  const place = item.location && typeof item.location === 'object' && !Array.isArray(item.location) ? item.location as Record<string, unknown> : {};
  if (place['@type'] === 'VirtualLocation') return {
    ...facts, attendanceMode: 'online', location: 'Online', city: undefined, country: undefined,
    venueName: undefined, streetAddress: undefined, addressLocality: undefined, addressRegion: undefined, addressCountry: undefined, postalCode: undefined,
  };
  if (place['@type'] !== 'Place') return facts;
  const address = place.address && typeof place.address === 'object' && !Array.isArray(place.address) ? place.address as Record<string, unknown> : {};
  if (typeof place.name === 'string') facts.venueName = place.name;
  for (const key of ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry'] as const) {
    const value = address[key];
    if (typeof value === 'string' && value.trim()) facts[key] = value.trim();
  }
  if (facts.addressLocality) facts.city = facts.addressLocality;
  if (facts.addressCountry) facts.country = facts.addressCountry;
  if (typeof place.address === 'string' && place.address.trim()) facts.streetAddress = place.address.trim();
  if (facts.streetAddress || facts.venueName) facts.location = [...new Set([facts.venueName, facts.streetAddress, facts.addressLocality, facts.addressRegion, facts.postalCode, facts.addressCountry].filter(Boolean))].join(', ');
  return facts;
}

export function extractOfficialEventDescription(html: string, event: Pick<Web3Event, 'name' | 'startDate'>): { result?: OfficialDescription; reason?: string } {
  const $ = load(html);
  const title = $('meta[property="og:title"]').attr('content') || $('title').first().text();
  if (ERROR_PAGE.test(title)) return { reason: 'blocked-or-error-page' };
  const year = event.startDate.slice(0, 4);
  for (const item of structuredEvents($)) {
    if (typeof item.name !== 'string' || !matchesEventIdentity(event.name, item.name)) continue;
    if (typeof item.startDate === 'string' && item.startDate.slice(0, 4) !== year) continue;
    if (typeof item.description !== 'string') continue;
    const description = readableHtml(item.description);
    if (description.length >= 40 && !GENERIC_META.test(description)) {
      return { result: { description, method: 'event-jsonld', pageTitle: title, eventFacts: eventFacts(item, event.name) } };
    }
  }

  const headingEvidence = ($('h1').length ? $('h1') : $('h2').slice(0, 3)).map((_, element) => $(element).text()).get().join(' ').slice(0, 4000);
  const meta = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
  const identity = `${title} ${headingEvidence} ${meta}`;
  if (!matchesEventIdentity(event.name, identity)) return { reason: 'event-not-matched' };
  const editionYears: string[] = `${title} ${$('h1').text()}`.match(/\b20\d{2}\b/g) || [];
  if (editionYears.length && !editionYears.includes(year)) return { reason: 'different-event-edition' };

  $('script,style,nav,header,footer,form,button,noscript,svg,iframe,aside,[hidden],[aria-hidden="true"],[class*="cookie"],[id*="cookie"]').remove();
  const selectors = ['[itemprop="description"]', '#event-description', '.event-description', '#about', '#about-event', '#about-us', '[id*="about"]', 'main', 'article', 'body'];
  for (const selector of selectors) {
    const container = $(selector).first();
    if (!container.length) continue;
    const blocks: string[] = [];
    const seen = new Set<string>();
    let excludedSection = false;
    container.find('h1,h2,h3,h4,p,li').each((_, element) => {
      const node = $(element);
      if (node.parents('li').length) return;
      const content = node.text().replace(/\s+/g, ' ').trim();
      if (!content || UI_TEXT.test(content) || (/cookie|subscribe to|sign up for (?:our|the) newsletter/i.test(content) && content.length < 250)) return;
      if (content.length > 4000) return;
      const tag = element.tagName;
      if (/^h[1-4]$/.test(tag)) {
        const years: string[] = content.match(/\b20\d{2}\b/g) || [];
        excludedSection = /previous|past (?:events|speakers|highlights)|recap|testimonials|attendees.*saying|newsletter|stay.*updated|follow us|our partners/i.test(content)
          || (years.length > 0 && !years.includes(year));
      }
      if (excludedSection) return;
      if (['main', 'article', 'body'].includes(selector) && !/^h[1-4]$/.test(tag) && content.length < 60) return;
      const block = /^h[1-4]$/.test(tag) ? `## ${content}` : tag === 'li' ? `• ${content}` : content;
      if (!seen.has(block)) blocks.push(block);
      seen.add(block);
    });
    const paragraphs = blocks.filter((block) => !block.startsWith('## '));
    if (paragraphs.join(' ').length >= 150 && blocks.join('\n\n').length <= 25000) {
      return { result: { description: blocks.join('\n\n'), method: 'official-section', pageTitle: title } };
    }
  }
  const description = readableHtml(meta);
  if (description.length >= 40 && !ERROR_PAGE.test(description) && !GENERIC_META.test(description)) {
    return { result: { description, method: 'official-meta', pageTitle: title } };
  }
  return { reason: 'no-event-description' };
}
