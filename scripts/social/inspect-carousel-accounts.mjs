import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const secrets = [process.env.BUFFER_ACCESS_TOKEN, process.env.META_PAGE_TOKEN].filter(Boolean);
const redact = value => secrets.reduce((text, secret) => text.replaceAll(secret, '[redacted]').replaceAll(encodeURIComponent(secret), '[redacted]'), String(value));
const fields = 'id name service serviceId type externalLink organizationId isDisconnected isLocked isQueuePaused allowedActions';
async function query(source, variables) {
  assert.ok(process.env.BUFFER_ACCESS_TOKEN, 'Buffer token unavailable');
  assert.ok(source.startsWith('query '));
  const response = await fetch('https://api.buffer.com', { method: 'POST', headers: { Authorization: `Bearer ${process.env.BUFFER_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: source, variables }), signal: AbortSignal.timeout(30000) });
  const body = await response.json();
  if (!response.ok || body.errors?.length) throw new Error(redact(`Buffer read: HTTP ${response.status}; ${(body.errors || []).map(e => e.message).join('; ')}`));
  return body.data;
}
const results = { checkedAt: new Date().toISOString(), mode: 'read-only', linkedin: {}, instagram: {} };
try {
  const { channel } = await query(`query KnownBrandChannel($id:ChannelId!) {channel(input:{id:$id}) {${fields}}}`, { id: '69c5b139af47dacb695b5feb' });
  results.linkedin.configuredChannel = channel;
  if (channel?.organizationId) {
    const { channels } = await query(`query BrandChannels($org:OrganizationId!) {channels(input:{organizationId:$org}) {${fields}}}`, { org: channel.organizationId });
    results.instagram.bufferCandidates = channels.filter(c => c.service === 'instagram' && (c.serviceId === '17841473830256790' || /^hashtag_?\s?web3$/i.test(c.name.replace(/^@/, ''))));
  }
} catch (error) { results.linkedin.error = redact(error.message); }
try {
  const { channel } = await query(`query LegacyInstagramChannel($id:ChannelId!) {channel(input:{id:$id}) {${fields}}}`, { id: '69c5b180af47dacb695b611e' });
  results.instagram.configuredBufferChannel = channel;
} catch (error) { results.instagram.bufferError = redact(error.message); }
if (process.env.META_PAGE_TOKEN) {
  try {
    const response = await fetch('https://graph.facebook.com/v21.0/17841473830256790?fields=id,username,account_type', { headers: { Authorization: `Bearer ${process.env.META_PAGE_TOKEN}` }, signal: AbortSignal.timeout(30000) });
    const body = await response.json();
    if (!response.ok || body.error) throw new Error(`Meta read: HTTP ${response.status}; ${body.error?.message || 'unknown error'}`);
    assert.equal(body.id, '17841473830256790');
    assert.match(body.username, /^hashtag_?web3$/i);
    results.instagram.directAccount = body;
  } catch (error) { results.instagram.directError = redact(error.message); }
}
for (const platform of ['linkedin', 'instagram']) {
  const folder = `.cache/newknowledge-carousels/accounts/${platform}`;
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(`${folder}/discovery.json`, JSON.stringify({ checkedAt: results.checkedAt, mode: results.mode, ...results[platform] }, null, 2) + '\n');
}
console.log(JSON.stringify(results, null, 2));
