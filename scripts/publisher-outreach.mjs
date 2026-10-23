import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const targets = {
  msn: { name: 'MSN Partner Hub', to: 'partnerhubsupport@microsoft.com', source: 'https://support.microsoft.com/en-us/msn/partner-hub/msn-feed-setup-and-configuration' },
  newsbreak: { name: 'NewsBreak', to: 'publishers@newsbreak.com', source: 'https://publishers.newsbreak.com/' },
};
const target = targets[process.env.PUBLISHER_TARGET];
if (!target) throw new Error('Choose msn or newsbreak.');
const payload = {
  from: 'Hashtag Web3 <hi@hashtagweb3.com>',
  reply_to: 'hi@hashtagweb3.com',
  to: [target.to],
  subject: `Hashtag Web3: publisher onboarding and automatic news-feed distribution`,
  text: `Hello ${target.name} team,

We would like to apply for publisher onboarding for Hashtag Web3, a United States organization publishing English-language crypto and Web3 news.

Publication: https://hashtagweb3.com/news
About: https://hashtagweb3.com/about
Contact: hi@hashtagweb3.com
Example native article: https://hashtagweb3.com/bitgetthai

We want to connect an ongoing feed of our native news articles after approval. Our news listing also links to external publishers; those external stories would not be supplied as our own content. Our workflow uses AI-assisted research and drafting with source and publication checks. Please advise on your AI disclosure and editorial requirements.

An RSS endpoint at https://hashtagweb3.com/news/feed.xml is prepared for our next website release; it is not yet available on the live site. We can provide and validate the required full-content feed and image rights information during onboarding.

Could you confirm whether you are accepting publishers in this subject area and provide the application or invitation process, feed requirements, and any agreement for our authorized representative to review?

Thank you,
Hashtag Web3
hi@hashtagweb3.com`,
};
const mode = process.env.PUBLISHER_MODE || 'preview';
if (!['preview', 'send', 'readback'].includes(mode)) throw new Error('Invalid mode.');
if (mode === 'preview') {
  console.log(JSON.stringify({ target, payload }, null, 2));
} else {
  const token = process.env.GH_TOKEN;
  const key = process.env.RESEND_API_KEY;
  if (!token || !key) throw new Error('Missing required credentials.');
  if (process.env.GITHUB_REPOSITORY !== 'vedangvatsa/Web3-Jobs') throw new Error('Wrong repository.');
  const path = `docs/publisher-outreach/${process.env.PUBLISHER_TARGET}-2026-10-23.json`;
  const endpoint = `https://api.github.com/repos/vedangvatsa/Web3-Jobs/contents/${path}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' };
  const response = await fetch(`${endpoint}?ref=main`, { headers, signal: AbortSignal.timeout(20_000) });
  const prior = response.ok ? await response.json() : null;
  if (!response.ok && response.status !== 404) throw new Error(`Receipt read failed: ${response.status}`);
  let sha = prior?.sha;
  let receipt = prior ? JSON.parse(Buffer.from(prior.content, 'base64').toString('utf8')) : null;
  async function checkpoint() {
    await writeFile('publisher-outreach-result.json', JSON.stringify(receipt, null, 2) + '\n');
    const saved = await fetch(endpoint, {
      method: 'PUT', headers, signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({ branch: 'main', message: `docs: checkpoint ${process.env.PUBLISHER_TARGET} publisher inquiry [skip ci]`, content: Buffer.from(JSON.stringify(receipt, null, 2) + '\n').toString('base64'), ...(sha && { sha }) }),
    });
    if (!saved.ok) throw new Error(`Receipt write failed: ${saved.status}; do not resend.`);
    const ack = await saved.json();
    if (!ack.content?.sha || !ack.commit?.sha) throw new Error('Receipt acknowledgement missing; do not resend.');
    sha = ack.content.sha;
  }
  if (mode === 'send') {
    if (receipt) throw new Error('Inquiry already claimed. Use readback; never resend automatically.');
    receipt = { platform: process.env.PUBLISHER_TARGET, status: 'claimed', claimedAt: new Date().toISOString(), recipient: target.to, recipientSource: target.source, payload, payloadSha256: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), providerId: null };
    await checkpoint();
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(30_000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `publisher-inquiry-${process.env.PUBLISHER_TARGET}-${receipt.payloadSha256}` },
      body: JSON.stringify(payload),
    });
    const result = await sent.json();
    if (!sent.ok || !result.id) {
      receipt.status = 'unconfirmed';
      receipt.httpStatus = sent.status;
      await checkpoint();
      throw new Error(`Email not confirmed: ${sent.status}. Inspect provider before any retry.`);
    }
    receipt.providerId = result.id;
    receipt.status = 'accepted_by_resend';
    receipt.acceptedAt = new Date().toISOString();
    await checkpoint();
  }
  if (!receipt?.providerId) throw new Error('No known provider ID; manual reconciliation required.');
  const check = await fetch(`https://api.resend.com/emails/${encodeURIComponent(receipt.providerId)}`, {
    headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20_000),
  });
  if (check.ok) {
    const evidence = await check.json();
    if (evidence.id !== receipt.providerId || evidence.from !== payload.from || JSON.stringify(evidence.to) !== JSON.stringify(payload.to)) throw new Error('Provider identity mismatch.');
    receipt.providerEvent = evidence.last_event || null;
    receipt.checkedAt = new Date().toISOString();
    await checkpoint();
  }
  console.log(JSON.stringify({ platform: receipt.platform, status: receipt.status, providerId: receipt.providerId, providerEvent: receipt.providerEvent || null }));
}
