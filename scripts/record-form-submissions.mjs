import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const outDir = 'docs/publisher-outreach';
await mkdir(outDir, { recursive: true });

const formReceipts = [
  {
    platform: 'expansion-form',
    target: 'MediaFeed',
    route: 'website-form',
    url: 'https://www.mediafeed.us/contact',
    status: 'submitted',
    submittedAt: '2026-10-23T14:05:00.000Z',
    evidence: '.cache/publisher-expansion-2026-10-23/forms/mediafeed-submit.png',
    confirmation: 'Thank you! Your submission has been received!',
    fields: ['First-Name=Alex', 'Last-Name=', 'Company=Hashtag Web3', 'Email=hi@hashtagweb3.com', 'Company-URL=https://hashtagweb3.com'],
    note: 'Syndication & Distribution contact form',
  },
  {
    platform: 'expansion-form',
    target: 'OnTopList',
    route: 'website-form',
    url: 'https://www.ontoplist.com/',
    status: 'submitted',
    submittedAt: '2026-10-23T14:05:00.000Z',
    evidence: '.cache/publisher-expansion-2026-10-23/forms/ontoplist-submit.png',
    confirmation: 'Landed on https://www.ontoplist.com/request-review/6adb6659ba079/',
    fields: ['email=hi@hashtagweb3.com', 'url=https://hashtagweb3.com', 'sitename=Hashtag Web3', 'feedurl=https://hashtagweb3.com/news/feed.xml'],
    note: 'Blog directory listing with RSS feed URL',
  },
  {
    platform: 'expansion-form',
    target: 'PressReader',
    route: 'website-form',
    url: 'https://about.pressreader.com/business-contact-form/',
    status: 'submitted-unconfirmed',
    submittedAt: '2026-10-23T14:05:00.000Z',
    evidence: '.cache/publisher-expansion-2026-10-23/forms/pressreader-submit.png',
    fields: ['firstname=Alex', 'lastname=', 'emailaddress1=hi@hashtagweb3.com', 'companyname=Hashtag Web3', 'jobtitle=Publisher', 'pr_country=United States'],
    note: 'Business contact form clicked; page still showed form (may be marketing embed). Needs manual confirmation.',
  },
  {
    platform: 'expansion-form',
    target: 'Inoreader',
    route: 'website-form',
    url: 'https://www.inoreader.com/contact',
    status: 'submitted-unconfirmed',
    submittedAt: '2026-10-23T14:05:00.000Z',
    evidence: '.cache/publisher-expansion-2026-10-23/forms/inoreader-submit.png',
    fields: ['email=hi@hashtagweb3.com'],
    note: 'Contact submit clicked; success language not clearly captured.',
  },
  {
    platform: 'expansion-form',
    target: 'AllTop',
    route: 'website-form',
    url: 'https://www.alltop.com/contact',
    status: 'rejected-by-policy',
    submittedAt: '2026-10-23T14:05:00.000Z',
    evidence: '.cache/publisher-expansion-2026-10-23/forms/alltop-submit.png',
    confirmation: 'We do not add new sources. Please do not suggest or submit your website, blog, or RSS feed.',
    note: 'Form may have accepted the message, but AllTop states it does not add new sources. Do not re-submit.',
  },
  {
    platform: 'expansion-form',
    target: 'Way2News',
    route: 'contact-page',
    url: 'https://www.way2news.com/contact.html',
    status: 'no-web-form',
    note: 'Page lists reach@way2news.com for support/queries rather than a publisher form. Use email if needed.',
  },
  {
    platform: 'expansion-form',
    target: 'SyndiGate',
    route: 'website-form',
    url: 'https://www.syndigate.info/contact-us/',
    status: 'failed',
    error: 'submit control not visible (WordPress CF7)',
    note: 'Retry with visible submit selector',
  },
  {
    platform: 'expansion-form',
    target: 'CoinPaprika',
    route: 'website-form',
    url: 'https://coinpaprika.com/contact',
    status: 'failed',
    error: 'topic radio check did not change state',
    note: 'Retry with label click',
  },
  {
    platform: 'expansion-form',
    target: 'Ground News',
    route: 'website-form',
    url: 'https://ground.news/contact-us',
    status: 'inspected-only',
  },
  {
    platform: 'expansion-form',
    target: 'Newstex',
    route: 'website-form',
    url: 'https://www.newstex.com/',
    status: 'inspected-only',
    note: 'Email support@newstex.com is the syndication network contact; apply path still open',
  },
];

for (const receipt of formReceipts) {
  const slug = receipt.target.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const path = `${outDir}/form-${slug}-2026-10-23.json`;
  receipt.payloadSha256 = createHash('sha256').update(JSON.stringify(receipt)).digest('hex');
  receipt.recordedAt = new Date().toISOString();
  await writeFile(path, JSON.stringify(receipt, null, 2) + '\n');
  console.log(path, receipt.status);
}

await writeFile(`${outDir}/form-submissions-2026-10-23.json`, JSON.stringify({
  policy: 'Website-form publisher onboarding submissions for aggregator/syndication platforms. Excludes peer news publishers and already-contacted msn/newsbreak.',
  submittedAt: '2026-10-23',
  receipts: formReceipts.map((r) => ({ target: r.target, status: r.status, url: r.url })),
}, null, 2) + '\n');
console.log('summary written');
