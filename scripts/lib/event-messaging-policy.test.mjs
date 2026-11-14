import assert from 'node:assert/strict';
import test from 'node:test';
import {
  OWN_COMMUNITY_HANDLES,
  findEventMessagingCommunityLink,
  findMessagingCommunityUrls,
  isOwnMessagingCommunityHandle,
} from './event-messaging-policy.mjs';
import { canImportEvent } from './event-retention.mjs';

test('every third-party messaging community URL variant is detected; own handles are allowed', () => {
  for (const url of [
    'https://t.me/somegroup',
    'http://t.me/+AbCdEf123',
    't.me/somegroup',
    'https://telegram.me/somegroup',
    'https://telegram.dog/somegroup',
    'https://chat.whatsapp.com/AbCdEf123',
    'https://wa.me/15551234567',
    'https://api.whatsapp.com/send?phone=15551234567',
    'https://whatsapp.com/channel/00AbCdEf',
    'https://whatsapp.com/invite/AbCdEf123',
    'https://discord.gg/abc123',
    'https://discord.com/invite/abc123',
    'https://discordapp.com/invite/abc123',
    'www.discord.gg/abc123',
  ]) {
    assert.equal(findMessagingCommunityUrls(`Join us at ${url} today`).length, 1, url);
  }
  for (const own of OWN_COMMUNITY_HANDLES) {
    assert.deepEqual(findMessagingCommunityUrls(`Join https://t.me/${own} for updates`), [], own);
    assert.deepEqual(findMessagingCommunityUrls(`Follow @${own}`), [], own);
  }
  assert.deepEqual(
    findMessagingCommunityUrls("TON is Telegram's blockchain and the event streams on Telegram."),
    [],
    'informational platform mentions without a community URL stay',
  );
  assert.deepEqual(findMessagingCommunityUrls(''), []);
  assert.deepEqual(findMessagingCommunityUrls(null), []);
});

test('deep-walk finds links in any record field, including nested payloads', () => {
  const hit = findEventMessagingCommunityLink({
    id: 'evt-1',
    name: 'Conference',
    descriptionSource: {
      method: 'matched-organizer-record',
      evidence: [{ url: 'https://luma.com/evt' }],
      extras: ['Agenda on the page', 'Community chat: https://discord.gg/abc123'],
    },
  });
  assert.ok(hit);
  assert.equal(hit.handle, 'abc123');
  assert.equal(hit.path, 'event.descriptionSource.extras[1]');
  assert.equal(findEventMessagingCommunityLink({
    id: 'evt-2',
    name: 'Clean',
    description: 'Join https://t.me/web3hiring for hiring updates',
    sources: ['luma-crypto'],
  }), null, 'own-site channels never trip the policy');
  assert.equal(findEventMessagingCommunityLink({ id: 'evt-3', nested: { deep: [{ safe: 'no links here' }] } }), null);
  assert.equal(findEventMessagingCommunityLink(null), null);
  assert.equal(findEventMessagingCommunityLink(undefined), null);
  assert.equal(findEventMessagingCommunityLink(42), null);
});

test('canImportEvent rejects records promoting third-party messaging communities in any field', () => {
  const linked = {
    id: 'linked',
    startDate: '2027-03-01',
    description: 'A solid conference.\n\nJoin our community: https://t.me/somegroup',
  };
  assert.equal(canImportEvent(linked, {}), false);
  assert.equal(canImportEvent({ ...linked, description: 'Clean copy only.' }, {}), true, 'same record without the link imports fine');
  assert.equal(canImportEvent({
    id: 'clean',
    startDate: '2027-03-01',
    description: 'A solid conference.',
    sourceVerification: { eventId: 'evt-9', url: 'https://t.me/web3newsfeed' },
  }, {}), true, 'site-owned channels stay importable');
  assert.equal(canImportEvent({
    id: 'clean',
    startDate: '2027-03-01',
    description: 'A solid conference.',
    descriptionSource: { method: 'official-section', extras: ['chat.whatsapp.com/Def456'] },
  }, {}), false, 'links hiding in nested metadata still block the import');
  // Existing guarantees keep working alongside the new rule.
  assert.equal(canImportEvent({ id: 'tomb', startDate: '2027-03-01' }, { tomb: { until: '2027-11-14T00:00:00.000Z', slugs: ['tomb'] } }, Date.parse('2026-11-14')), false);
  assert.equal(canImportEvent({ id: 'old', startDate: '2026-01-01', endDate: '2026-01-02' }, {}, Date.parse('2027-03-01')), false);
});

test('isOwnMessagingCommunityHandle is case-insensitive', () => {
  assert.equal(isOwnMessagingCommunityHandle('Web3Hiring'), true);
  assert.equal(isOwnMessagingCommunityHandle('HASHTAGWEB3'), true);
  assert.equal(isOwnMessagingCommunityHandle('somegroup'), false);
  assert.equal(isOwnMessagingCommunityHandle(''), false);
  assert.equal(isOwnMessagingCommunityHandle(undefined), false);
});
