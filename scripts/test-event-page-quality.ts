import assert from 'node:assert/strict';
import type { Web3Event } from '../src/types';
import {
  hasIndexableEventPage,
  isLumaCryptoBoilerplateDescription,
} from '../src/lib/event-page-quality';

const cryptoBlo: Web3Event = {
  id: 'luma-crypto-PJA3o7ucniYAKBP',
  slug: 'crypto-blo',
  name: 'Crypto And Blockchain.',
  description: 'Crypto And Blockchain. - Web3 community event in New Delhi, India.',
  startDate: '2026-09-19T10:30:00.000Z',
  endDate: '2026-09-19T14:30:00.000Z',
  city: 'New Delhi',
  country: 'India',
  location: 'Tim Hortons, New Delhi',
  url: 'https://luma.com/of9hwrqv',
  source: 'luma-crypto',
};

const token2049: Web3Event = {
  id: 'premier-token2049-2026',
  slug: 'token2049',
  name: 'TOKEN2049 Singapore',
  description: 'Premier crypto conference.',
  startDate: '2026-09-17T00:00:00.000Z',
  city: 'Singapore',
  country: 'Singapore',
  location: 'Singapore',
  url: 'https://token2049.com',
  source: 'curated-premier',
};

assert.equal(isLumaCryptoBoilerplateDescription(cryptoBlo.description!), true);
assert.equal(hasIndexableEventPage(cryptoBlo), false);
assert.equal(hasIndexableEventPage(token2049), true);

console.log('Event page quality tests passed.');
