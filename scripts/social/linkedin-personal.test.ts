import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PersonalLinkedInClient, type PersonalLinkedInConfig } from './linkedin-personal';
import { authorizationUrl, callbackCode, SCOPES } from './authorize-linkedin-personal';
import { linkedInTargets, publishLinkedInTargets, hasLinkedInReceipt, type LinkedInReceipt } from './linkedin-targets';

const config: PersonalLinkedInConfig = { token: 'test-token', memberId: 'authorized-member', expiresAt: '2099-01-01T00:00:00Z', version: '202609' };
const link = { url: 'https://hashtagweb3.com/engineer/li?og=7', title: 'Engineer at Example', description: 'Remote engineering role' };
const member = { sub: config.memberId, name: 'Easton Augustine' };
function mockClient(responses: Response[], settings = config) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const request: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    const response = responses.shift();
    assert.ok(response, 'Unexpected network request');
    return response;
  };
  return { client: new PersonalLinkedInClient(settings, request), calls };
}
const json = (body: unknown) => Response.json(body);
const receipt = () => new Response(null, { status: 201, headers: { 'x-restli-id': 'urn:li:share:123456' } });

test('personal posting is opt-in and uses the OAuth member ID, not the vanity URL', () => {
  assert.equal(linkedInTargets({}).length, 2);
  const targets = linkedInTargets({ LINKEDIN_PERSONAL_ENABLED: 'true', LINKEDIN_PERSONAL_MEMBER_ID: config.memberId });
  assert.equal(targets.length, 3);
  assert.equal(targets[2].channelId, `urn:li:person:${config.memberId}`);
  assert.equal(targets[2].transport, 'direct');
  assert.equal(hasLinkedInReceipt([{ slug: 'engineer', platform: 'linkedin', postId: 'legacy' }], 'engineer', targets[2]), false);
});
test('publishes an explicit article as the authorized member with current REST headers', async () => {
  const { client, calls } = mockClient([json(member), receipt()]);
  assert.equal(await client.create('Example is hiring Engineer (Remote)', link), 'urn:li:share:123456');
  assert.equal(calls[1].url, 'https://api.linkedin.com/rest/posts');
  const headers = new Headers(calls[1].init?.headers);
  assert.equal(headers.get('LinkedIn-Version'), '202609');
  assert.equal(headers.get('X-Restli-Protocol-Version'), '2.0.0');
  const body = JSON.parse(String(calls[1].init?.body));
  assert.equal(body.author, 'urn:li:person:authorized-member');
  assert.equal(body.commentary, 'Example is hiring Engineer \\(Remote\\)');
  assert.deepEqual(body.content.article, { source: link.url, title: link.title, description: link.description });
});
test('wrong-member and expired tokens cannot create posts', async () => {
  const wrong = mockClient([json({ ...member, sub: 'another-member' })]);
  await assert.rejects(wrong.client.create('Job', link), /different member/);
  assert.equal(wrong.calls.length, 1);
  const expired = mockClient([], { ...config, expiresAt: '2000-01-01' });
  await assert.rejects(expired.client.create('Job', link), /expired/);
  assert.equal(expired.calls.length, 0);
});
test('uploads the existing PNG as a LinkedIn article thumbnail', async () => {
  const { client, calls } = mockClient([
    json(member), new Response(new Uint8Array(2048), { headers: { 'content-type': 'image/png' } }),
    json({ value: { image: 'urn:li:image:abc', uploadUrl: 'https://www.linkedin.com/dms-uploads/abc' } }),
    new Response(null, { status: 201 }), receipt(),
  ]);
  await client.create('Job', { ...link, thumbnail: 'https://hashtagweb3.com/og/jobs/engineer.png?v=7' });
  assert.equal(calls[3].init?.method, 'PUT');
  assert.equal(JSON.parse(String(calls[4].init?.body)).content.article.thumbnail, 'urn:li:image:abc');
  assert.ok(calls.every((call) => !call.url.includes('/rest/images/urn')));
});
test('never forwards an access token to a foreign upload host', async () => {
  const { client, calls } = mockClient([
    json(member), new Response(new Uint8Array(2048), { headers: { 'content-type': 'image/png' } }),
    json({ value: { image: 'urn:li:image:abc', uploadUrl: 'https://example.org/upload' } }),
  ]);
  await assert.rejects(client.create('Job', { ...link, thumbnail: 'https://hashtagweb3.com/og/jobs/engineer.png' }), /upload host/);
  assert.equal(calls.length, 3);
});
test('permission errors and missing post receipts fail rather than claiming publication', async () => {
  for (const response of [new Response(null, { status: 403 }), new Response(null, { status: 201 })]) {
    await assert.rejects(mockClient([json(member), response]).client.create('Job', link));
  }
});
test('personal failure leaves the two Buffer accounts independent and retryable by target', async () => {
  const targets = linkedInTargets({ LINKEDIN_PERSONAL_ENABLED: 'true', LINKEDIN_PERSONAL_MEMBER_ID: config.memberId });
  const history: LinkedInReceipt[] = [];
  const save = (target: typeof targets[number], postId: string) => { history.push({ slug: 'engineer', platform: 'linkedin', account: target.channelId, postId }); };
  const result = await publishLinkedInTargets(history, 'engineer', targets, async (target) => {
    if (target.transport === 'direct') throw new Error('Token expired');
    return `buffer-${target.name}`;
  }, save);
  assert.deepEqual(result.map((item) => item.status), ['submitted', 'submitted', 'failed']);
  const retry = await publishLinkedInTargets(history, 'engineer', targets, async (target) => {
    assert.equal(target.transport, 'direct');
    return 'urn:li:share:123456';
  }, save);
  assert.deepEqual(retry.map((item) => item.status), ['skipped', 'skipped', 'submitted']);
});
test('OAuth requests minimal scopes and validates redirect, state, expiry and denial', () => {
  const saved = { state: 'unpredictable-state', clientId: 'app-id', redirectUri: 'https://hashtagweb3.com/contact', createdAt: 1000 };
  const url = new URL(authorizationUrl(saved));
  assert.deepEqual(url.searchParams.get('scope')?.split(' '), SCOPES);
  assert.equal(url.searchParams.has('client_secret'), false);
  const callback = `${saved.redirectUri}?state=${saved.state}&code=private-code`;
  assert.equal(callbackCode(callback, saved, 2000), 'private-code');
  assert.throws(() => callbackCode(callback.replace(saved.state, 'wrong-state'), saved, 2000), /state mismatch/);
  assert.throws(() => callbackCode(callback.replace('hashtagweb3.com', 'example.org'), saved, 2000), /callback URL/);
  assert.throws(() => callbackCode(callback, saved, 2000000), /expired/);
  assert.throws(() => callbackCode(`${saved.redirectUri}?state=${saved.state}&error=user_cancelled_authorize`, saved, 2000), /declined/);
});
