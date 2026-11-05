import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const key = process.env.RESEND_API_KEY;
const mode = process.env.REPLY_MODE || 'lookup'; // lookup | send
const emailId = process.env.REPLY_EMAIL_ID;
const subject = process.env.REPLY_SUBJECT;
const bodyText = process.env.REPLY_BODY_TEXT;
const bodyHtml = process.env.REPLY_BODY_HTML || '';
const confirm = process.env.REPLY_CONFIRM;
const GITHUB = 'https://api.github.com/repos/vedangvatsa/Web3-Jobs';
const headers = { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json' };

function fail(msg) {
  console.error(`resend-reply: ${msg}`);
  process.exit(1);
}

if (!key) fail('RESEND_API_KEY missing');
if (!emailId || !/^[a-f0-9-]{36}$/.test(emailId)) fail('REPLY_EMAIL_ID must be a Resend email id');

async function lookup() {
  const res = await fetch(`https://api.resend.com/emails/${encodeURIComponent(emailId)}`, {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(20_000),
  });
  const body = await res.text();
  if (!res.ok) fail(`lookup ${res.status}: ${body.slice(0, 300)}`);
  const data = JSON.parse(body);
  // Safe to print: recipient + subject + status; never secrets.
  console.log(JSON.stringify({ id: data.id, to: data.to, from: data.from, subject: data.subject, reply_to: data.reply_to, created_at: data.created_at, last_event: data.last_event, bcc: data.bcc, cc: data.cc }, null, 2));
  return data;
}

if (mode === 'lookup') { await lookup(); process.exit(0); }

// --- send mode ---
if (confirm !== 'yes') fail('REPLY_CONFIRM must be "yes" for send mode');
if (!subject || !bodyText) fail('REPLY_SUBJECT and REPLY_BODY_TEXT required for send mode');

const original = await lookup();
const to = original?.to?.[0] || original?.to;
if (!to || typeof to !== 'string') fail(`cannot resolve recipient: ${JSON.stringify(original?.to)}`);
if (original.last_event === 'bounced') {
  console.log('resend-reply: original bounced; NOT sending a reply into a dead address');
  process.exit(2);
}

const payload = {
  from: 'Hashtag Web3 <hi@hashtagweb3.com>',
  reply_to: 'hi@hashtagweb3.com',
  to: [to],
  subject: subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`,
  text: bodyText,
  ...(bodyHtml ? { html: bodyHtml } : {}),
};
const payloadSha256 = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

const path = `docs/publisher-outreach/reply-${emailId.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
let prior = null, sha = null;
{
  const res = await fetch(`${GITHUB}/contents/${path}?ref=main`, { headers, signal: AbortSignal.timeout(20_000) });
  if (res.ok) {
    const blob = await res.json();
    sha = blob.sha;
    prior = JSON.parse(Buffer.from(blob.content, 'base64').toString('utf8'));
    if (prior.providerId || prior.status === 'sent') {
      console.log('resend-reply: reply already recorded; idempotent stop. Run lookup mode to re-check instead.');
      process.exit(0);
    }
  }
}

const claimReceipt = {
  target: to,
  originalEmailId: emailId,
  originalSubject: original.subject,
  status: 'claimed',
  claimedAt: new Date().toISOString(),
  recipient: to,
  payload,
  payloadSha256,
  providerId: null,
};
async function writeReceipt(receipt, atSha, message) {
  const res = await fetch(`${GITHUB}/contents/${path}`, {
    method: 'PUT', headers, signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      branch: 'main', message,
      content: Buffer.from(JSON.stringify(receipt, null, 2) + '\n').toString('base64'),
      ...(atSha && { sha: atSha }),
    }),
  });
  if (!res.ok) fail(`receipt write ${res.status}; reply not sent${res.status >= 500 ? ' (transient — rerun safely)' : ''}`);
  const blob = await res.json();
  return blob.content?.sha;
}

const claimSha = await writeReceipt(claimReceipt, sha, `docs: claim reply [skip ci]`);

const sent = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `resend-reply-${emailId}-${payloadSha256}` },
  signal: AbortSignal.timeout(25_000),
  body: JSON.stringify(payload),
});
const sentBody = await sent.text();
if (!sent.ok) fail(`send ${sent.status}: ${sentBody.slice(0, 300)}`);
const sentData = JSON.parse(sentBody);
console.log('resend-reply: sent', JSON.stringify({ id: sentData.id, to }));

const finalReceipt = { ...claimReceipt, status: 'sent', sentAt: new Date().toISOString(), providerId: sentData.id };
for (let attempt = 0; ; attempt++) {
  const res = await fetch(`${GITHUB}/contents/${path}`, {
    method: 'PUT', headers, signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      branch: 'main', message: `docs: record reply ${sentData.id.slice(0, 8)} [skip ci]`,
      content: Buffer.from(JSON.stringify(finalReceipt, null, 2) + '\n').toString('base64'),
    }),
  });
  if (res.ok) { console.log('resend-reply: receipt recorded'); break; }
  if (res.status >= 500 && attempt < 4) {
    console.log(`receipt write got ${res.status}; retry ${attempt + 1}/4`);
    await new Promise((r) => setTimeout(r, 15_000 * (attempt + 1)));
    continue;
  }
  if (res.status === 409 && attempt < 4) {
    // Another writer moved the blob: re-read and merge ours on top.
    const cur = await fetch(`${GITHUB}/contents/${path}?ref=main`, { headers, signal: AbortSignal.timeout(20_000) });
    if (cur.ok) {
      const blob = await cur.json();
      const curReceipt = JSON.parse(Buffer.from(blob.content, 'base64').toString('utf8'));
      const merged = { ...curReceipt, ...finalReceipt };
      const retry = await fetch(`${GITHUB}/contents/${path}`, {
        method: 'PUT', headers, signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          branch: 'main', message: `docs: record reply ${sentData.id.slice(0, 8)} [skip ci]`,
          content: Buffer.from(JSON.stringify(merged, null, 2) + '\n').toString('base64'),
          sha: blob.sha,
        }),
      });
      if (retry.ok) { console.log('resend-reply: receipt recorded after merge'); break; }
    }
  }
  fail(`final receipt write ${res.status} — email ${sentData.id} IS delivered; record manually`);
}
