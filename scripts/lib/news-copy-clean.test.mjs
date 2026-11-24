import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  cleanTelegramNewsCopy,
  isRelatedMediaLine,
  normalizeTelegramNewsStory,
} from './news-copy-clean.mjs';

test('detects and cleans Cointelegraph sidebar junk', () => {
  const tapiero = '$10T Crypto Market Cap in 2025? Dan Tapiero Explains. Source: YouTube';
  const pollak = "Magazine: You should ‘go and build’ your own AI agent: Jesse Pollak, X Hall of Flame";
  assert.equal(isRelatedMediaLine(pollak), true);
  assert.equal(isRelatedMediaLine(tapiero), false);
  assert.equal(
    cleanTelegramNewsCopy(tapiero),
    '$10T Crypto Market Cap in 2025? Dan Tapiero Explains',
  );
  assert.equal(
    cleanTelegramNewsCopy(pollak),
    'You should ‘go and build’ your own AI agent: Jesse Pollak',
  );
  assert.equal(
    normalizeTelegramNewsStory({
      headline: tapiero,
      summary: 'A summary.',
      link: 'https://example.com/a',
    }).headline,
    '$10T Crypto Market Cap in 2025? Dan Tapiero Explains',
  );
});

test('leaves normal headlines untouched', () => {
  const headline = '0G Foundation launches $88M fund for AI agents';
  assert.equal(cleanTelegramNewsCopy(headline), headline);
  assert.equal(isRelatedMediaLine('Related: Crypto crash triggered by TradFi events'), true);
});