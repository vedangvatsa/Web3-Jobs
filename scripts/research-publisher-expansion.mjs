import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';

const directory = '.cache/publisher-expansion-2026-10-23';
fs.mkdirSync(directory, { recursive: true });
const seeds = JSON.parse(fs.readFileSync('docs/publisher-expansion-candidates.json', 'utf8'));
const file = `${directory}/research.json`;
const saved = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
const filter = process.argv.find(arg => arg.startsWith('--only='))?.slice(7).toLowerCase();
const done = new Set(saved.map(row => row.url));
const browserMode = process.argv.includes('--browser');
const queue = seeds.filter(([name, url]) => filter ? name.toLowerCase().includes(filter) : browserMode
  ? saved.some(row => row.url === url && !row.browserChecked && !row.contacts.length && row.pages[0]?.httpStatus === 200)
  : !done.has(url));
const contactLink = /contact|partner|publisher|syndicat|contribut|submit|write.for|about.us|about$/i;
const role = /partner|publisher|syndicat|content|editor|contribut|hello|info|contact|support|team|news/i;

function extract(body, url, finalUrl, httpStatus) {
  const $ = load(body);
  $('script,style,noscript,svg').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  const emails = new Map();
  for (const element of $('a[href^="mailto:"]').toArray()) {
    const address = $(element).attr('href').slice(7).split('?')[0].trim().toLowerCase();
    if (!/^[a-z0-9._+%-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(address)) continue;
    emails.set(address, $(element).parent().text().replace(/\s+/g, ' ').trim().slice(0, 650));
  }
  for (const match of text.matchAll(/[a-z0-9._+%-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)) {
    const address = match[0].toLowerCase().replace(/[.]$/, '');
    if (!emails.has(address)) emails.set(address, text.slice(Math.max(0, match.index - 220), match.index + address.length + 300));
  }
  const links = $('a[href]').toArray().flatMap(element => {
    const href = $(element).attr('href');
    try { const absolute = new URL(href, finalUrl); return absolute.protocol === 'https:' && contactLink.test(`${absolute.pathname} ${$(element).text()}`) ? [{ url: absolute.href, text: $(element).text().replace(/\s+/g, ' ').trim() }] : []; } catch { return []; }
  });
  return { url, finalUrl, httpStatus, fetchedAt: new Date().toISOString(), title: $('title').text(), sha256: createHash('sha256').update(body).digest('hex'), text: text.slice(0, 20000), emails: [...emails].map(([address, context]) => ({ address, context })), links };
}
async function page(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { 'User-Agent': 'HashtagWeb3PublisherResearch/1.0 (+https://hashtagweb3.com/community)', Accept: 'text/html' } });
  return extract(await response.text(), url, response.url, response.status);
}
let browser;
if (browserMode) {
  const { chromium } = await import('playwright');
  browser = await chromium.launch({ executablePath: '/Users/vedang/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', headless: true });
}
async function research([name, url, kind]) {
  const previousResult = saved.find(row => row.url === url);
  const pages = browserMode ? [...(previousResult?.pages || [])] : [];
  if (browserMode) {
    const tab = await browser.newPage();
    const selected = [...new Set([...pages.filter(page => page.httpStatus === 200).sort((a, b) => Number(/contact|partner|publisher/i.test(b.url)) - Number(/contact|partner|publisher/i.test(a.url))).map(page => page.finalUrl), url])].slice(0, 2);
    for (const link of selected) {
      try {
        const response = await tab.goto(link, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        await tab.waitForTimeout(1500);
        pages.push({ ...extract(await tab.content(), link, tab.url(), response.status()), representation: 'rendered-public-dom' });
      } catch (error) { pages.push({ url: link, error: error.name, representation: 'rendered-public-dom' }); }
    }
    await tab.close();
  } else {
  try {
    const home = await page(url); pages.push(home);
    if (home.httpStatus === 200) {
      const host = new URL(home.finalUrl).hostname.replace(/^www\./, '');
      const links = [...new Set(home.links.filter(link => {
        const target = new URL(link.url);
        return target.hostname.replace(/^www\./, '') === host || target.hostname.endsWith(`.${host}`);
      }).sort((a, b) => Number(/contact|partner|publisher|syndicat/i.test(b.url)) - Number(/contact|partner|publisher|syndicat/i.test(a.url))).map(link => link.url.split('#')[0]))].filter(link => link !== home.finalUrl).slice(0, 4);
      for (const link of links) {
        try { pages.push(await page(link)); } catch (error) { pages.push({ url: link, error: error.name }); }
      }
    }
  } catch (error) { pages.push({ url, error: error.name }); }
  }
  const contacts = pages.flatMap(page => page.httpStatus === 200 ? (page.emails || []).filter(email => role.test(email.address.split('@')[0]) && !/privacy|legal|abuse|security|copyright|dmca|billing|careers|jobs|unsubscribe|noreply|no-reply/i.test(email.address)).map(email => ({ ...email, sourceUrl: page.finalUrl, sourceSha256: page.sha256, fetchedAt: page.fetchedAt })) : []);
  const result = { name, url, kind, status: 'unreviewed', ...(browserMode && { browserChecked: true }), contacts, pages };
  const previous = saved.findIndex(row => row.url === url);
  if (previous < 0) saved.push(result); else saved[previous] = result;
  fs.writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
  console.log(`${name}: ${contacts.length} contact candidates, ${pages.length} pages, ${pages[0]?.httpStatus || pages[0]?.error}`);
}
let index = 0;
try { await Promise.all(Array.from({ length: browserMode ? 3 : 6 }, async () => { while (index < queue.length) await research(queue[index++]); })); }
finally { await browser?.close(); }
const review = saved.filter(row => row.contacts.length).sort((a, b) => a.name.localeCompare(b.name)).map(row => {
  const unique = [...new Map(row.contacts.map(contact => [contact.address, contact])).values()];
  return `## ${row.name} (${row.kind})\n\n${unique.map(contact => `- ${contact.address}\n  - Source: ${contact.sourceUrl}\n  - Context: ${contact.context.replaceAll('\n', ' ')}`).join('\n')}\n`;
}).join('\n');
fs.writeFileSync(`${directory}/contact-review.md`, review);
console.log(JSON.stringify({ reviewedSites: saved.length, sitesWithContactCandidates: saved.filter(row => row.contacts.length).length, results: file }));
