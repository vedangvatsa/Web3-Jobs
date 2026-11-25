import assert from 'node:assert/strict';
import {
  BBW_2026_LUMA_TIGHT_END,
  BBW_2026_LUMA_TIGHT_START,
  BBW_2026_TEXT_WIDE_END,
  BBW_2026_TEXT_WIDE_START,
  inBbw2026SideWindow,
  isBangkokMetro,
  shouldTagBbw2026SideEvent,
} from './bbw-side-events';

const bangkokLuma = {
  city: 'Bangkok',
  location: 'Sukhumvit, Bangkok',
  country: 'Thailand',
  eventId: 'luma-crypto-abc123',
  source: 'luma-crypto' as const,
  text: 'Founders dinner',
};

assert.equal(isBangkokMetro('Krung Thep Maha Nakhon', 'Pathum Wan', 'Thailand'), true);
assert.equal(inBbw2026SideWindow('2026-11-28'), true);
assert.equal(inBbw2026SideWindow('2026-11-25'), false);

assert.equal(
  shouldTagBbw2026SideEvent({ ...bangkokLuma, startDate: '2026-11-28T12:00:00.000Z' }),
  true,
  'Luma Bangkok in tight window',
);
assert.equal(
  shouldTagBbw2026SideEvent({ ...bangkokLuma, startDate: '2026-11-25T12:00:00.000Z' }),
  false,
  'Luma Bangkok before tight window without BBW text',
);
assert.equal(
  shouldTagBbw2026SideEvent({
    ...bangkokLuma,
    startDate: '2026-11-25T12:00:00.000Z',
    text: 'BBW welcome dinner',
  }),
  true,
  'Explicit BBW text in wide window',
);
assert.equal(
  shouldTagBbw2026SideEvent({
    ...bangkokLuma,
    startDate: '2026-12-10T12:00:00.000Z',
    text: 'Binance Blockchain Week closing party',
  }),
  false,
  'Explicit BBW text outside wide window',
);
assert.equal(
  shouldTagBbw2026SideEvent({
    ...bangkokLuma,
    startDate: '2026-12-02T12:00:00.000Z',
  }),
  false,
  'Luma Bangkok after tight window',
);
assert.equal(
  shouldTagBbw2026SideEvent({
    eventId: 'premier-binancebw-2026',
    startDate: '2026-11-28T09:00:00.000Z',
    city: 'Bangkok',
    location: 'QSNCC',
    text: 'Binance Blockchain Week',
  }),
  false,
  'Never tag premier hub',
);

assert.equal(BBW_2026_LUMA_TIGHT_START, '2026-11-26');
assert.equal(BBW_2026_LUMA_TIGHT_END, '2026-12-01');
assert.equal(BBW_2026_TEXT_WIDE_START, '2026-11-24');
assert.equal(BBW_2026_TEXT_WIDE_END, '2026-12-03');

console.log('bbw-side-events.test.ts: ok');