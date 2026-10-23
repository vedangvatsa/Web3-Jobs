import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const ROOT = 'docs/publisher-expansion-targets.json';
const RECEIPT_DIR = 'docs/publisher-outreach';

const reachBulletsText = `- 55 million job-post views in the last year
- Weekly X (Twitter) Spaces with guests including a Pink Floyd band member, EY partners, the "Father of Digital Twin," and a former Microsoft CSO, drawing 20,000–40,000 live listeners
- 26 million LinkedIn views last month
- 150,000 newsletter subscribers
- 60,000 Telegram channel subscribers
- Event partnerships including Harvard Blockchain Conference, ETH Vietnam, Oxford Blockchain Conference, Token2049, Taipei Blockchain Week, ETH Oxford, Gitex and ETH Brussels`;

const reachBulletsHtml = `<ul>
<li><strong>55 million job-post views</strong> in the last year</li>
<li>Weekly X (Twitter) Spaces with guests including a Pink Floyd band member, EY partners, the &ldquo;Father of Digital Twin,&rdquo; and a former Microsoft CSO, drawing <strong>20,000&ndash;40,000 live listeners</strong></li>
<li><strong>26 million LinkedIn views</strong> last month</li>
<li><strong>150,000 newsletter subscribers</strong></li>
<li><strong>60,000 Telegram channel subscribers</strong></li>
<li>Event partnerships including Harvard Blockchain Conference, ETH Vietnam, Oxford Blockchain Conference, Token2049, Taipei Blockchain Week, ETH Oxford, Gitex and ETH Brussels</li>
</ul>`;

function link(label) {
  return `<a href="${label}">${label}</a>`;
}

function buildPayload(targetName, email) {
  const subject = `Hashtag Web3: publisher onboarding and automatic news-feed distribution`;
  const html = `<p>Hello ${targetName} team,</p>
<p>We would like to apply for publisher onboarding for Hashtag Web3, a United States organization publishing English-language crypto and Web3 news.</p>
<p>
Publication: ${link('https://hashtagweb3.com/news')}<br>
About: ${link('https://hashtagweb3.com/about')}<br>
Community: ${link('https://hashtagweb3.com/community')}<br>
Contact: <a href="mailto:hi@hashtagweb3.com">hi@hashtagweb3.com</a><br>
Example native article: ${link('https://hashtagweb3.com/bitgetthai')}
</p>
<p>A few figures that describe our reach:</p>
${reachBulletsHtml}
<p>We want to connect an ongoing feed of our native news articles after approval. Our news listing also links to external publishers; those external stories would not be supplied as our own content. Our workflow uses AI-assisted research and drafting with source and publication checks. Please advise on your AI disclosure and editorial requirements.</p>
<p>RSS: ${link('https://hashtagweb3.com/news/feed.xml')} (headlines, summaries, original dates and canonical links). We can provide and validate the required full-content feed and image rights information during onboarding.</p>
<p>Could you confirm whether you are accepting publishers in this subject area and provide the application or invitation process, feed requirements, and any agreement for our authorized representative to review?</p>
<p>Thank you,<br>Hashtag Web3<br><a href="mailto:hi@hashtagweb3.com">hi@hashtagweb3.com</a></p>`;
  const text = `Hello ${targetName} team,

We would like to apply for publisher onboarding for Hashtag Web3, a United States organization publishing English-language crypto and Web3 news.

Publication: https://hashtagweb3.com/news
About: https://hashtagweb3.com/about
Community: https://hashtagweb3.com/community
Contact: hi@hashtagweb3.com
Example native article: https://hashtagweb3.com/bitgetthai

A few figures that describe our reach:
${reachBulletsText}

We want to connect an ongoing feed of our native news articles after approval. Our news listing also links to external publishers; those external stories would not be supplied as our own content. Our workflow uses AI-assisted research and drafting with source and publication checks. Please advise on your AI disclosure and editorial requirements.

RSS: https://hashtagweb3.com/news/feed.xml (headlines, summaries, original dates and canonical links). We can provide and validate the required full-content feed and image rights information during onboarding.

Could you confirm whether you are accepting publishers in this subject area and provide the application or invitation process, feed requirements, and any agreement for our authorized representative to review?

Thank you,
Hashtag Web3
hi@hashtagweb3.com`;
  return {
    from: 'Hashtag Web3 <hi@hashtagweb3.com>',
    reply_to: 'hi@hashtagweb3.com',
    to: [email],
    subject,
    html,
    text,
  };
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function loadTargets() {
  return JSON.parse(await readFile(ROOT, 'utf8'));
}

const mode = process.env.EXPANSION_MODE || 'preview';
const targetFilter = process.env.EXPANSION_TARGET || null;
const dryRun = process.env.EXPANSION_DRY_RUN === 'true';
const limit = Number(process.env.EXPANSION_LIMIT || '0');

if (!['preview', 'list', 'send', 'readback'].includes(mode)) {
  throw new Error('EXPANSION_MODE must be preview|list|send|readback');
}

const registry = await loadTargets();
let targets = registry.targets.filter((t) => t.email);
if (targetFilter) {
  targets = targets.filter((t) => slugify(t.name) === targetFilter || t.name.toLowerCase() === targetFilter.toLowerCase());
}
if (limit > 0) targets = targets.slice(0, limit);

if (mode === 'list') {
  console.log(JSON.stringify({
    totalEmailTargets: registry.targets.filter((t) => t.email).length,
    totalFormTargets: registry.targets.filter((t) => t.formUrls?.length).length,
    selected: targets.map((t) => ({ name: t.name, email: t.email, route: t.route })),
  }, null, 2));
  process.exit(0);
}

if (mode === 'preview') {
  for (const t of targets) {
    const payload = buildPayload(t.name, t.email);
    console.log(JSON.stringify({ name: t.name, email: t.email, subject: payload.subject, htmlHasAnchors: payload.html.includes('<a href="https://hashtagweb3.com'), hasReach: payload.text.includes('55 million job-post views') }, null, 2));
  }
  process.exit(0);
}

const token = process.env.GH_TOKEN;
const key = process.env.RESEND_API_KEY;
if (!token || !key) throw new Error('Missing GH_TOKEN or RESEND_API_KEY.');
if (process.env.GITHUB_REPOSITORY !== 'vedangvatsa/Web3-Jobs') throw new Error('Wrong repository.');

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
};

async function readReceipt(path) {
  const endpoint = `https://api.github.com/repos/vedangvatsa/Web3-Jobs/contents/${path}`;
  const response = await fetch(`${endpoint}?ref=main`, { headers, signal: AbortSignal.timeout(20_000) });
  if (response.status === 404) return { sha: null, receipt: null };
  if (!response.ok) throw new Error(`Receipt read failed: ${response.status}`);
  const data = await response.json();
  return { sha: data.sha, receipt: JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')) };
}

async function writeReceipt(path, receipt, sha, message) {
  const endpoint = `https://api.github.com/repos/vedangvatsa/Web3-Jobs/contents/${path}`;
  const saved = await fetch(endpoint, {
    method: 'PUT',
    headers,
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({
      branch: 'main',
      message,
      content: Buffer.from(JSON.stringify(receipt, null, 2) + '\n').toString('base64'),
      ...(sha && { sha }),
    }),
  });
  if (!saved.ok) throw new Error(`Receipt write failed: ${saved.status}; do not resend.`);
  const ack = await saved.json();
  if (!ack.content?.sha || !ack.commit?.sha) throw new Error('Receipt acknowledgement missing; do not resend.');
  return ack.content.sha;
}

await mkdir('outbox', { recursive: true });
const results = [];

for (const t of targets) {
  const slug = slugify(t.name);
  const path = `${RECEIPT_DIR}/expansion-${slug}-2026-10-23.json`;
  const payload = buildPayload(t.name, t.email);
  const payloadSha256 = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const localPath = `outbox/expansion-${slug}.json`;
  await writeFile(localPath, JSON.stringify({ path, payload }, null, 2) + '\n');

  if (mode === 'readback') {
    const { receipt } = await readReceipt(path);
    if (!receipt?.providerId) {
      results.push({ name: t.name, status: 'no-receipt-or-id' });
      continue;
    }
    const check = await fetch(`https://api.resend.com/emails/${encodeURIComponent(receipt.providerId)}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(20_000),
    });
    if (check.ok) {
      const evidence = await check.json();
      receipt.providerEvent = evidence.last_event || null;
      receipt.checkedAt = new Date().toISOString();
      const { sha } = await readReceipt(path);
      await writeReceipt(path, receipt, sha, `docs: readback expansion ${slug} [skip ci]`);
      results.push({ name: t.name, status: receipt.status, providerId: receipt.providerId, providerEvent: receipt.providerEvent });
    } else {
      results.push({ name: t.name, status: receipt.status, providerId: receipt.providerId, readbackHttp: check.status });
    }
    continue;
  }

  if (mode !== 'send') throw new Error('unreachable');

  if (dryRun) {
    results.push({ name: t.name, email: t.email, status: 'dry-run', path });
    continue;
  }

  const { sha, receipt: prior } = await readReceipt(path);
  if (prior) {
    results.push({ name: t.name, status: prior.status || 'already-claimed', providerId: prior.providerId || null, note: 'skipped existing receipt' });
    continue;
  }

  let receipt = {
    platform: 'expansion',
    target: t.name,
    slug,
    status: 'claimed',
    claimedAt: new Date().toISOString(),
    recipient: t.email,
    recipientSource: t.emailSource || t.url,
    payload,
    payloadSha256,
    providerId: null,
  };
  let currentSha = await writeReceipt(path, receipt, null, `docs: claim expansion publisher inquiry ${slug} [skip ci]`);
  await writeFile('publisher-expansion-result.json', JSON.stringify(receipt, null, 2) + '\n');

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `publisher-expansion-${slug}-${payloadSha256}`,
    },
    body: JSON.stringify(payload),
  });
  const result = await sent.json();
  if (!sent.ok || !result.id) {
    receipt.status = 'unconfirmed';
    receipt.httpStatus = sent.status;
    receipt.providerError = result?.message || null;
    currentSha = await writeReceipt(path, receipt, currentSha, `docs: unconfirmed expansion ${slug} [skip ci]`);
    results.push({ name: t.name, status: 'unconfirmed', httpStatus: sent.status });
    continue;
  }
  receipt.providerId = result.id;
  receipt.status = 'accepted_by_resend';
  receipt.acceptedAt = new Date().toISOString();
  currentSha = await writeReceipt(path, receipt, currentSha, `docs: accepted expansion publisher inquiry ${slug} [skip ci]`);
  results.push({ name: t.name, status: receipt.status, providerId: receipt.providerId });
}

console.log(JSON.stringify({ mode, dryRun, count: results.length, results }, null, 2));
