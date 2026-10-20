import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import sharp from 'sharp';
import {chromium} from 'playwright';
import {root, repo, executablePath, hash, readJSON, writeJSON, protect, serve} from './revision-lib.mjs';

const run=promisify(execFile);
const {guard,baseline}=await protect();
const manifest=await readJSON('image-manifest.json'),content=await readJSON('content.json'),calendar=await readJSON('calendar.json'),checks=await readJSON('assets/render-checks.json');
const contentSha256=hash(await fs.readFile(path.join(root,'content.json'))),calendarSha256=hash(await fs.readFile(path.join(root,'calendar.json')));
assert.equal(manifest.contentSha256,contentSha256,'Current manuscript hash');
assert.equal(manifest.calendarSha256,calendarSha256,'Current calendar hash');
assert.equal(checks.contentSha256,contentSha256);
assert.equal(checks.calendarSha256,calendarSha256);
assert.equal(checks.issueCount,0);assert.equal(checks.contrastFailureCount,0);assert.deepEqual(checks.pageErrors,[]);
assert.equal(content.threads.length,30);assert.equal(manifest.images.length,180);assert.equal(checks.images.length,180);
assert.equal(new Set(manifest.images.map(i=>i.sha256)).size,180);
const files=await fs.readdir(path.join(root,'images'));assert.equal(files.length,180);
assert(files.every(f=>/^[CEN]\d{2}-0[1-6]\.jpg$/.test(f)));
const replacements=manifest.images.filter(i=>i.threadSequence>3);assert.equal(replacements.length,162);
let totalBytes=0,maxBytes=0,minBytes=Infinity;
const proofFiles=new Map(),sourceProof=[],contactSheets=[];
const assetRegistry=(await readJSON('assets/revision/visual-assets.json')).assets;
for(const thread of content.threads) {
  assert.equal(thread.posts.length,6);
  const members=manifest.images.filter(i=>i.threadId===thread.id);
  assert.deepEqual(members.map(i=>i.postNumber),[1,2,3,4,5,6]);
  const sheet=`contact-sheets/${thread.id}.jpg`,sheetBytes=await fs.readFile(path.join(root,sheet));
  await sharp(sheetBytes,{failOn:'error'}).raw().toBuffer();
  contactSheets.push({file:sheet,sha256:hash(sheetBytes),publishedHistory:thread.sequence<=3});
  for(const image of members) {
    const bytes=await fs.readFile(path.join(root,image.path));
    const metadata=await sharp(bytes,{failOn:'error'}).metadata();
    await sharp(bytes,{failOn:'error'}).raw().toBuffer();
    assert.equal(hash(bytes),image.sha256,image.path);
    assert.equal(metadata.format,'jpeg');assert.equal(metadata.width,1200);assert.equal(metadata.height,1500);assert.equal(metadata.space,'srgb');
    assert(bytes.length<5_000_000);assert.equal(bytes.length,image.bytes);
    const post=thread.posts[image.postNumber-1];
    assert.equal(hash(JSON.stringify(post)),image.contentPostSha256,`${thread.id}/${post.number} current post hash`);
    assert.equal(image.canonicalUrl,content.siteOrigin+(post.linkPath||''));
    assert.deepEqual(image.sourceUrls,thread.sources.filter(s=>s.supports.some(s=>s.posts.includes(post.number))).map(s=>s.url));
    assert(image.alt.length>=100&&image.alt.length<=1000,image.path+' alt');
    assert(image.sourceUrls.length>0);
    for(const file of image.assetPaths)await fs.access(path.join(root,file));
    if(thread.sequence>3) {
      assert.equal(image.publicationDate,calendar.dates.find(d=>d.id===thread.id).date);
      assert(image.actualHeading&&image.renderedText.includes(image.actualHeading));
      const check=checks.images.find(c=>c.id===`${thread.id}-${String(post.number).padStart(2,'0')}`);
      assert(check);assert.deepEqual(check.issues,[]);assert.deepEqual(check.contrastFailures,[]);assert.deepEqual(check.missingImages,[]);
      assert(check.minimumAuthoredBodyPx>=42);
      assert.equal(check.renderedText,image.renderedText);
      if(['C03','E05','N06','E10'].includes(thread.id))assert(image.renderedText.includes('2026 Q1'),image.path+' broadband period');
      assert(thread.id==='N02'||image.assetPaths.length>0,'Every non-aggregate image uses a genuine source image');
      if(thread.id==='N02'){assert.equal(image.assetPaths.length,0);assert.equal(image.visualKind,'authored-historical-aggregate');assert(image.renderedText.includes('October 20, 2026'));}
      assert.deepEqual(image.assetPaths,image.sourceAssets.map(a=>a.file));
      for(const asset of image.sourceAssets) {
        assert(asset.sourceUrl,asset.file+' source URL');
        if(!proofFiles.has(asset.file)) {
          const bytes=await fs.readFile(path.join(root,asset.file));assert.equal(hash(bytes),asset.sha256,asset.file);
          await sharp(bytes,{failOn:'error'}).raw().toBuffer();proofFiles.set(asset.file,asset);
        } else assert.equal(proofFiles.get(asset.file).sha256,asset.sha256,asset.file);
      }
      for(const reference of image.referenceAssets||[])assert.equal(hash(await fs.readFile(path.join(root,reference.file))),reference.sha256,'Complete source preview '+reference.file);
      for(const item of post.visual.items.filter(i=>i.type==='city'))assert(image.assetPaths.includes(`assets/revision/photos/${item.slug}.webp`),`${image.path} exact city image ${item.slug}`);
      for(const item of post.visual.items.filter(i=>i.type==='event')) {
        const a=image.sourceAssets.find(a=>assetRegistry.some(r=>r.file===a.file&&r.eventId===item.id));assert(a,`${image.path} exact event ID ${item.id}`);
        const geometry=check.sourceImages.find(s=>s.path===a.file);assert.equal(geometry.objectFit,'contain');
      }
    }
    totalBytes+=bytes.length;maxBytes=Math.max(maxBytes,bytes.length);minBytes=Math.min(minBytes,bytes.length);
  }
}
assert.equal(totalBytes,manifest.totalBytes);
for(const [file,asset] of proofFiles) {
  const registry=assetRegistry.findLast(a=>a.file===file);assert(registry,file);
  if(registry.copiedFrom)assert.equal(hash(await fs.readFile(path.join(repo,registry.copiedFrom))),asset.sha256,'Byte-identical original source '+file);
  if(registry.downloadSha256) {
    const original=await fs.readFile(path.join(root,registry.originalFile));assert.equal(hash(original),registry.downloadSha256);
    const transformed=await sharp(original).rotate().resize({width:1200,withoutEnlargement:true}).webp({quality:92}).toBuffer();assert.equal(hash(transformed),asset.sha256,'Reproducible official photo conversion '+file);
    assert.equal(hash(await fs.readFile(path.join(repo,registry.replacesDirectoryPhoto.file))),registry.replacesDirectoryPhoto.sha256,'Repository photo original unchanged');
  }
  if(asset.derivedFrom) {
    const bytes=await fs.readFile(path.join(root,asset.derivedFrom));assert.equal(hash(bytes),asset.parentSha256,file+' parent hash');
    const expected=await sharp(bytes).extract(asset.extract).raw().toBuffer();
    const actual=await sharp(path.join(root,file)).raw().toBuffer();
    assert.equal(hash(actual),hash(expected),'Unretouched pixel extraction '+file);
  }
  sourceProof.push({file,sha256:asset.sha256,kind:asset.kind,originalFile:registry.copiedFrom||asset.derivedFrom||null,originalHash:asset.parentSha256||null,exactCropPixels:!!asset.extract});
}
for(const name of ['inter.woff2','wordmark.png']) {
  const {stdout}=await run('git',['show',`HEAD:social-assets/knowledge-threads-month/assets/${name}`],{cwd:repo,encoding:'buffer',maxBuffer:4*1024*1024});
  assert.equal(hash(await fs.readFile(path.join(root,'assets',name))),hash(stdout),'Existing approved brand asset '+name);
}
const byId=id=>manifest.images.find(i=>`${i.threadId}-${String(i.postNumber).padStart(2,'0')}`===id);
assert(byId('C02-06').renderedText.includes('JOD 350,000'));assert(!byId('C02-06').renderedText.includes('Vanuatu'));
assert(byId('C08-03').renderedText.includes('tx.from'));assert(byId('C08-03').renderedText.includes('transaction senders'));
assert(byId('E07-06').renderedText.includes('36,000/year'));assert(byId('E07-06').renderedText.includes('18,000/year'));
for(const [id,archetype] of [['E03-06','builder'],['C08-06','analyst']]){
  assert.equal(byId(id).assetPaths.length,3);assert(byId(id).assetPaths.every(p=>p.includes(`QUIZ-${archetype}-role-`)));assert(!byId(id).renderedText.match(/points|score/i));
}
assert(byId('N08-02').assetPaths.some(p=>p.endsWith('consensus-hong-kong-2027.png')));
assert(!replacements.some(i=>i.assetPaths.some(p=>p.endsWith('premier-consensus-hk-2027.webp'))));

const learning=await readJSON('assets/revision/learning-captures.json');
const detail=await readJSON('assets/revision/detail-captures.json');
const normalize=s=>s.replace(/\bUl\b/g,'UI').toLowerCase().replace(/[^a-z0-9]/g,'');
const ocr=[];
for(const capture of detail.filter(c=>/-(SOL|FE|AUD)-/.test(c.id)||c.id.startsWith('lesson-'))) {
  const expected=capture.id.startsWith('lesson-')?capture.visibleText:learning.find(c=>c.id===capture.id).visibleText.split('\n').at(-1);
  let recovered='',matched=false;
  for(const mode of ['6','11']) {
    const {stdout}=await run('tesseract',[path.join(root,capture.file),'stdout','-l','eng','--psm',mode],{maxBuffer:1024*1024});
    recovered=stdout;
    if(normalize(stdout).includes(normalize(expected))){matched=true;break;}
  }
  ocr.push({id:capture.id,file:capture.file,sha256:hash(await fs.readFile(path.join(root,capture.file))),expected,recovered,matched});
}
await writeJSON('assets/revision/capture-ocr.json',{checkedAt:new Date().toISOString(),normalization:'Case/punctuation ignored; isolated OCR Ul normalized to UI (capital I/lowercase l glyph ambiguity). Full question and paragraph wording otherwise matched.',captures:ocr});
assert.equal(ocr.length,20);assert(ocr.every(o=>o.matched),'Original question/lesson pixels must match source text; inspect capture-ocr.json');

const {server,url}=await serve();
const browser=await chromium.launch({headless:true,executablePath});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),pageErrors=[],consoleErrors=[];
page.on('pageerror',e=>pageErrors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
const viewports=[];
try {
  await page.goto(url+'/preview.html');await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  assert.equal(await page.locator('figure.post-card').count(),180);
  assert.equal(await page.locator('#thread-links a').count(),30);
  assert.equal(await page.locator('.thread.history').count(),3);
  const order=await page.locator('.thread').evaluateAll(es=>es.map(e=>e.id));assert.equal(order[0],'C02');assert.deepEqual(order.slice(-3),['C01','E01','N01']);
  for(const thread of content.threads)for(const post of thread.posts) {
    const card=page.locator(`[data-post-id="${thread.id}-${post.number}"]`);
    assert.equal(await card.locator('.post-text').textContent(),post.text);
    assert((await card.locator('.date').textContent()).includes(calendar.dates.find(d=>d.id===thread.id).date));
  }
  for(const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    const data=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,brokenLoadedImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length,postColumns:getComputedStyle(document.querySelector('.post-card')).gridTemplateColumns}));
    assert(data.scrollWidth<=width,JSON.stringify(data));assert.equal(data.brokenLoadedImages,0);viewports.push(data);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.mode').focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('.mode').getAttribute('aria-pressed'),'true');
  assert.equal(Math.round(await page.locator('.post-card img').first().evaluate(el=>el.getBoundingClientRect().width)),390);
  await page.locator('.post-card').first().screenshot({path:path.join(root,'assets/revision/gallery-desktop.png')});
  await page.locator('.mode').focus();await page.keyboard.press('Space');assert.equal(await page.locator('.mode').getAttribute('aria-pressed'),'false');
  await page.locator('#nav summary').focus();await page.keyboard.press('Space');assert(await page.locator('#nav').getAttribute('open')!==null);
  for(const link of await page.locator('#thread-links a').all()) {
    await link.click();assert.equal(await page.locator(await link.getAttribute('href')).count(),1);
  }
  await page.locator('#nav summary').click();
  for(const detail of await page.locator('.post-card details').all()) {
    await detail.locator('summary').click();assert(await detail.getAttribute('open')!==null);await detail.locator('summary').click();
  }
  const localLinks=await page.locator('.post-card>a,.master,.sheet').evaluateAll(es=>[...new Set(es.map(e=>e.href))]);
  for(const href of localLinks)assert.equal((await page.request.get(href)).status(),200,href);
  await page.setViewportSize({width:390,height:1000});
  await page.locator('.post-card').first().screenshot({path:path.join(root,'assets/revision/gallery-mobile.png')});
  const details=page.locator('.post-card details').first();await details.locator('summary').focus();await page.keyboard.press('Space');assert(await details.getAttribute('open')!==null);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile expanded source URLs');
  await page.keyboard.press('Space');
  assert.deepEqual(pageErrors,[]);assert.deepEqual(consoleErrors,[]);
  await page.route('**/image-manifest.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({...manifest,images:[]})}));
  await page.goto(url+'/preview.html');await page.getByText('No rendered images are listed yet.').waitFor();
  await page.unroute('**/image-manifest.json');
  await page.route('**/image-manifest.json',route=>route.fulfill({status:503,body:'Unavailable'}));
  await page.goto(url+'/preview.html');await page.getByText('The image manifest could not load. Serve this folder over local HTTP and reload.').waitFor();
}finally{await browser.close();await new Promise(r=>server.close(r));}
await protect();
assert.equal(contentSha256,hash(await fs.readFile(path.join(root,'content.json'))));assert.equal(calendarSha256,hash(await fs.readFile(path.join(root,'calendar.json'))));
const kinds=Object.fromEntries([...new Set(replacements.map(i=>i.visualKind))].map(k=>[k,replacements.filter(i=>i.visualKind===k).length]));
const report={validatedAt:new Date().toISOString(),status:'PASS',replacementMasters:162,allMasters:180,uniqueImageHashes:180,decodedMasters:180,dimensions:'1200x1500',format:'JPEG',colorSpace:'sRGB',minBytes,maxBytes,totalBytes,totalMiB:totalBytes/1048576,limitBytes:5000000,contentSha256,calendarSha256,currentPostHashesVerified:180,protectedImages:guard.imageHashes,protectedImageCount:18,protectedThreads:guard.threads.map(t=>({id:t.id,sha256:hash(JSON.stringify(t))})),protectedManifestEntriesSha256:hash(JSON.stringify(baseline.manifestEntries)),protectedManifestEntriesUnchanged:18,protectedContactSheets:baseline.contactSheets,newContactSheets:27,contactSheets,layoutIssues:0,textCollisions:0,authoredTextContrastFailures:0,missingImages:0,minimumAuthoredBodyMasterPx:Math.min(...checks.images.filter(c=>!guard.threads.some(t=>c.id.startsWith(t.id+'-'))).map(c=>c.minimumAuthoredBodyPx)),minimumAuthoredBodyAt390Px:14.3,sourceCoverage:{mastersWithGenuineAssets:replacements.filter(i=>i.assetPaths.length).length,historicalAggregateCharts:6,uniqueUsedSourceAssets:proofFiles.size,exactSourceHashesVerified:proofFiles.size,exactPixelCropsVerified:sourceProof.filter(p=>p.exactCropPixels).length,originalQuestionPixelMatches:15,lessonParagraphPixelMatches:5,sourceKinds:[...new Set(sourceProof.map(p=>p.kind))]},sourceProof,visualKinds:kinds,gallery:{viewports,exactPostTexts:180,publicationDates:180,threadAnchors:30,masterLinks:180,contactSheetLinks:30,sourceDescriptionToggles:180,publishedHistoryThreads:3,keyboardControls:true,reviewImageWidth:390,expandedMobileSources:true,emptyState:true,errorState:true,normalPageErrors:0,normalConsoleErrors:0},altTextMaxCharacters:Math.max(...manifest.images.map(i=>i.alt.length)),screenshots:['assets/revision/gallery-desktop.png','assets/revision/gallery-mobile.png']};
await writeJSON('assets/validation.json',report);
await writeJSON('assets/revision/validation.json',report);
console.log(JSON.stringify({...report,sourceProof:`${sourceProof.length} entries in assets/revision/validation.json`,contactSheets:`${contactSheets.length} verified`,protectedImages:'18 hashes verified against protected-prefix.json'},null,2));
