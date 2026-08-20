import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  alreadyCovered,
  eventFingerprint,
  normalizeUrl,
  rememberPostedStory,
  sameEvent,
  trimPostedLog,
} from './news-story-dedup.mjs';

describe('news story dedup', () => {
  it('treats the same scoop from different outlets as one event', () => {
    const pairs = [
      [
        'Amazon destroys rare physical books to train language models',
        'Hidden Airtag reveals Amazon is trashing rare books to train AI',
        'Amazon digitizes rare physical books to train AI models',
        'Amazon, which started off selling books, is destroying rare texts to train AI',
        'AirTag traces rare books to Amazon AI scanning warehouse',
      ],
      [
        'OpenAI launches GPT-5.6 model family',
        'OpenAI rolls out GPT-5.6 across ChatGPT',
        'Altman unveils GPT-5.6 for ChatGPT users',
      ],
      [
        'Anthropic raises $20B in new funding round',
        'Claude maker Anthropic closes $20 billion round',
      ],
      [
        'Apple sues OpenAI over alleged trade secret theft',
        'Apple files trade-secret lawsuit against OpenAI',
      ],
    ];

    for (const variants of pairs) {
      const [first, ...rest] = variants;
      for (const other of rest) {
        assert.equal(sameEvent(first, other), true, `"${first}" vs "${other}"`);
        assert.equal(alreadyCovered(other, [first]), true, `posted "${first}" should block "${other}"`);
      }
    }
  });

  it('does not collapse unrelated stories about the same company', () => {
    const books = 'Amazon destroys rare physical books to train language models';
    const shop = 'Amazon launches AI shopping assistant';
    const turk = 'Amazon will stop accepting new customers for Mechanical Turk';
    assert.equal(sameEvent(books, shop), false);
    assert.equal(sameEvent(books, turk), false);
    assert.equal(sameEvent(shop, turk), false);

    const gpt = 'OpenAI launches GPT-5.6 model family';
    const nyt = 'OpenAI may have made a fatal misstep in copyright fight with news orgs';
    assert.equal(sameEvent(gpt, nyt), false);
  });

  it('does not treat recurring topic words as the same scoop', () => {
    assert.equal(
      sameEvent(
        'Fake Crypto AML Checkers Are Trying to Drain Users\' Wallets',
        'Coldcard Bitcoin Exploit Balloons to $88 Million as Attackers Keep Draining Wallets'
      ),
      false
    );
    assert.equal(
      sameEvent(
        'MiCA cracks down on USDT in Europe... but no one else cares',
        'Germany leads MiCA crypto authorization race as Europe’s deadline looms'
      ),
      false
    );
    assert.equal(
      sameEvent(
        'OpenLedger’s Ram Kumar sees agentic payments as crypto’s first AI killer app',
        'Toyota Finance opens tokenized bonds to retail investors via mobile payment app'
      ),
      false
    );
  });

  it('stores a fingerprint so a later rewrite is blocked even without the original headline', () => {
    const posted = new Set();
    rememberPostedStory(posted, {
      link: 'https://arstechnica.com/ai/example',
      headline: 'Amazon destroys rare physical books to train language models',
      originalTitle: 'Hidden Airtag reveals Amazon is trashing rare books to train AI',
    });
    const fps = [...posted].filter((p) => String(p).startsWith('fp:'));
    assert.ok(fps.length >= 1);
    assert.equal(
      alreadyCovered('Amazon digitizes rare physical books to train AI models', [...posted]),
      true
    );
  });

  it('keeps fingerprints when trimming old URLs', () => {
    const posted = new Set([
      'https://example.com/old-1',
      'Old unrelated headline about chips',
      'fp:amazon|book|rare',
    ]);
    const trimmed = trimPostedLog(posted, { maxUrls: 1, maxTexts: 10 });
    assert.ok(trimmed.includes('fp:amazon|book|rare'));
    assert.ok(trimmed.includes('Old unrelated headline about chips'));
  });

  it('normalizes tracking params out of URLs', () => {
    assert.equal(
      normalizeUrl('https://www.arstechnica.com/tech-policy/2026/08/hidden-airtag-reveals-amazon-is-trashing-rare-books-to-train-ai/?utm_source=hashtag_ai'),
      'arstechnica.com/tech-policy/2026/08/hidden-airtag-reveals-amazon-is-trashing-rare-books-to-train-ai'
    );
  });

  it('builds a stable fingerprint from distinctive tokens', () => {
    const fp = eventFingerprint('Amazon destroys rare physical books to train language models');
    assert.ok(fp.includes('amazon'));
    assert.ok(fp.includes('book'));
  });
});
