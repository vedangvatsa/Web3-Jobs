import fs from 'node:fs';
import path from 'node:path';
import type { EventVenueAddress, EventVenueAddressVerification, Web3Event } from '../src/lib/events';
import { formatVenueAddress, hasDetailedStreetAddress, hasVerifiedVenueAddress } from '../src/lib/event-address';
import type { EventVenueReview } from '../src/lib/event-venue-review';

type Evidence = { url: string; fetchedAt: string; claim: string; excerpt: string };
type ResearchRow = { id: string; status: string; patch?: EventVenueReview['patch']; publicVenues?: EventVenueAddress[]; evidence?: Evidence[]; note: string; fetchedAt?: string; sha256?: string; sourceEventId?: string; sourcePublicLocation?: boolean; previouslyHidden?: boolean };
const root = process.cwd();
const input = path.join(root, '.cache/event-address-enrichment');
const targets = JSON.parse(fs.readFileSync(path.join(input, 'targets.json'), 'utf8')) as Web3Event[];
const files = ['india-research.json', 'europe-research.json', 'other-a-research.json', 'other-b-research.json', 'luma-research.json'];
const rows = files.flatMap(file => JSON.parse(fs.readFileSync(path.join(input, file), 'utf8')) as ResearchRow[]);
const byId = new Map(targets.map(event => [event.id, event]));
const seen = new Set<string>();
const reviewFile = 'content/events/venue-address-reviews.json';
const reviews: Record<string, EventVenueReview> = fs.existsSync(reviewFile) ? JSON.parse(fs.readFileSync(reviewFile, 'utf8')) : {};
const updated = new Set<string>();
const normalize = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

function proof(patch: EventVenueReview['patch'], checkedAt: string, urls: string[]): EventVenueAddressVerification {
  return {
    checkedAt, urls, venueName: patch.venueName!, streetAddress: patch.streetAddress!,
    addressLocality: patch.addressLocality, addressCountry: patch.addressCountry, location: patch.location!,
  };
}

function saveReview(id: string, review: EventVenueReview) {
  if (reviews[id] && Date.parse(reviews[id].checkedAt) > Date.parse(review.checkedAt)) throw new Error(`Older evidence cannot replace the newer address review for ${id}`);
  reviews[id] = review;
  updated.add(id);
}

for (const row of rows) {
  const event = byId.get(row.id);
  if (!event || seen.has(row.id)) throw new Error(`Unexpected or duplicate research ID: ${row.id}`);
  seen.add(row.id);
  row.evidence = (row.evidence || []).filter(item => !/[?&](?:Signature|Policy|Key-Pair-Id)=/i.test(item.url));
  if (row.evidence.some(item => !/^https?:\/\//.test(item.url) || !Number.isFinite(Date.parse(item.fetchedAt)) || !item.excerpt || !item.claim)) throw new Error(`Incomplete source evidence: ${row.id}`);
  const checkedAt = row.evidence.map(item => item.fetchedAt).sort().at(-1) || row.fetchedAt;
  const urls = [...new Set(row.evidence.map(item => item.url))];
  if (event.locationHidden || ['private', 'unlisted'].includes(event.visibility || '')) {
    if (row.status === 'verified') { row.status = 'hidden'; row.note += ' Existing privacy hold retained.'; }
    delete row.patch;
    continue;
  }
  if (row.id === 'premier-planblugano') row.publicVenues = [
    { name: 'Palazzo dei Congressi', streetAddress: 'Piazza Indipendenza 4', addressLocality: 'Lugano', postalCode: '6900', addressCountry: 'CH', sourceUrl: 'https://luganoconventions.com/it/strutture/palazzo-congressi' },
    { name: 'Villa Ciani', streetAddress: 'Via Canova', addressLocality: 'Lugano', postalCode: '6900', addressCountry: 'CH', sourceUrl: 'https://www.luganoconventions.com/en/venues/villa-ciani' },
    { name: 'Asilo Ciani', streetAddress: 'Viale Carlo Cattaneo 5', addressLocality: 'Lugano', postalCode: '6900', addressCountry: 'CH', sourceUrl: 'https://www.luganoconventions.com/en/venues/asilo-ciani' },
  ];
  if (row.status === 'multi-venue' && row.publicVenues?.length) {
    if (!checkedAt || !urls.length) throw new Error(`Missing multi-venue evidence: ${row.id}`);
    const venues = row.publicVenues.map(venue => {
      const next = { ...venue, sourceUrl: venue.sourceUrl || urls[0] };
      if (venue.streetAddress) next.verification = proof({ ...venue, venueName: venue.name, location: formatVenueAddress(venue) }, checkedAt, urls);
      return next;
    });
    const patch: EventVenueReview['patch'] = { venueAddresses: venues, location: event.location };
    if (row.id === 'premier-bitcoinhistorico') Object.assign(patch, { city: 'San Salvador', country: 'El Salvador', location: 'Centro Histórico, San Salvador, El Salvador' });
    saveReview(row.id, { expectedStartDate: event.startDate, checkedAt, patch });
    delete row.patch;
    continue;
  }
  if (row.status !== 'verified' || !row.patch) continue;
  if (!checkedAt || !urls.length) throw new Error(`Missing address evidence: ${row.id}`);
  const patch = { ...row.patch };
  if (!patch.streetAddress?.trim() || !patch.venueName?.trim() || !patch.location?.trim()) throw new Error(`Incomplete proposed address: ${row.id}`);
  const districtOnly = normalize(patch.streetAddress.split(',')[0]) === normalize(patch.venueName) && !hasDetailedStreetAddress(patch.streetAddress);
  if (districtOnly) {
    row.status = 'not-announced'; row.note += ' Public source identifies only a neighborhood/area, not a sufficiently detailed venue address.';
    delete row.patch;
    continue;
  }
  patch.addressLocality ||= event.addressLocality || event.city;
  patch.addressCountry ||= event.addressCountry || event.country;
  if (row.id === 'premier-labitconf-2026') Object.assign(patch, { city: 'Buenos Aires', country: 'Argentina' });
  if (row.id === 'premier-africastablecoin') patch.city = 'Cape Town';
  patch.venueAddressSource = proof(patch, checkedAt, urls);
  if (!hasVerifiedVenueAddress(patch as Web3Event)) throw new Error(`Address proof mismatch: ${row.id}`);
  saveReview(row.id, { expectedStartDate: event.startDate, checkedAt, ...(row.sourceEventId ? { expectedSourceEventId: row.sourceEventId } : {}), patch });
  row.patch = patch;
}
if (seen.size !== targets.length) throw new Error(`Incomplete research coverage: ${seen.size}/${targets.length}`);

const report = {
  checkedAt: new Date().toISOString(), targets: targets.length, reviewed: rows.length,
  addressUpdates: [...updated].filter(id => reviews[id].patch.streetAddress).length,
  multiVenueUpdates: [...updated].filter(id => reviews[id].patch.venueAddresses).length,
  outcomes: rows.reduce<Record<string, number>>((counts, row) => { counts[row.status] = (counts[row.status] || 0) + 1; return counts; }, {}),
  records: rows.map(row => ({ ...row, name: byId.get(row.id)!.name, applied: updated.has(row.id) })),
};
fs.writeFileSync(path.join(input, 'import-preview.json'), JSON.stringify({ reviews, report }, null, 2) + '\n');
if (process.argv.includes('--apply')) {
  fs.writeFileSync(reviewFile, JSON.stringify(reviews, null, 2) + '\n');
  fs.writeFileSync('content/events/venue-address-audit.json', JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ targets: report.targets, addressUpdates: report.addressUpdates, multiVenueUpdates: report.multiVenueUpdates, outcomes: report.outcomes, applied: process.argv.includes('--apply') }, null, 2));
