import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const EXECUTABLE = '/Users/vedang/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const evidenceDir = '.cache/publisher-expansion-2026-10-23/forms';

const SHORT = `Hashtag Web3: global Web3 community (100k+ professionals) and United States English-language crypto/Web3 news publisher. Reach includes 55M job-post views last year, 26M LinkedIn views last month, 150k newsletter subscribers, 60k Telegram subscribers, and weekly X Spaces with 20–40k live listeners. Seeking ongoing distribution / syndication of our native news feed. RSS: https://hashtagweb3.com/news/feed.xml — Community: https://hashtagweb3.com/community — News: https://hashtagweb3.com/news — Contact: hi@hashtagweb3.com.`;

const PITCH = `Hashtag Web3 is a global Web3 community of over 100,000 professionals and an English-language knowledge and original news publisher based in the United States.

Stated reach:
- 55 million job-post views in the last year
- 26 million LinkedIn views last month
- 150,000 newsletter subscribers
- 60,000 Telegram channel subscribers
- Weekly X Spaces with 20,000–40,000 live listeners (guests have included a Pink Floyd band member, EY partners, the Father of Digital Twin, and a former Microsoft CSO)
- Event partnerships: Harvard Blockchain Conference, ETH Vietnam, Oxford Blockchain Conference, Token2049, Taipei Blockchain Week, ETH Oxford, Gitex, ETH Brussels

We would like ongoing distribution of our native English crypto/Web3 news via publisher onboarding or syndication.

Website: https://hashtagweb3.com
RSS: https://hashtagweb3.com/news/feed.xml
Community: https://hashtagweb3.com/community
News: https://hashtagweb3.com/news
Samples: https://hashtagweb3.com/secstocks · https://hashtagweb3.com/fcadefi · https://hashtagweb3.com/fireblocksvisa
Contact: hi@hashtagweb3.com
Representative: Alex
Publisher organization: Hashtag Web3 (United States)`;

const jobs = [
  {
    id: 'mediafeed',
    url: 'https://www.mediafeed.us/contact',
    async fill(page) {
      await page.fill('input[name="First-Name"]', 'Alex');
      const last = await page.$('input[name="Last-Name"]');
      if (last) await last.fill('');
      await page.fill('input[name="Company"]', 'Hashtag Web3');
      await page.fill('input[name="Email"]', 'hi@hashtagweb3.com');
      await page.fill('input[name="Company-URL"]', 'https://hashtagweb3.com');
      await page.fill('textarea[name="Message"]', PITCH);
      return true;
    },
    submit: 'input[type="submit"], button[type="submit"]',
  },
  {
    id: 'syndigate',
    url: 'https://www.syndigate.info/contact-us/',
    async fill(page) {
      const options = await page.$$eval('select[name="recipient"] option', (os) => os.map((o) => ({ v: o.value, t: (o.textContent || '').trim() })));
      const pick = options.find((o) => /syndicat|publish|content|news|partner/i.test(o.t)) || options[0];
      if (pick) await page.selectOption('select[name="recipient"]', pick.v);
      await page.fill('input[name="your-subject"]', 'Hashtag Web3 publisher syndication inquiry');
      await page.fill('input[name="your-name"]', 'Alex');
      await page.fill('input[name="your-email"]', 'hi@hashtagweb3.com');
      await page.fill('textarea[name="your-message"]', PITCH);
      return pick?.t || null;
    },
    submit: 'input[type="submit"], button[type="submit"]',
  },
  {
    id: 'coinpaprika',
    url: 'https://coinpaprika.com/contact',
    async fill(page) {
      // select partnership / content related radio if present
      const radios = await page.$$('input[name="topic"]');
      let chosen = null;
      for (const r of radios) {
        const label = await r.evaluate((el) => {
          const id = el.id;
          const lab = id ? document.querySelector(`label[for="${id}"]`) : null;
          return ((lab?.textContent || '') + ' ' + (el.getAttribute('value') || '')).trim();
        });
        if (/partner|media|content|syndicat|news|publish/i.test(label)) {
          await r.check({ force: true });
          chosen = label;
          break;
        }
      }
      if (!chosen && radios[0]) await radios[0].check({ force: true });
      await page.fill('input[name="name"]', 'Alex');
      await page.fill('input[name="email"]', 'hi@hashtagweb3.com');
      await page.fill('input[name="company"]', 'Hashtag Web3');
      await page.fill('input[name="pageUrl"]', 'https://hashtagweb3.com');
      await page.fill('textarea[name="message"]', SHORT);
      return chosen;
    },
    submit: 'button[type="submit"]',
    // page may show "Review message" then confirm
    extra: async (page) => {
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1500);
      const confirm = await page.$('button:has-text("Send"), button:has-text("Confirm"), button[type="submit"]');
      if (confirm) {
        const text = (await confirm.textContent())?.trim() || '';
        if (!/review/i.test(text)) {
          await confirm.click();
          await page.waitForTimeout(2000);
          return { secondClick: text };
        }
      }
      return { reviewOnly: true };
    },
  },
  {
    id: 'ontoplist',
    url: 'https://www.ontoplist.com/',
    async fill(page) {
      // open join form if needed
      const add = await page.$('a:has-text("Add"), a:has-text("Submit"), a:has-text("Join"), button:has-text("Add"), a:has-text("List")');
      if (add) {
        await add.click().catch(() => {});
        await page.waitForTimeout(1500);
      }
      // ensure join form visible
      const emailSel = 'form[action*="join"] input[name="email"], form[action*="join"] input[name="url"]';
      const hasJoin = await page.$('form[action*="join"]');
      if (!hasJoin) {
        // try navigating to join
        await page.goto('https://www.ontoplist.com/join/', { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(1500);
      }
      const email = await page.$('input[name="email"]');
      const password = await page.$('input[name="password"]');
      const url = await page.$('input[name="url"]');
      const sitename = await page.$('input[name="sitename"]');
      const description = await page.$('textarea[name="description"]');
      const feedurl = await page.$('input[name="feedurl"]');
      const language = await page.$('select[name="language_id"]');
      const category = await page.$('select[name="category"]');
      if (email) await email.fill('hi@hashtagweb3.com');
      if (password) await password.fill('Hw3!News2026x');
      if (url) await url.fill('https://hashtagweb3.com');
      if (sitename) await sitename.fill('Hashtag Web3');
      if (description) await description.fill(SHORT);
      if (feedurl) await feedurl.fill('https://hashtagweb3.com/news/feed.xml');
      if (language) {
        const opts = await language.$$eval('option', (os) => os.map((o) => ({ v: o.value, t: (o.textContent || '').trim() })));
        const en = opts.find((o) => /^English$/i.test(o.t));
        if (en) await language.selectOption(en.v);
      }
      if (category) {
        const opts = await category.$$eval('option', (os) => os.map((o) => ({ v: o.value, t: (o.textContent || '').trim() })));
        const pick = opts.find((o) => /tech|news|business|crypto|blog|general/i.test(o.t) && o.v) || opts.find((o) => o.v);
        if (pick) await category.selectOption(pick.v);
      }
      // type radios
      const types = await page.$$('input[name="type"]');
      if (types[0]) await types[0].check({ force: true }).catch(() => {});
      return { hasJoin: !!(hasJoin || email), url: page.url() };
    },
    submit: 'button:has-text("Submit My Listing"), form[action*="join"] button[type="submit"], form[action*="join"] input[type="submit"]',
  },
  {
    id: 'pressreader',
    url: 'https://about.pressreader.com/business-contact-form/',
    async fill(page) {
      // use first visible form
      await page.fill('input[name="firstname"] >> visible=true', 'Alex');
      const last = await page.$('input[name="lastname"] >> visible=true');
      if (last) await last.fill('');
      await page.fill('input[name="emailaddress1"] >> visible=true', 'hi@hashtagweb3.com');
      await page.fill('input[name="companyname"] >> visible=true', 'Hashtag Web3');
      await page.fill('input[name="jobtitle"] >> visible=true', 'Publisher');
      await page.fill('input[name="pr_country"] >> visible=true', 'United States');
      await page.fill('textarea[name="description"] >> visible=true', SHORT);
      const dist = await page.$('select[name="pr_contentdistributionmodel"] >> visible=true');
      if (dist) {
        const opts = await dist.$$eval('option', (os) => os.map((o) => ({ v: o.value, t: (o.textContent || '').trim() })));
        const pick = opts.find((o) => /distribution/i.test(o.t) && o.v) || opts.find((o) => o.v);
        if (pick) await dist.selectOption(pick.v);
      }
      return true;
    },
    submit: 'button:has-text("Submit") >> visible=true',
  },
  {
    id: 'alltop',
    url: 'https://www.alltop.com/contact',
    async fill(page) {
      await page.fill('input[name="website"]', 'https://hashtagweb3.com');
      await page.fill('input[name="name"]', 'Alex');
      await page.fill('input[name="email"]', 'hi@hashtagweb3.com');
      const topic = await page.$('select[name="topic"]');
      if (topic) {
        const opts = await topic.$$eval('option', (os) => os.map((o) => ({ v: o.value, t: (o.textContent || '').trim() })));
        const pick = opts.find((o) => /partner|general|press|content|submit|source/i.test(o.t)) || opts[1];
        if (pick) await topic.selectOption(pick.v);
      }
      await page.fill('textarea[name="message"]', `Please add Hashtag Web3 (https://hashtagweb3.com) as a publisher source. RSS: https://hashtagweb3.com/news/feed.xml — global Web3 community 100k+ professionals, 55M job-post views/yr, 26M LinkedIn views/mo, 150k newsletter, 60k Telegram. Contact hi@hashtagweb3.com.`);
      return true;
    },
    submit: 'button[type="submit"]',
    note: 'may hit Turnstile',
  },
  {
    id: 'ground-news',
    url: 'https://ground.news/contact-us',
    async fill(page) {
      // inspect first
      const inputs = await page.$$eval('input,textarea,select', (els) => els.map((e) => ({ tag: e.tagName, type: e.getAttribute('type'), name: e.getAttribute('name'), placeholder: e.getAttribute('placeholder'), id: e.id })));
      return inputs.slice(0, 25);
    },
    submit: null,
  },
  {
    id: 'way2news',
    url: 'https://www.way2news.com/contact.html',
    async fill(page) {
      const inputs = await page.$$eval('input,textarea,select', (els) => els.map((e) => ({ tag: e.tagName, type: e.getAttribute('type'), name: e.getAttribute('name'), placeholder: e.getAttribute('placeholder') })));
      const email = await page.$('input[type="email"], input[name*="email" i]');
      const msg = await page.$('textarea, input[name*="message" i]');
      if (email) await email.fill('hi@hashtagweb3.com');
      if (msg) await msg.fill(SHORT);
      return inputs.slice(0, 20);
    },
    submit: 'input[type="submit"], button[type="submit"]',
  },
  {
    id: 'inoreader',
    url: 'https://www.inoreader.com/contact',
    async fill(page) {
      const email = await page.$('input[type="email"]');
      const msg = await page.$('textarea');
      if (email) await email.fill('hi@hashtagweb3.com');
      if (msg) await msg.fill(SHORT);
      return true;
    },
    submit: 'button[type="submit"], input[type="submit"]',
  },
  {
    id: 'newstex',
    url: 'https://www.newstex.com/',
    async fill(page) {
      // find apply / contact
      const link = await page.$('a:has-text("Contact"), a:has-text("Apply"), a:has-text("Syndication"), a:has-text("Publish")');
      if (link) {
        await link.click().catch(() => {});
        await page.waitForTimeout(2000);
      }
      const emails = await page.$$eval('a[href^="mailto"]', (as) => as.map((a) => a.getAttribute('href')));
      const forms = await page.$$eval('form', (fs) => fs.length);
      return { url: page.url(), emails, forms };
    },
    submit: null,
  },
];

const only = process.env.FORM_ONLY ? process.env.FORM_ONLY.split(',') : null;
const dry = process.env.FORM_DRY === 'true';

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 900 },
});
const summaries = [];

for (const job of jobs) {
  if (only && !only.includes(job.id)) continue;
  const page = await context.newPage();
  const record = { id: job.id, url: job.url, at: new Date().toISOString() };
  try {
    const resp = await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    record.httpStatus = resp?.status() || null;
    await page.waitForTimeout(2500);
    record.fillResult = await job.fill(page);
    if (!dry && job.submit) {
      if (job.extra) {
        record.extra = await job.extra(page);
      } else {
        const btn = await page.$(job.submit);
        if (btn) {
          await btn.click();
          await page.waitForTimeout(3500);
          record.submitted = true;
        } else {
          record.submitted = false;
          record.note = 'submit control not found: ' + job.submit;
        }
      }
      record.postUrl = page.url();
      record.postBody = (await page.textContent('body'))?.replace(/\s+/g, ' ').slice(0, 1000) || '';
      // success signals
      record.successHint = /thank|received|success|sent|we.?ll|will contact|submitted/i.test(record.postBody);
    }
    await page.screenshot({ path: `${evidenceDir}/${job.id}-submit.png`, fullPage: false });
    record.ok = true;
  } catch (error) {
    record.error = String(error).slice(0, 400);
  }
  summaries.push(record);
  await writeFile(`${evidenceDir}/${job.id}-submit.json`, JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify({ id: record.id, ok: record.ok, submitted: record.submitted, extra: record.extra, successHint: record.successHint, error: record.error, postUrl: record.postUrl }));
  await page.close();
}

await writeFile(`${evidenceDir}/submit-summary.json`, JSON.stringify(summaries, null, 2) + '\n');
await browser.close();
console.log('done', summaries.length);
