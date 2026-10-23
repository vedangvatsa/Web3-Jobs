import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const targets = {
  msn: { name: 'MSN Partner Hub', to: 'partnerhubsupport@microsoft.com', source: 'https://support.microsoft.com/en-us/msn/partner-hub/msn-feed-setup-and-configuration' },
  newsbreak: { name: 'NewsBreak', to: 'publishers@newsbreak.com', source: 'https://publishers.newsbreak.com/' },
};
const target = targets[process.env.PUBLISHER_TARGET];
if (!target) throw new Error('Choose msn or newsbreak.');
const message = process.env.PUBLISHER_MESSAGE || 'initial';
if (!['initial', 'community-profile'].includes(message)) throw new Error('Choose an approved publisher message.');
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
const anchors = {
  news: { label: 'https://hashtagweb3.com/news', url: 'https://hashtagweb3.com/news' },
  about: { label: 'https://hashtagweb3.com/about', url: 'https://hashtagweb3.com/about' },
  community: { label: 'https://hashtagweb3.com/community', url: 'https://hashtagweb3.com/community' },
  resources: { label: 'https://hashtagweb3.com/resources', url: 'https://hashtagweb3.com/resources' },
  rss: { label: 'https://hashtagweb3.com/news/feed.xml', url: 'https://hashtagweb3.com/news/feed.xml' },
  sampleBitget: { label: 'https://hashtagweb3.com/bitgetthai', url: 'https://hashtagweb3.com/bitgetthai' },
  sampleSecstocks: { label: 'https://hashtagweb3.com/secstocks', url: 'https://hashtagweb3.com/secstocks' },
  sampleFcadefi: { label: 'https://hashtagweb3.com/fcadefi', url: 'https://hashtagweb3.com/fcadefi' },
  sampleFireblocks: { label: 'https://hashtagweb3.com/fireblocksvisa', url: 'https://hashtagweb3.com/fireblocksvisa' },
};
const a = (key) => `<a href="${anchors[key].url}">${anchors[key].label}</a>`;
const initialPayload = {
  from: 'Hashtag Web3 <hi@hashtagweb3.com>',
  reply_to: 'hi@hashtagweb3.com',
  to: [target.to],
  subject: `Hashtag Web3: publisher onboarding and automatic news-feed distribution`,
  html: `<p>Hello ${target.name} team,</p>
<p>We would like to apply for publisher onboarding for Hashtag Web3, a United States organization publishing English-language crypto and Web3 news.</p>
<p>
Publication: ${a('news')}<br>
About: ${a('about')}<br>
Community: ${a('community')}<br>
Contact: hi@hashtagweb3.com<br>
Example native article: ${a('sampleBitget')}
</p>
<p>A few figures that describe our reach:</p>
${reachBulletsHtml}
<p>We want to connect an ongoing feed of our native news articles after approval. Our news listing also links to external publishers; those external stories would not be supplied as our own content. Our workflow uses AI-assisted research and drafting with source and publication checks. Please advise on your AI disclosure and editorial requirements.</p>
<p>RSS: ${a('rss')} (headlines, summaries, original dates and canonical links). We can provide and validate the required full-content feed and image rights information during onboarding.</p>
<p>Could you confirm whether you are accepting publishers in this subject area and provide the application or invitation process, feed requirements, and any agreement for our authorized representative to review?</p>
<p>Thank you,<br>Hashtag Web3<br><a href="mailto:hi@hashtagweb3.com">hi@hashtagweb3.com</a></p>`,
  text: `Hello ${target.name} team,

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
hi@hashtagweb3.com`,
};
const payload = message === 'initial' ? initialPayload : {
  from: initialPayload.from, reply_to: initialPayload.reply_to, to: initialPayload.to,
  subject: 'Hashtag Web3 publisher inquiry: community profile, reach and live news feed',
  html: `<p>Hello ${target.name} team,</p>
<p>Following our publisher-onboarding inquiry, we would like to share a fuller introduction to Hashtag Web3 and confirm that our news feed is live.</p>
<p>Hashtag Web3 is a global Web3 community of over 100,000 professionals and a knowledge and original news publisher. Our audience includes developers, founders, investors, operators, marketers and product teams working across blockchain and crypto.</p>
<p>Our community profile is the best introduction to our reach, channels and work: ${a('community')}</p>
<p>A few figures that describe our reach:</p>
${reachBulletsHtml}
<p>Alongside original crypto and Web3 news, we publish blockchain and career guides, interview preparation, salary resources and practical tools. Our community activities include founder interviews, demo days and industry-event collaborations, with examples involving Onepiece Labs and Sei, Obortech, and AltLayer documented on the community page. Members connect through Telegram, LinkedIn, regional WhatsApp groups, X Spaces and podcasts.</p>
<p>
News: ${a('news')}<br>
Knowledge and career resources: ${a('resources')}<br>
Live RSS feed: ${a('rss')}
</p>
<p>Recent native article samples:<br>
${a('sampleSecstocks')}<br>
${a('sampleFcadefi')}<br>
${a('sampleFireblocks')}
</p>
<p>The RSS feed contains our native articles' headlines, summaries, original dates and canonical links. We can prepare your required full-content format during onboarding. Our workflow uses AI-assisted research and drafting with source and publication checks; we will follow your platform's disclosure requirements.</p>
<p>Publisher organization: Hashtag Web3<br>
Country: United States<br>
Contact: <a href="mailto:hi@hashtagweb3.com">hi@hashtagweb3.com</a></p>
<p>Please consider Hashtag Web3 for publisher onboarding and let us know the application or invitation steps for ongoing news-feed distribution.</p>
<p>Thank you,<br>Hashtag Web3<br><a href="mailto:hi@hashtagweb3.com">hi@hashtagweb3.com</a></p>`,
  text: `Hello ${target.name} team,

Following our publisher-onboarding inquiry, we would like to share a fuller introduction to Hashtag Web3 and confirm that our news feed is live.

Hashtag Web3 is a global Web3 community of over 100,000 professionals and a knowledge and original news publisher. Our audience includes developers, founders, investors, operators, marketers and product teams working across blockchain and crypto.

Our community profile is the best introduction to our reach, channels and work:
https://hashtagweb3.com/community

A few figures that describe our reach:
${reachBulletsText}

Alongside original crypto and Web3 news, we publish blockchain and career guides, interview preparation, salary resources and practical tools. Our community activities include founder interviews, demo days and industry-event collaborations, with examples involving Onepiece Labs and Sei, Obortech, and AltLayer documented on the community page. Members connect through Telegram, LinkedIn, regional WhatsApp groups, X Spaces and podcasts.

News: https://hashtagweb3.com/news
Knowledge and career resources: https://hashtagweb3.com/resources
Live RSS feed: https://hashtagweb3.com/news/feed.xml

Recent native article samples:
https://hashtagweb3.com/secstocks
https://hashtagweb3.com/fcadefi
https://hashtagweb3.com/fireblocksvisa

The RSS feed contains our native articles' headlines, summaries, original dates and canonical links. We can prepare your required full-content format during onboarding. Our workflow uses AI-assisted research and drafting with source and publication checks; we will follow your platform's disclosure requirements.

Publisher organization: Hashtag Web3
Country: United States
Contact: hi@hashtagweb3.com

Please consider Hashtag Web3 for publisher onboarding and let us know the application or invitation steps for ongoing news-feed distribution.

Thank you,
Hashtag Web3
hi@hashtagweb3.com`,
};
const mode = process.env.PUBLISHER_MODE || 'preview';
if (!['preview', 'send', 'readback'].includes(mode)) throw new Error('Invalid mode.');
if (mode === 'preview') {
  console.log(JSON.stringify({ target, message, payload }, null, 2));
} else {
  const token = process.env.GH_TOKEN;
  const key = process.env.RESEND_API_KEY;
  if (!token || !key) throw new Error('Missing required credentials.');
  if (process.env.GITHUB_REPOSITORY !== 'vedangvatsa/Web3-Jobs') throw new Error('Wrong repository.');
  const path = `docs/publisher-outreach/${process.env.PUBLISHER_TARGET}${message === 'initial' ? '' : '-community-profile'}-2026-10-23.json`;
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
    let followsUpProviderId;
    if (message === 'community-profile') {
      const original = await fetch(`https://api.github.com/repos/vedangvatsa/Web3-Jobs/contents/docs/publisher-outreach/${process.env.PUBLISHER_TARGET}-2026-10-23.json?ref=main`, { headers, signal: AbortSignal.timeout(20_000) });
      if (!original.ok) throw new Error('The original publisher inquiry could not be verified; no follow-up sent.');
      const entry = await original.json();
      const initial = JSON.parse(Buffer.from(entry.content, 'base64').toString('utf8'));
      if (!initial.providerId || initial.status !== 'accepted_by_resend' || JSON.stringify(initial.payload?.to) !== JSON.stringify(payload.to)) throw new Error('The original publisher inquiry is not confirmed for this recipient.');
      followsUpProviderId = initial.providerId;
    }
    receipt = { platform: process.env.PUBLISHER_TARGET, message, ...(followsUpProviderId && { followsUpProviderId }), status: 'claimed', claimedAt: new Date().toISOString(), recipient: target.to, recipientSource: target.source, payload, payloadSha256: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), providerId: null };
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
