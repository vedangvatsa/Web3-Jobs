#!/usr/bin/env tsx

import assert from 'node:assert/strict';
import {
  ensureAddressCountry,
  parseJobAddress,
  toAddressCountryCode,
} from '../src/components/job-detail-view';

function expectCountry(location: string, expected: string): void {
  const parsed = ensureAddressCountry(parseJobAddress(location), location);
  assert.equal(toAddressCountryCode(parsed.addressCountry), expected, location);
}

expectCountry('San Francisco, CA', 'US');
expectCountry('New York, NY', 'US');
expectCountry('Singapore', 'SG');
expectCountry('Kuala Lumpur, Malaysia', 'MY');
expectCountry('London, UK', 'GB');
expectCountry('Berlin, Germany', 'DE');
expectCountry('Palo Alto, California, United States', 'US');

const bareCity = ensureAddressCountry(parseJobAddress('London'), 'London');
assert.equal(toAddressCountryCode(bareCity.addressCountry), undefined, 'London with no country hint');

console.log('Job posting address parsing OK');
