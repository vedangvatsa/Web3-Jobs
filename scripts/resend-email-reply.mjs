import { createHash } from 'node:crypto';

const key = process.env.RESEND_API_KEY;
const receivedIds = process.env.REPLY_EMAIL_ID;
const mode = process.env.REPLY_MODE || 'lookup'; // lookup | batch-lookup | list | send
const emailIdParts = (receivedIds || '').split(',').map(s => s.trim()).filter(Boolean);
const emailId = emailIdParts.length === 1 ? emailIdParts[0] : null;
const subject = process.env.REPLY_SUBJECT;
const bodyText = process.env.REPLY_BODY_TEXT;
const bodyHtml = process.env.REPLY_BODY_HTML || '';
const confirm = process.env.REPLY_CONFIRM;
const RECV = 'https://api.resend.com/emails/receiving';
const GITHUB = 'https://api.github.com/repos/vedangvatsa/Web3-Jobs';
const headers = { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'hashtagweb3-outreach/1.0' };

function fail(msg) {
  console.error(`resend-reply: ${msg}`);
  process.exit(1);
}

if (!key) fail('RESEND_API_KEY missing');
if (mode === 'batch-lookup') {
  if (!emailIdParts.length) fail('REPLY_EMAIL_ID supports comma-separated ids for batch-lookup');
  for (const id of emailIdParts) {
    if (!/^[a-f0-9-]{36}$/.test(id)) fail(`bad email id: ${id}`);
    try { summary(await getReceived(id)); } catch (e) { console.log(JSON.stringify({ lookupError: String(e).slice(0, 120), id })); }
    console.log('-----8<-----');
  }
  process.exit(0);
}
if (['lookup', 'send'].includes(mode) && (!emailId || !/^[a-f0-9-]{36}$/.test(emailId))) fail('REPLY_EMAIL_ID must be a single Resend email id');

async function getReceived(id) {
  const res = await fetch(`${RECV}/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${key}`, 'User-Agent': 'hashtagweb3-outreach/1.0' },
    signal: AbortSignal.timeout(25_000),
  });
  const bodyText = await res.text();
  if (!res.ok) fail(`receive lookup ${res.status}: ${bodyText.slice(0, 300)}`);
  const data = JSON.parse(bodyText);
  return data;
}

function summary(data) {
  const text = (data.text || '').trim();
  const htmlStripped = text || String(data.html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  console.log(JSON.stringify({
    id: data.id,
    from: data.from,
    to: data.to,
    subject: data.subject,
    message_id: data.message_id,
    created_at: data.created_at,
    authentication: data.authentication,
    createdAt: data.created_at,
    bodyPreview: htmlStripped.slice(0, 2500),
  }, null, 2));
}

if (mode === 'list') {
  let after = '';
  const all = [];
  do {
    const res = await fetch(`${RECV}?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`, {
      headers: { Authorization: `Bearer ${key}`, 'User-Agent': 'hashtagweb3-outreach/1.0' },
      signal: AbortSignal.timeout(25_000),
    });
    const body = await res.text();
    if (!res.ok) fail(`list ${res.status}: ${body.slice(0, 200)}`);
    const data = JSON.parse(body);
    all.push(...data.data);
    after = data.has_more && data.data.length ? data.data[data.data.length - 1].id : '';
  } while (after);
  const inventory = {
    generatedAt: new Date().toISOString(),
    count: all.length,
    emails: all.map((e) => ({ id: e.id, from: e.from, to: e.to, subject: e.subject, created_at: e.created_at })),
  };
  const path = `docs/publisher-outreach/received-emails-inventory-${new Date().toISOString().slice(0, 10)}.json`;
  const content = Buffer.from(JSON.stringify(inventory, null, 2) + '\n').toString('base64');
  let sha;
  {
    const r = await fetch(`${GITHUB}/contents/${path}?ref=main`, { headers, signal: AbortSignal.timeout(20_000) });
    if (r.ok) sha = (await r.json()).sha;
  }
  const put = await fetch(`${GITHUB}/contents/${path}`, {
    method: 'PUT', headers, signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({ branch: 'main', message: 'docs: received-emails inventory snapshot [skip ci]', content, ...(sha && { sha }) }),
  });
  console.log(JSON.stringify({ count: all.length, inventoryPath: path, inventoryWriteStatus: put.status }));
  process.exit(0);
}

const received = await getReceived(emailId);

if (mode === 'lookup') { summary(received); process.exit(0); }

// --- send mode ---
if (confirm !== 'yes') fail('REPLY_CONFIRM must be "yes" for send mode');
if (!subject || !bodyText) fail('REPLY_SUBJECT and REPLY_BODY_TEXT required for send mode');

const inboxAddress = (Array.isArray(received.to) ? received.to[0] : received.to);
if (!inboxAddress) fail('cannot resolve inbound mailbox address');
const fromAddress = /@hashtagweb3\.com$/i.test(inboxAddress) ? `Hashtag Web3 <${inboxAddress}>` : null;
if (!fromAddress) fail(`refusing to reply from non-hashtagweb3.com mailbox: ${inboxAddress}`);
const matches = received.from.match(/[\w.+-]+@[\w.-]+/g) || [];
const toAddress = matches[matches.length - 1];
if (!toAddress) fail(`cannot resolve sender address of ${received.from}`);
const messageId = received.message_id;
if (!messageId) fail('received email has no message_id; cannot thread');
// Caller supplies the exact desired reply subject — normally the thread's original
// subject, which already carries Re:/返信 markers or a helpdesk prefix like [Readly].
const replySubject = subject;

const payload = {
  from: fromAddress,
  reply_to: inboxAddress,
  to: [toAddress],
  subject: replySubject,
  text: bodyText,
  ...(bodyHtml ? { html: bodyHtml } : {}),
  headers: {
    'In-Reply-To': messageId,
    'References': messageId,
  },
};
const payloadSha256 = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

const path = `docs/publisher-outreach/reply-thread-${emailId.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
let sha = null;
{
  const res = await fetch(`${GITHUB}/contents/${path}?ref=main`, { headers, signal: AbortSignal.timeout(20_000) });
  if (res.ok) {
    const blob = await res.json();
    sha = blob.sha;
    const prior = JSON.parse(Buffer.from(blob.content, 'base64').toString('utf8'));
    if (prior.providerId || prior.status === 'sent') {
      console.log('resend-reply: reply already recorded for this thread; idempotent stop.');
      process.exit(0);
    }
  }
}

const claimReceipt = {
  target: toAddress,
  channel: 'inbound-reply',
  originalReceivedEmailId: emailId,
  originalMessageId: messageId,
  originalSubject: received.subject,
  originalFrom: received.from,
  status: 'claimed',
  claimedAt: new Date().toISOString(),
  recipient: toAddress,
  payload,
  payloadSha256,
  providerId: null,
};
async function writeClaim(receipt, atSha, message) {
  const res = await fetch(`${GITHUB}/contents/${path}`, {
    method: 'PUT', headers, signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      branch: 'main', message,
      content: Buffer.from(JSON.stringify(receipt, null, 2) + '\n').toString('base64'),
      ...(atSha && { sha: atSha }),
    }),
  });
  if (!res.ok) fail(`claim receipt write ${res.status}; reply not sent${res.status >= 500 ? ' (transient — rerun safely)' : ''}`);
  const blob = await res.json();
  return blob.content?.sha;
}
const claimSha = await writeClaim(claimReceipt, sha, 'docs: claim inbound reply [skip ci]');

const sent = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'User-Agent': 'hashtagweb3-outreach/1.0', 'Idempotency-Key': `inbound-reply-${emailId}-${payloadSha256}` },
  signal: AbortSignal.timeout(25_000),
  body: JSON.stringify(payload),
});
const sentBody = await sent.text();
if (!sent.ok) fail(`send ${sent.status}: ${sentBody.slice(0, 300)}`);
const sentData = JSON.parse(sentBody);
console.log('resend-reply: sent', JSON.stringify({ id: sentData.id, to: toAddress, subject: replySubject }));

const finalReceipt = { ...claimReceipt, status: 'sent', sentAt: new Date().toISOString(), providerId: sentData.id };
for (let attempt = 0; ; attempt++) {
  // Updating an existing file via the contents API REQUIRES the blob sha — refetch it
  // every attempt in case another writer touched the file in between.
  let fsha;
  {
    const g = await fetch(`${GITHUB}/contents/${path}?ref=main`, { headers, signal: AbortSignal.timeout(20_000) });
    if (g.ok) fsha = (await g.json()).sha;
  }
  const res = await fetch(`${GITHUB}/contents/${path}`, {
    method: 'PUT', headers, signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      branch: 'main', message: `docs: record inbound reply ${sentData.id.slice(0, 8)} [skip ci]`,
      content: Buffer.from(JSON.stringify(finalReceipt, null, 2) + '\n').toString('base64'),
      ...(fsha && { sha: fsha }),
    }),
  });
  if (res.ok) { console.log('resend-reply: receipt recorded'); break; }
  if ((res.status === 422 || res.status === 409 || res.status >= 500) && attempt < 4) { await new Promise((r) => setTimeout(r, 12_000)); continue; }
  fail(`final receipt write ${res.status} — reply ${sentData.id} IS delivered; record manually later; email was sent`);
}
