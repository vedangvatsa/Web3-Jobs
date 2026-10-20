import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import sharp from 'sharp';
import {root, executablePath, hash, readJSON, writeJSON, protect} from './revision-lib.mjs';

await protect({initialize:true});
await fs.mkdir(path.join(root, 'assets/revision/detail'), {recursive:true});
const content = await readJSON('content.json');
const learning = await readJSON('assets/revision/learning-captures.json');
const lessonsOnly=process.argv.includes('--lessons-only');
const selected=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
const records = selected?(await readJSON('assets/revision/detail-captures.json')).filter(c=>!selected.includes(c.id)):lessonsOnly?(await readJSON('assets/revision/detail-captures.json')).filter(c=>!c.id.startsWith('lesson-')):[];
const browser = await chromium.launch({headless:true, executablePath, args:['--blink-settings=defaultFontSize=24,defaultFixedFontSize=24']});
const context = await browser.newContext({viewport:{width:530,height:1800},deviceScaleFactor:2,colorScheme:'light',reducedMotion:'reduce'});
const page = await context.newPage();
let revision;
const dismissedOrigins = new Set();
async function visit(url) {
  const response = await page.goto(url, {waitUntil:'networkidle',timeout:90000});
  assert(response.ok(), url);
  revision = hash(await response.body());
  const close = page.getByRole('dialog', {name:'Discover more from Hashtag Web3'}).getByRole('button', {name:'Close',exact:true});
  const origin = new URL(url).origin;
  if (!dismissedOrigins.has(origin)) {
    await close.click({timeout:18000});
    dismissedOrigins.add(origin);
  } else if (await close.isVisible()) await close.click();
  await page.evaluate(() => document.fonts.ready);
}
async function capture(id, locators, sourceUrl, detail) {
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))});
  await locators[0].scrollIntoViewIfNeeded();
  const first = await locators[0].boundingBox();
  await page.evaluate(y => scrollBy(0, y - 200), first.y);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const boxes = await Promise.all(locators.map(l => l.boundingBox()));
  assert(boxes.every(Boolean), id);
  const x = Math.floor(Math.min(...boxes.map(b => b.x)));
  const y = Math.floor(Math.min(...boxes.map(b => b.y)));
  const right = Math.ceil(Math.max(...boxes.map(b => b.x + b.width)));
  const bottom = Math.ceil(Math.max(...boxes.map(b => b.y + b.height)));
  const clip = {x,y,width:right-x,height:bottom-y};
  const textData = await page.evaluate(clip => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const text = [], sizes = []; let node;
    while ((node=walker.nextNode())) {
      if (!node.textContent.trim() || node.parentElement.closest('script,style')) continue;
      const range=document.createRange();range.selectNodeContents(node);
      const rects=[...range.getClientRects()].filter(r=>r.width&&r.height);
      if (!rects.some(r=>r.left<clip.x+clip.width&&r.right>clip.x&&r.top<clip.y+clip.height&&r.bottom>clip.y)) continue;
      if (rects.some(r=>r.left<clip.x-1||r.right>clip.x+clip.width+1||r.top<clip.y-1||r.bottom>clip.y+clip.height+1)) throw Error('Partial text crop: '+node.textContent);
      const r=rects[0],hit=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
      if(!hit || !(hit.contains(node)||node.parentElement.contains(hit))) throw Error('Obscured text: '+node.textContent);
      text.push(node.textContent.trim());sizes.push(parseFloat(getComputedStyle(node.parentElement).fontSize));
    }
    return {visibleText:text.join('\n'),minimumTextCssPx:Math.min(...sizes)};
  },clip);
  const bytes = await page.screenshot({clip,type:'png',animations:'disabled'});
  const metadata = await sharp(bytes).metadata();
  const file=`assets/revision/detail/${id}.png`;
  await fs.writeFile(path.join(root,file),bytes);
  records.push({id,file,sourceUrl,localUrl:page.url().startsWith('http://127.')?page.url():undefined,sourceRevision:`response-sha256:${revision}`,capturedAt:new Date().toISOString(),provenance:page.url().startsWith('http://127.')?'Real application rendered locally; original DOM content':'Live production website; original DOM content',browserDefaultFontSize:24,deviceScaleFactor:2,cssWidth:clip.width,cssHeight:clip.height,width:metadata.width,height:metadata.height,sha256:hash(bytes),bytes:bytes.length,...textData,detail});
  await writeJSON('assets/revision/detail-captures.json',records);
  console.log(`${id}: ${metadata.width}x${metadata.height}, ${textData.minimumTextCssPx}px CSS`);
}
try {
  if(!lessonsOnly) {
  await visit('http://127.0.0.1:3102/citizenship');
  const routes = new Map();
  for (const thread of content.threads.filter(t=>t.sequence>3)) for (const post of thread.posts) for (const item of post.visual.items||[]) {
    if(item.type!=='citizenship') continue;
    const kind = item.slug==='turkiye'?'Property':item.slug==='jordan'?'Business':thread.id==='C10'&&item.slug==='egypt'?'Deposit':thread.id==='C10'&&item.slug==='saint-lucia'?'Bonds':'Contribution';
    routes.set(`${item.slug}-${kind.toLowerCase()}`, {slug:item.slug,kind});
  }
  await page.setViewportSize({width:430,height:1800});
  for(const [id,{slug,kind}] of routes) {
    if(selected&&!selected.includes(`citizenship-${id}`))continue;
    const route=`/citizenship?q=${encodeURIComponent(slug.replaceAll('-',' '))}&kind=${kind}`;
    await visit('http://127.0.0.1:3102'+route);
    const article=page.locator(`[role="article"][id="${slug}"]`);
    if(!await article.count()) {
      await visit(`http://127.0.0.1:3102/citizenship?kind=${kind}#${slug}`);
    }
    const card=page.locator(`[role="article"][id="${slug}"]`);
    await capture(`citizenship-${id}`,[card.locator(':scope > div').nth(0),card.locator(':scope > div').nth(1).locator(':scope > div').first()],`https://hashtagweb3.com/citizenship?kind=${kind}#${slug}`,'Contiguous country identity, actual starting amount and route kind. Official-program and Compare controls excluded. Starting amount is not an all-inclusive price. Browser native font preference enlarged; no DOM or stylesheet changes.');
  }
  await page.setViewportSize({width:530,height:1800});
  await visit('https://hashtagweb3.com/interview-questions');
  for(const original of learning.filter(c=>/-(SOL|FE|AUD)-/.test(c.id))) {
    if(selected&&!selected.includes(original.id))continue;
    const questionId=original.id.match(/(?:SOL|FE|AUD)-[FIAE]-\d{2}$/)[0];
    const section=page.locator('#'+original.route.split('#')[1]);
    const difficulty={F:'Foundation',I:'Intermediate',A:'Advanced',E:'Expert'}[questionId.split('-')[1]];
    const trigger=section.getByRole('button',{name:difficulty+' Questions',exact:true});
    if(await trigger.getAttribute('aria-expanded')!=='true') await trigger.click();
    const card=section.locator('div.border-b.py-4').filter({has:page.getByText(questionId,{exact:true})});
    await page.evaluate(async()=>{await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))});
    await capture(original.id,[card.locator(':scope > div').first(),card.locator(':scope > p')],original.sourceUrl,'Original question and source ID at browser-native enlarged font preference. The bank answer is excluded. An authored answer summary is separate in the master. No content or styling was rewritten.');
  }
  }
  for(const [id,route,start] of [
    ['lesson-wallet','/wallet-basics','In a self-custodial wallet'],
    ['lesson-lending','/defi-lending','A collateralized position generally'],
    ['lesson-testing','/contract-testing',"Tests check a contract's behavior"],
    ['lesson-growth','/growth-metrics','Define what each dataset measures:'],
    ['lesson-agents','/onchain-agents','Choose permissions per action.'],
  ]) {
    if(selected&&!selected.includes(id))continue;
    await visit('https://hashtagweb3.com'+route);
    const paragraph=page.locator('article .learn-content > p').filter({hasText:start});
    assert.equal(await paragraph.count(),1,id);
    await capture(id,[paragraph],'https://hashtagweb3.com'+route,'Complete original lesson paragraph, enlarged through the browser native font preference. No DOM edits. Course and lesson names are separately attributed in the master.');
  }
} finally { await browser.close(); }
await writeJSON('assets/revision/detail-captures.json',records);
await protect();
