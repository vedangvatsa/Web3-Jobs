import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const EXECUTABLE = '/Users/vedang/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const evidenceDir = '.cache/publisher-expansion-2026-10-23/forms';

const FORM = {
  org: 'Hashtag Web3',
  website: 'https://hashtagweb3.com',
  rss: 'https://hashtagweb3.com/news/feed.xml',
  community: 'https://hashtagweb3.com/community',
  news: 'https://hashtagweb3.com/news',
  email: 'hi@hashtagweb3.com',
  name: 'Alex',
  pitch: `Hashtag Web3 is a global Web3 community of over 100,000 professionals and an English-language knowledge and original news publisher (United States). Reach: 55M job-post views last year; 26M LinkedIn views last month; 150k newsletter subscribers; 60k Telegram subscribers; weekly X Spaces with 20–40k live listeners (guests include a Pink Floyd band member, EY partners, the Father of Digital Twin, and a former Microsoft CSO). Event partners include Harvard Blockchain Conference, ETH Vietnam, Oxford Blockchain Conference, Token2049, Taipei Blockchain Week, ETH Oxford, Gitex and ETH Brussels. We would like ongoing distribution of our native crypto/Web3 news feed via ${'https://hashtagweb3.com/news/feed.xml'}. Contact: hi@hashtagweb3.com.`,
  short: `Hashtag Web3: global Web3 community (100k+ professionals) and US-based English crypto/Web3 news publisher. 55M job-post views/yr, 26M LinkedIn views/mo, 150k newsletter, 60k Telegram, weekly Spaces 20–40k listeners. Seeking publisher/ syndication onboarding for live RSS ${'https://hashtagweb3.com/news/feed.xml'}. Contact hi@hashtagweb3.com.`,
};

const jobs = [
  {
    id: 'cryptopanic',
    url: 'https://cryptopanic.com/submit-source/',
    async fill(page) {
      // best-effort generic form fill
      const name = await page.$('input[name*="name" i], input[placeholder*="name" i]');
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const site = await page.$('input[name*="url" i], input[name*="site" i], input[placeholder*="url" i], input[placeholder*="site" i]');
      const msg = await page.$('textarea, input[name*="message" i], input[name*="desc" i]');
      if (name) await name.fill(FORM.name);
      if (email) await email.fill(FORM.email);
      if (site) await site.fill(FORM.website);
      if (msg) await msg.fill(FORM.short);
      return { name: !!name, email: !!email, site: !!site, msg: !!msg };
    },
  },
  {
    id: 'newstex',
    url: 'https://www.newstex.com/newstex-network',
    async fill(page) {
      const name = await page.$('input[name*="name" i], input[placeholder*="name" i]');
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const org = await page.$('input[name*="company" i], input[name*="org" i], input[placeholder*="company" i]');
      const site = await page.$('input[name*="url" i], input[name*="site" i], input[placeholder*="url" i]');
      const msg = await page.$('textarea');
      if (name) await name.fill(FORM.name);
      if (email) await email.fill(FORM.email);
      if (org) await org.fill(FORM.org);
      if (site) await site.fill(FORM.website);
      if (msg) await msg.fill(FORM.pitch);
      return { name: !!name, email: !!email, org: !!org, site: !!site, msg: !!msg };
    },
  },
  {
    id: 'alltop',
    url: 'https://www.alltop.com/contact',
    async fill(page) {
      const name = await page.$('input[name*="name" i], input[placeholder*="name" i]');
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const topic = await page.$('select[name*="topic" i], select');
      const msg = await page.$('textarea, input[name*="message" i]');
      if (name) await name.fill(FORM.name);
      if (email) await email.fill(FORM.email);
      if (topic) {
        const opts = await topic.$$eval('option', (os) => os.map((o) => ({ v: o.value, t: o.textContent?.trim() || '' })));
        const pick = opts.find((o) => /partner|general|press|content|submit|source/i.test(o.t + o.v)) || opts[1];
        if (pick) await topic.selectOption(pick.v);
      }
      if (msg) await msg.fill(FORM.short + ' RSS: ' + FORM.rss);
      return { name: !!name, email: !!email, topic: !!topic, msg: !!msg };
    },
  },
  {
    id: 'feedspot',
    url: 'https://www.feedspot.com/',
    async fill(page) {
      // feedspot often has "Submit Blog" / add feed UI
      const submit = await page.$('a:has-text("Submit"), button:has-text("Submit"), a:has-text("Add"), text=Submit Blog');
      if (submit) await submit.click().catch(() => {});
      await page.waitForTimeout(1500);
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const site = await page.$('input[name*="url" i], input[placeholder*="blog" i], input[placeholder*="url" i]');
      const msg = await page.$('textarea');
      if (email) await email.fill(FORM.email);
      if (site) await site.fill(FORM.website);
      if (msg) await msg.fill(FORM.short);
      return { clickedSubmit: !!submit, email: !!email, site: !!site, msg: !!msg };
    },
  },
  {
    id: 'blogarama',
    url: 'https://www.blogarama.com/',
    async fill(page) {
      const add = await page.$('a:has-text("Add"), a:has-text("Submit"), a:has-text("Join"), button:has-text("Add")');
      if (add) await add.click().catch(() => {});
      await page.waitForTimeout(1500);
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const site = await page.$('input[name*="url" i], input[placeholder*="url" i], input[placeholder*="blog" i]');
      if (email) await email.fill(FORM.email);
      if (site) await site.fill(FORM.website);
      return { clicked: !!add, email: !!email, site: !!site };
    },
  },
  {
    id: 'ontoplist',
    url: 'https://www.ontoplist.com/',
    async fill(page) {
      const add = await page.$('a:has-text("Add"), a:has-text("Submit"), a:has-text("Join"), button:has-text("Add")');
      if (add) await add.click().catch(() => {});
      await page.waitForTimeout(1500);
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const site = await page.$('input[name*="url" i], input[placeholder*="url" i]');
      if (email) await email.fill(FORM.email);
      if (site) await site.fill(FORM.website);
      return { clicked: !!add, email: !!email, site: !!site };
    },
  },
  {
    id: 'syndigate',
    url: 'https://www.syndigate.info/contact-us/',
    async fill(page) {
      const name = await page.$('input[name*="name" i], input[placeholder*="name" i]');
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const org = await page.$('input[name*="company" i], input[name*="org" i]');
      const msg = await page.$('textarea, input[name*="message" i]');
      if (name) await name.fill(FORM.name);
      if (email) await email.fill(FORM.email);
      if (org) await org.fill(FORM.org);
      if (msg) await msg.fill(FORM.pitch);
      return { name: !!name, email: !!email, org: !!org, msg: !!msg };
    },
  },
  {
    id: 'content-catalyst',
    url: 'https://contentcatalyst.com/contact/',
    async fill(page) {
      const name = await page.$('input[name*="name" i], input[placeholder*="name" i]');
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const msg = await page.$('textarea, input[name*="message" i]');
      if (name) await name.fill(FORM.name);
      if (email) await email.fill(FORM.email);
      if (msg) await msg.fill(FORM.pitch);
      return { name: !!name, email: !!email, msg: !!msg };
    },
  },
  {
    id: 'mediafeed',
    url: 'https://www.mediafeed.us/contact',
    async fill(page) {
      const name = await page.$('input[name*="name" i], input[placeholder*="name" i]');
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const msg = await page.$('textarea, input[name*="message" i]');
      if (name) await name.fill(FORM.name);
      if (email) await email.fill(FORM.email);
      if (msg) await msg.fill(FORM.pitch);
      return { name: !!name, email: !!email, msg: !!msg };
    },
  },
  {
    id: 'pressreader',
    url: 'https://about.pressreader.com/business-contact-form/',
    async fill(page) {
      const name = await page.$('input[name*="name" i], input[placeholder*="name" i]');
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const org = await page.$('input[name*="company" i], input[name*="org" i], input[placeholder*="company" i]');
      const msg = await page.$('textarea, input[name*="message" i]');
      if (name) await name.fill(FORM.name);
      if (email) await email.fill(FORM.email);
      if (org) await org.fill(FORM.org);
      if (msg) await msg.fill(FORM.short);
      return { name: !!name, email: !!email, org: !!org, msg: !!msg };
    },
  },
  {
    id: 'inkl',
    url: 'https://www.inkl.com/contact',
    async fill(page) {
      const name = await page.$('input[name*="name" i], input[placeholder*="name" i]');
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const msg = await page.$('textarea, input[name*="message" i]');
      if (name) await name.fill(FORM.name);
      if (email) await email.fill(FORM.email);
      if (msg) await msg.fill(FORM.pitch);
      return { name: !!name, email: !!email, msg: !!msg };
    },
  },
  {
    id: 'upday',
    url: 'https://corporate.upday.com/publishers',
    async fill(page) {
      const email = await page.$('input[type="email"], a[href^="mailto"]');
      const form = await page.$('form');
      return { hasForm: !!form, emailLink: await page.$$eval('a[href^="mailto"]', (as) => as.map((a) => a.getAttribute('href'))) };
    },
  },
  {
    id: 'ground-news',
    url: 'https://ground.news/contact-us',
    async fill(page) {
      const name = await page.$('input[name*="name" i], input[placeholder*="name" i]');
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const msg = await page.$('textarea, input[name*="message" i]');
      if (name) await name.fill(FORM.name);
      if (email) await email.fill(FORM.email);
      if (msg) await msg.fill(FORM.short);
      return { name: !!name, email: !!email, msg: !!msg };
    },
  },
  {
    id: 'squid',
    url: 'https://www.squidapp.co/for-publishers/',
    async fill(page) {
      const email = await page.$$eval('a[href^="mailto"]', (as) => as.map((a) => a.getAttribute('href')));
      const form = await page.$('form');
      return { mailtos: email, hasForm: !!form };
    },
  },
  {
    id: 'financialcontent',
    url: 'https://www.financialcontent.com/',
    async fill(page) {
      const contact = await page.$('a:has-text("Contact"), a:has-text("Partner"), a:has-text("Publisher")');
      if (contact) await contact.click().catch(() => {});
      await page.waitForTimeout(1200);
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const msg = await page.$('textarea');
      if (email) await email.fill(FORM.email);
      if (msg) await msg.fill(FORM.short);
      return { clicked: !!contact, email: !!email, msg: !!msg, url: page.url() };
    },
  },
  {
    id: 'simplefeed',
    url: 'https://www.simplefeed.com/',
    async fill(page) {
      const contact = await page.$('a:has-text("Contact"), a:has-text("Partner"), a:has-text("Apple")');
      if (contact) await contact.click().catch(() => {});
      await page.waitForTimeout(1200);
      const email = await page.$('input[type="email"]');
      return { clicked: !!contact, email: !!email, url: page.url() };
    },
  },
  {
    id: 'tradingview',
    url: 'https://www.tradingview.com/partner-program/',
    async fill(page) {
      const apply = await page.$('a:has-text("Apply"), a:has-text("Contact"), a:has-text("Partner")');
      if (apply) await apply.click().catch(() => {});
      await page.waitForTimeout(1200);
      const email = await page.$('input[type="email"]');
      return { clicked: !!apply, email: !!email, url: page.url() };
    },
  },
  {
    id: 'coinpaprika',
    url: 'https://coinpaprika.com/contact',
    async fill(page) {
      const name = await page.$('input[name*="name" i], input[placeholder*="name" i]');
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const msg = await page.$('textarea, input[name*="message" i]');
      if (name) await name.fill(FORM.name);
      if (email) await email.fill(FORM.email);
      if (msg) await msg.fill(FORM.short);
      return { name: !!name, email: !!email, msg: !!msg };
    },
  },
  {
    id: 'inoreader',
    url: 'https://www.inoreader.com/contact',
    async fill(page) {
      const email = await page.$('input[type="email"]');
      const msg = await page.$('textarea');
      if (email) await email.fill(FORM.email);
      if (msg) await msg.fill(FORM.short);
      return { email: !!email, msg: !!msg };
    },
  },
  {
    id: 'way2news',
    url: 'https://www.way2news.com/contact.html',
    async fill(page) {
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const msg = await page.$('textarea, input[name*="message" i]');
      if (email) await email.fill(FORM.email);
      if (msg) await msg.fill(FORM.short);
      return { email: !!email, msg: !!msg };
    },
  },
  {
    id: 'investing',
    url: 'https://www.investing.com/about-us/contact-us',
    async fill(page) {
      const email = await page.$('input[type="email"]');
      const msg = await page.$('textarea');
      if (email) await email.fill(FORM.email);
      if (msg) await msg.fill(FORM.short);
      return { email: !!email, msg: !!msg };
    },
  },
];

const only = process.env.FORM_ONLY ? process.env.FORM_ONLY.split(',') : null;
const doSubmit = process.env.FORM_SUBMIT === 'true';

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true });
const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
const summaries = [];

for (const job of jobs) {
  if (only && !only.includes(job.id)) continue;
  const page = await context.newPage();
  const record = { id: job.id, url: job.url, ok: false };
  try {
    const resp = await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    record.httpStatus = resp?.status() || null;
    record.finalUrl = page.url();
    record.title = await page.title();
    await page.waitForTimeout(2000);
    record.fields = await job.fill(page);
    record.forms = await page.$$eval('form', (fs) => fs.map((f) => ({
      action: f.getAttribute('action'),
      method: f.getAttribute('method'),
      inputs: [...f.querySelectorAll('input,textarea,select,button')].slice(0, 30).map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        placeholder: el.getAttribute('placeholder'),
        text: (el.textContent || '').trim().slice(0, 60),
      })),
    })));
    if (doSubmit) {
      const submit = await page.$('button[type="submit"], input[type="submit"], button:has-text("Send"), button:has-text("Submit"), button:has-text("Apply")');
      if (submit) {
        await submit.click();
        await page.waitForTimeout(3000);
        record.submitted = true;
        record.postSubmitUrl = page.url();
        record.postSubmitBody = (await page.textContent('body'))?.slice(0, 800) || '';
      } else {
        record.submitted = false;
        record.note = 'no submit control found';
      }
    }
    await page.screenshot({ path: `${evidenceDir}/${job.id}.png`, fullPage: false });
    record.ok = true;
  } catch (error) {
    record.error = String(error).slice(0, 300);
  }
  summaries.push(record);
  await writeFile(`${evidenceDir}/${job.id}.json`, JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify({ id: record.id, ok: record.ok, status: record.httpStatus, fields: record.fields, forms: record.forms?.length, submitted: record.submitted }));
  await page.close();
}

await writeFile(`${evidenceDir}/summary.json`, JSON.stringify(summaries, null, 2) + '\n');
await browser.close();
console.log('done', summaries.length);
