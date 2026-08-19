import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  alreadyCovered,
  normalizeUrl,
  sameEvent,
} from './news-story-dedup.mjs';

describe('news story dedup', () => {
  it('treats Amazon rare-book AI-training coverage as one event', () => {
    const arsHeadline = 'Amazon destroys rare physical books to train language models';
    const arsTitle = 'Hidden Airtag reveals Amazon is trashing rare books to train AI';
    const tcHeadline = 'Amazon digitizes rare physical books to train AI models';
    const tcTitle = 'Amazon, which started off selling books, is destroying rare texts to train AI';
    const third = 'AirTag traces rare books to Amazon AI scanning warehouse';

    assert.equal(sameEvent(arsHeadline, tcHeadline), true);
    assert.equal(sameEvent(arsHeadline, tcTitle), true);
    assert.equal(sameEvent(arsTitle, tcHeadline), true);
    assert.equal(sameEvent(arsTitle, tcTitle), true);
    assert.equal(sameEvent(arsHeadline, third), true);
    assert.equal(sameEvent(arsTitle, third), true);

    const posted = [arsHeadline, arsTitle];
    assert.equal(alreadyCovered(tcHeadline, posted), true);
    assert.equal(alreadyCovered(tcTitle, posted), true);
    assert.equal(alreadyCovered(third, posted), true);
  });

  it('does not collapse unrelated Amazon stories', () => {
    const books = 'Amazon destroys rare physical books to train language models';
    const shop = 'Amazon launches AI shopping assistant';
    const turk = 'Amazon will stop accepting new customers for Mechanical Turk';
    assert.equal(sameEvent(books, shop), false);
    assert.equal(sameEvent(books, turk), false);
  });

  it('normalizes tracking params out of URLs', () => {
    assert.equal(
      normalizeUrl('https://www.arstechnica.com/tech-policy/2026/08/hidden-airtag-reveals-amazon-is-trashing-rare-books-to-train-ai/?utm_source=hashtag_ai'),
      'arstechnica.com/tech-policy/2026/08/hidden-airtag-reveals-amazon-is-trashing-rare-books-to-train-ai'
    );
  });
});
