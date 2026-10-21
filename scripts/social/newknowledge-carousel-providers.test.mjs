import test from 'node:test';
import assert from 'node:assert/strict';
import { CAROUSEL_ACCOUNTS, assertCarouselAccount, assertCarouselCaption, carouselCaptionUnits, carouselProviderClient } from './newknowledge-carousel-providers.mjs';

const account = platform => ({ id: CAROUSEL_ACCOUNTS[platform].channelId, service: platform, serviceId: CAROUSEL_ACCOUNTS[platform].serviceId, externalLink: CAROUSEL_ACCOUNTS[platform].profile, name: 'hashtagweb3', type: platform === 'linkedin' ? 'page' : 'business', organizationId: 'org', isDisconnected: false, isLocked: false, isQueuePaused: false, allowedActions: ['readUpdates', 'scheduleUpdates'] });
const reply = data => new Response(JSON.stringify(data), { status: 200 });

test('identity requires the brand serviceId and public profile, not a display name', () => {
  for (const platform of ['linkedin', 'instagram']) {
    const correct = account(platform);
    assert.equal(assertCarouselAccount(correct, platform).serviceId, CAROUSEL_ACCOUNTS[platform].serviceId);
    for (const patch of [
      { id: 'other' }, { service: 'twitter' }, { serviceId: 'other' }, { externalLink: 'https://example.test/hashtagweb3' },
      { externalLink: `${correct.externalLink}?identity=hashtagweb3` }, { externalLink: correct.externalLink.replace('https:', 'http:') },
      { isDisconnected: true }, { isLocked: true }, { isQueuePaused: true }, { allowedActions: ['readUpdates'] },
    ]) assert.throws(() => assertCarouselAccount({ ...correct, ...patch }, platform));
  }
  assert.throws(() => assertCarouselAccount({ ...account('linkedin'), type: 'profile', externalLink: 'https://www.linkedin.com/in/easton-augustine-7a45aa102/' }, 'linkedin'));
  assert.throws(() => assertCarouselAccount({ ...account('linkedin'), id: '6a134180c687a22dd420e089', externalLink: 'https://www.linkedin.com/company/cvinbio/' }, 'linkedin'));
  assert.equal(assertCarouselAccount({ ...account('linkedin'), serviceId: 'urn:li:organization:89714573' }, 'linkedin').serviceId, '89714573');
  assert.throws(() => assertCarouselAccount({ ...account('linkedin'), serviceId: 'urn:li:person:89714573' }, 'linkedin'));
  assert.throws(() => assertCarouselAccount({ ...account('instagram'), name: 'hashtag_web3' }, 'instagram'));
});

test('caption limits use UTF-16, Instagram double newlines and LinkedIn 24-unit URLs', () => {
  assert.equal(carouselCaptionUnits('a\nb😀', 'instagram'), 6);
  assert.equal(carouselCaptionUnits('https://hashtagweb3.com/a-long-resource/li', 'linkedin'), 24);
  assert.equal(carouselCaptionUnits('hashtagweb3.com/learn/li', 'linkedin'), 24);
  assert.doesNotThrow(() => assertCarouselCaption('😀'.repeat(1098), 'instagram'));
  assert.throws(() => assertCarouselCaption('😀'.repeat(1099), 'instagram'), /limit/);
  assert.doesNotThrow(() => assertCarouselCaption(`${'a'.repeat(2193)}\nb`, 'instagram'));
  assert.throws(() => assertCarouselCaption(`${'a'.repeat(2194)}\nb`, 'instagram'), /limit/);
  assert.doesNotThrow(() => assertCarouselCaption('a'.repeat(3000), 'linkedin'));
  assert.throws(() => assertCarouselCaption('a'.repeat(3001), 'linkedin'), /limit/);
  for (const platform of ['linkedin', 'instagram']) {
    assert.doesNotThrow(() => assertCarouselCaption('#one #two #three #four #five', platform));
    assert.throws(() => assertCarouselCaption('#one #two #three #four #five #six', platform), /five hashtags/);
  }
});

test('provider defaults to read-only and never sends a create request without a checkpoint callback', async () => {
  let calls = 0;
  const fetcher = async () => { calls++; throw new Error('unexpected fetch'); };
  await assert.rejects(carouselProviderClient('linkedin', { fetcher }).create({ platform: 'linkedin' }, async () => {}), /Read-only/);
  await assert.rejects(carouselProviderClient('instagram', { fetcher, readOnly: false }).create({ platform: 'instagram' }), /checkpoint callback/);
  assert.equal(calls, 0);
});

test('history includes all statuses and paginates beyond the first 100 before declaring no duplicate', async () => {
  const pages = [];
  const channel = account('instagram');
  const client = carouselProviderClient('instagram', { env: { BUFFER_ACCESS_TOKEN: 'mock-token' }, fetcher: async (url, init) => {
    assert.equal(url, 'https://api.buffer.com');
    const { query, variables } = JSON.parse(init.body);
    assert.match(query, /^query /); assert.match(query, /status:\[draft,error,needs_approval,scheduled,sending,sent\]/);
    pages.push(variables.after);
    return reply({ data: { posts: { edges: [{ node: { id: variables.after ? 'old-match' : 'recent', text: variables.after ? 'matching-caption' : 'other', channelId: channel.id } }], pageInfo: { hasNextPage: !variables.after, endCursor: 'next-page' } } } });
  } });
  const history = await client.history(channel);
  assert.deepEqual(pages, [null, 'next-page']);
  assert.equal(history[1].text, 'matching-caption');
});

test('incomplete or looping history fails closed', async () => {
  for (const pageInfo of [null, { hasNextPage: true, endCursor: 'same' }]) {
    let calls = 0;
    const client = carouselProviderClient('linkedin', { env: { BUFFER_ACCESS_TOKEN: 'mock-token' }, fetcher: async () => {
      calls++; return reply({ data: { posts: { edges: [], pageInfo } } });
    } });
    await assert.rejects(client.history(account('linkedin')), /incomplete|stalled/);
    assert.ok(calls <= 2);
  }
});
