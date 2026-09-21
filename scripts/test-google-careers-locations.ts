import assert from 'node:assert/strict';
import {
  extractGoogleCareersLocations,
  enrichLocationFromPostingHtml,
} from '../src/lib/employer-careers-locations';

const sampleAnnouncement =
  'Select a location from the following: Frankfurt am Main, Germany; Munich, Germany; London, UK; Zürich, Switzerland." data-is-announcement';

const sampleInline =
  'Frankfurt am Main, Germany</span><span>Frankfurt am Main, Germany; Munich, Germany; London, UK; Zürich, Switzerland.</span>';

const extractedAnnouncement = extractGoogleCareersLocations(sampleAnnouncement);
assert.ok(extractedAnnouncement?.includes('Munich'), extractedAnnouncement ?? 'missing munich');
assert.equal(extractedAnnouncement?.split(';').length, 4);

const extractedInline = extractGoogleCareersLocations(sampleInline);
assert.ok(extractedInline?.includes('London'), extractedInline ?? 'missing london');

const escapedAnnouncement =
  'from the following: \\u003cb\\u003eFrankfurt am Main, Germany; Munich, Germany; London, UK; Zürich, Switzerland\\u003c/b\\u003e.';
assert.equal(extractGoogleCareersLocations(escapedAnnouncement), 'Frankfurt am Main, Germany; Munich, Germany; London, UK; Zürich, Switzerland');

const junk =
  'natural language processing, UI design and mobile; the list goes on and is growing every day. As a software engineer, you will work on a specific project criti';
assert.equal(extractGoogleCareersLocations(junk), null);

const enriched = enrichLocationFromPostingHtml(
  'https://www.google.com/about/careers/applications/jobs/results/137522277502591686-x',
  'Frankfurt am Main, Germany',
  sampleAnnouncement,
);
assert.equal(enriched?.split(';').length, 4);

const wrongPrimary = enrichLocationFromPostingHtml(
  'https://www.google.com/about/careers/applications/jobs/results/132277607038100166-x',
  'Hong Kong',
  sampleAnnouncement,
);
assert.equal(wrongPrimary, 'Hong Kong');

console.log('[test-google-careers-locations] OK');
