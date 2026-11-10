import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sanitizeCompanyForSocial } from '../../src/lib/social-share-constants.mjs';

test('sanitizeCompanyForSocial defangs domain-like company names with ZWSP', () => {
  // Test .com domains
  assert.equal(sanitizeCompanyForSocial('Blockchain.com'), 'Blockchain\u200B.com');
  assert.equal(sanitizeCompanyForSocial('Crypto.com'), 'Crypto\u200B.com');
  assert.equal(sanitizeCompanyForSocial('crypto.com'), 'crypto\u200B.com');

  // Test other TLDs (.fi, .fun, .io, .ai, .xyz, etc.)
  assert.equal(sanitizeCompanyForSocial('Rhino.fi'), 'Rhino\u200B.fi');
  assert.equal(sanitizeCompanyForSocial('pump.fun'), 'pump\u200B.fun');
  assert.equal(sanitizeCompanyForSocial('Spiko.io'), 'Spiko\u200B.io');
  assert.equal(sanitizeCompanyForSocial('gate.io'), 'gate\u200B.io');
  assert.equal(sanitizeCompanyForSocial('CEX.IO'), 'CEX\u200B.IO');
  assert.equal(sanitizeCompanyForSocial('Pluralis.ai'), 'Pluralis\u200B.ai');
  assert.equal(sanitizeCompanyForSocial('Codex.xyz'), 'Codex\u200B.xyz');

  // Non-domain company names should remain completely untouched
  assert.equal(sanitizeCompanyForSocial('Coinbase'), 'Coinbase');
  assert.equal(sanitizeCompanyForSocial('Kraken'), 'Kraken');
  assert.equal(sanitizeCompanyForSocial('Binance'), 'Binance');
  assert.equal(sanitizeCompanyForSocial('Block, Inc.'), 'Block, Inc.');
  assert.equal(sanitizeCompanyForSocial('D3 Global'), 'D3 Global');

  // Edge cases: empty or non-string
  assert.equal(sanitizeCompanyForSocial(''), '');
  assert.equal(sanitizeCompanyForSocial(null as any), '');
  assert.equal(sanitizeCompanyForSocial(undefined as any), '');
});
