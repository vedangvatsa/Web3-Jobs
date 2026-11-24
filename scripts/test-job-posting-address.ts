#!/usr/bin/env tsx

import assert from 'node:assert/strict';
import {
  parseJobAddress,
  toAddressCountryCode,
} from '../src/lib/job-posting-location';

function expectCountry(location: string, expected: string): void {
  const parsed = parseJobAddress(location);
  assert.equal(toAddressCountryCode(parsed.addressCountry), expected, location);
}

expectCountry('San Francisco, CA', 'US');
expectCountry('New York, NY', 'US');
expectCountry('Singapore', 'SG');
expectCountry('Kuala Lumpur, Malaysia', 'MY');
expectCountry('London, UK', 'GB');
expectCountry('Berlin, Germany', 'DE');
expectCountry('Palo Alto, California, United States', 'US');
expectCountry('Hybrid (London, United Kingdom)', 'GB');
expectCountry('Remote (Hungary)', 'HU');
expectCountry('Remote (United States)', 'US');
assert.equal(toAddressCountryCode(parseJobAddress('Remote (Worldwide)').addressCountry), undefined);

const bareCity = parseJobAddress('London');
assert.equal(toAddressCountryCode(bareCity.addressCountry), 'GB', 'London maps to GB when unambiguous');
assert.equal(parseJobAddress('New York Office').addressCountry, 'US');
assert.equal(parseJobAddress('Chicago').addressCountry, 'US');

expectCountry('Austin, TX - Hybrid', 'US');
expectCountry('Tbilisi, Georgia', 'GE');
expectCountry('Atlanta, Georgia', 'US');
assert.equal(parseJobAddress('Indianapolis').addressCountry, 'US');
for (const location of ['New Mexico', 'Toronto, CA', 'Berlin, DE', 'CA']) {
  assert.equal(parseJobAddress(location).addressCountry, undefined, `Do not guess or borrow a country: ${location}`);
}
assert.equal(parseJobAddress('London; Paris, France').addressCountry, 'GB');
assert.deepEqual(parseJobAddress(''), {});
assert.deepEqual(parseJobAddress(undefined), {});

console.log('Job posting address parsing OK');
