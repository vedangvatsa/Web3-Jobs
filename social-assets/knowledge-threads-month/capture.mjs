import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(root, 'assets');
await fs.mkdir(assets, { recursive: true });
const previous = path.join(root, '../nomad-resources-thread/assets');
for (const name of ['inter.woff2', 'wordmark.png', 'edge-city.jpg', '4seas.jpg']) {
  await fs.copyFile(path.join(previous, name), path.join(assets, name));
}
const browser = await chromium.launch({ headless: true, executablePath: '/Users/vedang/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
await page.route('**/*', route => {
  const url = route.request().url();
  if (/google-analytics|googletagmanager|posthog|doubleclick|jobs-runtime|events-runtime|news-cache/i.test(url)) return route.abort();
  return route.continue();
});
const targets = {
  resume: '/resume-builder', invoice: '/invoice-generator', jd: '/jd-builder',
  interview: '/interview-questions', nomads: '/nomads', visa: '/visas',
  checker: '/visas?tab=checker&passport=india', popups: '/popups',
  remote: '/remote-work-checklist', citizenship: '/citizenship?compare=nauru,vanuatu',
};
const mode = process.argv[2] || 'inspect';
const requested = process.argv.slice(3);
const records = [];
async function saveCredits() {
  let prior = [];
  try { prior = JSON.parse(await fs.readFile(path.join(assets, 'capture-credits.json'), 'utf8')); } catch {}
  await fs.writeFile(path.join(assets, 'capture-credits.json'), JSON.stringify([...prior.filter(p => !records.some(r => r.file === p.file)), ...records], null, 2) + '\n');
}
async function crop(name, locator, detail) {
  console.log(`Capturing ${name}`);
  await locator.first().scrollIntoViewIfNeeded();
  const box = await locator.first().boundingBox();
  if (!box) throw new Error(`Missing crop ${name}`);
  let bytes;
  if(/^citizenship-(investment|holding|additional|presence|sources)/.test(name)) {
    const clip=await locator.first().evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect(),b=el.getBoundingClientRect();return{left:Math.max(0,Math.floor((r.x-b.x-4)*2)),top:Math.max(0,Math.floor((r.y-b.y-4)*2)),width:Math.ceil((r.width+8)*2),height:Math.ceil((r.height+8)*2)};});
    const raw=await locator.first().screenshot({type:'jpeg',quality:94,animations:'disabled'});
    const rawMeta=await sharp(raw).metadata();
    clip.width=Math.min(clip.width,rawMeta.width-clip.left);clip.height=Math.min(clip.height,rawMeta.height-clip.top);
    bytes=await sharp(raw).extract(clip).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toBuffer();
    detail+=' Tight crop uses the rendered text bounds of the genuine table cell.';
  } else bytes = await locator.first().screenshot({ type: 'jpeg', quality: 94, animations: 'disabled' });
  const file = `assets/${name}.jpg`;
  const trim = /^(jd-(responsibilities|required|preferred)|checker-|interview-|remote-(workspace|communication)|visa-requirements|citizenship-(investment|holding|additional|presence|sources|source-control))/.test(name);
  let pipeline=sharp(bytes);
  if(trim) pipeline=pipeline.trim({threshold:6}).extend({top:8,bottom:8,left:8,right:8,background:'#ffffff'});
  await pipeline.jpeg({ quality: 94, chromaSubsampling: '4:4:4' }).toFile(path.join(root, file));
  const finalMeta=await sharp(path.join(root,file)).metadata();
  records.push({ file, url: page.url(), capturedAt: new Date().toISOString(), title: await page.title(), visibleText: await locator.first().innerText(), detail:detail+(trim?' Outer blank screenshot margin cropped; content unchanged.':''), width: finalMeta.width, height: finalMeta.height });
  await saveCredits();
}
async function unionCrop(name, selectors, detail) {
  const locs = selectors.map(selector => page.locator(selector).first());
  await locs[0].scrollIntoViewIfNeeded();
  const boxes = await Promise.all(locs.map(loc => loc.boundingBox()));
  if (boxes.some(box => !box)) throw new Error(`Missing union crop ${name}`);
  const x = Math.min(...boxes.map(b => b.x));
  const y = Math.min(...boxes.map(b => b.y));
  const clip = { x, y, width: Math.max(...boxes.map(b => b.x + b.width)) - x, height: Math.max(...boxes.map(b => b.y + b.height)) - y };
  const bytes = await page.screenshot({ clip, type: 'jpeg', quality: 94, animations: 'disabled' });
  const file = `assets/${name}.jpg`;
  await sharp(bytes).jpeg({ quality: 94, chromaSubsampling: '4:4:4' }).toFile(path.join(root, file));
  records.push({ file, url: page.url(), capturedAt: new Date().toISOString(), title: await page.title(), visibleText: (await Promise.all(locs.map(l => l.innerText()))).join('\n'), detail, width: (await sharp(bytes).metadata()).width, height: (await sharp(bytes).metadata()).height });
}
try {
  for (const [key, route] of Object.entries(targets)) {
    if (requested.length && !requested.includes(key)) continue;
    await page.goto(`https://hashtagweb3.com${route}`, { waitUntil: 'networkidle', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    if (mode === 'inspect') {
      console.log(JSON.stringify({ key, title: await page.title(), ui: await page.locator('main').innerText().catch(() => page.locator('body').innerText()), controls: await page.locator('input,textarea,select,button,summary,h2,h3,label').evaluateAll(els => els.map(el => ({ tag: el.tagName, text: el.innerText, id: el.id, placeholder: el.getAttribute('placeholder'), aria: el.getAttribute('aria-label'), cls: el.className, parent: el.parentElement?.tagName, parentClass: el.parentElement?.className }))) }, null, 2));
      continue;
    }
    if (key === 'resume') {
      await crop('resume-project-control', page.getByRole('button', { name: 'Add Project', exact: true }), 'Real add-project control, all sample entries excluded.');
      await crop('resume-experience-control', page.getByRole('button', { name: 'Add Experience', exact: true }), 'Real add-experience control, all personal and sample values excluded.');
    }
    if (key === 'invoice') {
      await page.locator('input[name="paymentMethod"]').fill('');
      await page.locator('textarea[name="notes"]').fill('');
      await crop('invoice-payment-control', page.getByText('Payment Method', { exact: true }).first().locator('..'), 'Real payment method label and text input.');
      await crop('invoice-notes-control', page.locator('label').filter({ hasText: /^Notes$/ }).locator('..'), 'Real empty notes field. Default text cleared through normal input interaction.');
    }
    if (key === 'jd') {
      for (const [name, text] of [['responsibilities', 'Responsibilities'], ['required', 'Qualifications'], ['preferred', 'Preferred Qualifications']]) {
        await crop(`jd-${name}`, page.getByText(text, { exact: true }).first(), 'Real form section heading; sample employer and compensation content excluded.');
      }
      await crop('jd-add-control', page.getByRole('button', { name: 'Add', exact: true }).first(), 'Real list-item editing control.');
    }
    if (key === 'interview') {
      await crop('interview-navigation', page.getByRole('link', { name: 'Frontend dApp Engineer', exact: true }), 'Real role navigation link.');
      await crop('interview-scoring', page.getByRole('heading', { name: 'Appendix B: Scoring Guide', exact: true }), 'Actual scoring-guide section heading, tightly cropped for mobile legibility.');
    }
    if (key === 'nomads') {
      const selector = page.getByRole('combobox', { name: 'Rank destinations by' });
      await selector.selectOption({ label: 'Living costs' });
      await crop('nomads-rank-cost', selector, 'Ranking selector in Living costs state; results excluded.');
      await selector.selectOption({ label: 'Internet speed' });
      await crop('nomads-rank-internet', selector, 'Ranking selector in Internet speed state; results excluded.');
      await crop('nomads-compare', page.getByRole('button', { name: /Add .+ to comparison/ }).first(), 'Compare control only, without city identity, cost or ranking.');
    }
    if (key === 'visa') {
      await crop('visa-tabs', page.getByRole('tablist'), 'Actual program and passport-checker navigation.');
      await crop('visa-search', page.locator('input[aria-label="Search visa programs"]'), 'Empty program search.');
      await crop('visa-official-source', page.getByRole('link', { name: /Official visa program website for/ }).first(), 'Official-source icon control only; its country-specific card is excluded.');
      await crop('visa-requirements', page.getByText('Key Requirements', { exact: true }).first(), 'Actual field heading without eligibility details.');
    }
    if (key === 'checker') {
      await page.getByText('Checked · government-backed baseline', { exact: true }).first().waitFor();
      for (const [name, text] of [['checked', 'Checked · government-backed baseline'], ['historical', 'Historical official evidence'], ['unresolved', 'Unresolved official review']]) {
        await crop(`checker-${name}`, page.locator('td > p:visible').filter({ hasText: text }).first(), 'Genuine evidence-status label. Destination and entry outcomes excluded.');
      }
      await crop('checker-conditions', page.locator('summary').filter({ hasText: /^Conditions & sources$/ }).first(), 'Actual conditions disclosure control; destination and rule excluded.');
    }
    if (key === 'popups') {
      const selector = page.getByRole('combobox', { name: 'Filter by type' });
      for (const [name, label] of [['popup', 'Popup'], ['permanent', 'Permanent'], ['city', 'City / SEZ']]) {
        await selector.selectOption({ label });
        await crop(`popups-${name}`, selector, 'Genuine type filter state; listings and all availability details excluded.');
      }
    }
    if (key === 'remote') {
      for (const [name, label] of [['workspace', 'Workspace Setup'], ['communication', 'Communication & Collaboration']]) {
        await crop(`remote-${name}`, page.getByRole('heading', { name: label, exact: true }), 'Actual checklist section heading. Equipment recommendations excluded.');
      }
      await crop('remote-backup-control', page.getByText('Automated file and code backups are enabled', { exact: true }).locator('..'), 'Actual unchecked backup task control.');
    }
    if (key === 'citizenship') {
      for (const label of ['Investment', 'Holding conditions', 'Additional fees', 'Presence', 'Sources']) {
        await crop(`citizenship-${label.toLowerCase().replaceAll(' ', '-')}`, page.getByRole('rowheader', { name: label, exact: true }), 'Real comparison row header only. Country-specific cells excluded.');
      }
      await crop('citizenship-source-control', page.locator('table').getByRole('link', { name: 'Official program', exact: true }).first(), 'Actual official-source link control; country data excluded.');
    }
  }
} finally { await browser.close(); }
if (records.length) {
  let prior = [];
  try { prior = JSON.parse(await fs.readFile(path.join(assets, 'capture-credits.json'), 'utf8')); } catch {}
  await fs.writeFile(path.join(assets, 'capture-credits.json'), JSON.stringify([...prior.filter(p => !records.some(r => r.file === p.file)), ...records], null, 2) + '\n');
  console.log(JSON.stringify(records, null, 2));
}
