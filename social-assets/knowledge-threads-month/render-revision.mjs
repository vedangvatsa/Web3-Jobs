import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import sharp from 'sharp';
import {root, executablePath, hash, readJSON, writeJSON, protect, serve, esc} from './revision-lib.mjs';

await protect();
const published=await readJSON('assets/revision/published-prefix-2026-10-22.json');
const publishedIds=new Set(published.threadIds);
assert.deepEqual([...publishedIds].sort(),['C01','C02','E01','E02','N01']);
assert.equal(published.throughDate,'2026-10-22');
const manuscriptBytes=await fs.readFile(path.join(root,'content.json'));
const contentSha256=hash(manuscriptBytes),content=JSON.parse(manuscriptBytes);
const calendar=await readJSON('calendar.json');
const calendarSha256=hash(await fs.readFile(path.join(root,'calendar.json')));
const sourceRegistry=(await readJSON('assets/revision/visual-assets.json')).assets;
const auditOnly=process.argv.includes('--audit-only');
const reproduceOnly=process.argv.includes('--verify-reproducible');
const priorManifest=await readJSON('image-manifest.json');
const priorChecks=await readJSON('assets/render-checks.json');
const priorAudit=await readJSON('assets/revision/render-audit.json');
const frozenEntries=priorManifest.images.filter(i=>publishedIds.has(i.threadId));
const isPublishedCheck=c=>publishedIds.has(c.id.split('-')[0]);
const frozenChecks=priorChecks.images.filter(isPublishedCheck);
assert.equal(frozenEntries.length,30,'All 30 published masters must exist');
assert.equal(frozenChecks.length,30,'All 30 published checks must exist');

async function assertPublishedUnchanged() {
  await protect();
  const currentContent=await readJSON('content.json'),currentCalendar=await readJSON('calendar.json');
  const currentManifest=await readJSON('image-manifest.json'),currentChecks=await readJSON('assets/render-checks.json');
  for(const thread of published.threads)assert.deepEqual(currentContent.threads.find(t=>t.id===thread.id),thread,`Published thread ${thread.id}`);
  for(const entry of published.calendarEntries)assert.deepEqual(currentCalendar.dates.find(d=>d.id===entry.id),entry,`Published date ${entry.id}`);
  for(const entry of published.manifestEntries)assert.deepEqual(currentManifest.images.find(i=>i.path===entry.path),entry,`Published manifest entry ${entry.path}`);
  assert.deepEqual(currentManifest.images.filter(i=>publishedIds.has(i.threadId)),frozenEntries,'Published manifest entries changed');
  assert.deepEqual(currentChecks.images.filter(isPublishedCheck),frozenChecks,'Published checks changed');
  for(const [file,sha256] of Object.entries(published.files))assert.equal(hash(await fs.readFile(path.join(root,file))),sha256,`Published file ${file}`);
}

const futureThreads=content.threads.filter(t=>t.sequence>5&&!publishedIds.has(t.id)).sort((a,b)=>a.sequence-b.sequence);
assert.equal(futureThreads.length,25,'Expected 25 future threads');
for(const thread of futureThreads) {
  const date=calendar.dates.find(d=>d.id===thread.id);
  assert(date&&date.sequence===thread.sequence&&date.date>='2026-10-23'&&date.date<='2026-11-16',`Future publication window: ${thread.id}`);
}
const futureJobs=futureThreads.flatMap(thread=>thread.posts.map(post=>({thread,post,id:`${thread.id}-${String(post.number).padStart(2,'0')}`})));
assert.equal(futureJobs.length,150,'Expected 150 future images');
assert.equal(new Set(futureJobs.map(j=>j.id)).size,150,'Future image IDs must be unique');
const selected=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
if(selected)for(const id of selected)assert(futureJobs.some(j=>id===j.thread.id||id===j.id),`Only future thread/post IDs (sequence > 5) are allowed: ${id}`);
const jobs=futureJobs.filter(j=>!selected||selected.includes(j.thread.id)||selected.includes(j.id));
const workers=Number(process.argv.find(a=>a.startsWith('--workers='))?.slice(10)||3);
assert(Number.isInteger(workers)&&workers>=1,'Workers must be a positive integer');
for(const {post,id} of jobs) {
  assert.equal(typeof post.alt,'string',`${id}: curated post.alt is required`);
  assert(post.alt.length>=100&&post.alt.length<=1000,`${id}: alt length ${post.alt.length}; expected 100-1000`);
  assert.equal(post.alt,post.alt.trim(),`${id}: alt has surrounding whitespace`);
}
await assertPublishedUnchanged();
const {server,url}=await serve(Number(process.argv.find(a=>a.startsWith('--port='))?.slice(7)||0));
if(process.argv.includes('--serve')){console.log(`Preview: ${url}/preview.html`);await new Promise(()=>{});}
const browserArgs=['--disable-gpu','--force-color-profile=srgb','--deterministic-mode','--disable-lcd-text','--font-render-hinting=none'];
const browser=await chromium.launch({headless:true,executablePath,args:browserArgs});
const renderEnvironment={chromiumVersion:await browser.version(),executablePath,browserArgs,nodeVersion:process.version,sharpVersion:sharp.versions.sharp,vipsVersion:sharp.versions.vips,viewport:{width:1200,height:1500,deviceScaleFactor:1},jpeg:{quality:90,chromaSubsampling:'4:4:4',mozjpeg:true},isolatedContextPerMaster:true};
const images=[],checks=[],errors=[];

function inspectBoard(board) {
  const issues=[],contrastFailures=[],textBoxes=[],fonts=[],bodyLineHeights=[];
  const box=board.getBoundingClientRect(),stage=board.querySelector('.stage'),sb=stage.getBoundingClientRect(),footer=board.querySelector('.footer').getBoundingClientRect();
  if(getComputedStyle(board).backgroundColor!=='rgb(255, 255, 255)')issues.push({type:'board-background-not-white'});
  if(sb.left-box.left<64||box.right-sb.right<64)issues.push({type:'outer-gutter-too-small'});
  const lum=color=>{const c=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
  const walker=document.createTreeWalker(board,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())) {
    if(!node.textContent.trim())continue;
    const element=node.parentElement,style=getComputedStyle(element);if(style.display==='none')continue;
    const range=document.createRange();range.selectNodeContents(node);
    const rects=[...range.getClientRects()].filter(r=>r.width&&r.height);
    if(!rects.length)continue;
    const size=parseFloat(style.fontSize),metadata=!!element.closest('.footer,.serial,.shot-caption,.photo-credit,.source-line');
    if(size<42)issues.push({type:metadata?'metadata-font-too-small':'body-font-too-small',text:node.textContent,size});
    if(!metadata)fonts.push(size);
    if(element.closest('.stage')&&!element.closest('h1,h2,h3,.big-number,.metric dd,.fee-total')) {
      const lineHeight=parseFloat(style.lineHeight)/size;
      bodyLineHeights.push(lineHeight);
      if(!Number.isFinite(lineHeight)||lineHeight<1.4-.001)issues.push({type:'body-line-height-too-tight',text:node.textContent,lineHeight});
    }
    let bg=element;
    while(bg&&['transparent','rgba(0, 0, 0, 0)'].includes(getComputedStyle(bg).backgroundColor))bg=bg.parentElement;
    if(bg){const a=lum(style.color),b=lum(getComputedStyle(bg).backgroundColor),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(ratio<4.5)contrastFailures.push({text:node.textContent,ratio});}
    for(const r of rects) {
      if(r.left<box.left-1||r.right>box.right+1||r.top<box.top-1||r.bottom>box.bottom+1)issues.push({type:'glyph-outside-board',text:node.textContent});
      if(stage.contains(element)&&r.bottom>sb.bottom+1)issues.push({type:'stage-text-overflow',text:node.textContent,bottom:r.bottom,limit:sb.bottom});
      const container=element.closest('.answer,.country-block,.salary-row,.city-row,.city-pair,.metric,.event-row,.detail-row,.slot');
      if(container){const c=container.getBoundingClientRect();if(r.left<c.left-1||r.right>c.right+1||r.bottom>c.bottom+1)issues.push({type:'text-outside-container',text:node.textContent});}
      for(const previous of textBoxes)if(previous.element!==element&&Math.min(previous.right,r.right)-Math.max(previous.left,r.left)>2&&Math.min(previous.bottom,r.bottom)-Math.max(previous.top,r.top)>2)issues.push({type:'text-collision',a:previous.text,b:node.textContent});
      textBoxes.push({left:r.left,right:r.right,top:r.top,bottom:r.bottom,text:node.textContent,element});
    }
  }
  const sourceImages=[...stage.querySelectorAll('img')].map(img=>{
    const b=img.getBoundingClientRect(),style=getComputedStyle(img);
    if(/capture/.test(img.dataset.sourceKind)&&style.objectFit!=='contain')issues.push({type:'capture-not-contained',file:img.getAttribute('src')});
    if(img.classList.contains('landmark')&&style.objectFit!=='contain')issues.push({type:'landmark-not-contained',file:img.getAttribute('src')});
    if(b.bottom>sb.bottom+1||b.right>sb.right+1||b.left<sb.left-1)issues.push({type:'image-stage-overflow',file:img.getAttribute('src'),bottom:b.bottom,limit:sb.bottom});
    for(const text of textBoxes)if(Math.min(text.right,b.right)-Math.max(text.left,b.left)>2&&Math.min(text.bottom,b.bottom)-Math.max(text.top,b.top)>2)issues.push({type:'text-image-collision',text:text.text,file:img.getAttribute('src')});
    return{assetId:img.dataset.asset,path:img.getAttribute('src'),renderedWidth:b.width,renderedHeight:b.height,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,objectFit:getComputedStyle(img).objectFit};
  });
  for(const el of [stage,...stage.children])if(el.scrollWidth>el.clientWidth+2)issues.push({type:'horizontal-overflow',className:el.className});
  if(sb.bottom>footer.top-10)issues.push({type:'stage-footer-collision'});
  const productionLabel=/\b(?:authored|genuine|local capture|locally rendered|rendered locally|real (?:app(?:lication)?|local preview)|original question|model(?: output)?[,;:]?\s+not observed pay|model only|annual USD (?:salary )?model)\b/i;
  if(productionLabel.test(board.innerText))issues.push({type:'production-label-in-copy',text:board.innerText.match(productionLabel)[0]});
  return{issues,contrastFailures,minimumAuthoredBodyPx:Math.min(...fonts),minimumAuthoredBodyAt390:Math.min(...fonts)*390/1200,minimumBodyLineHeight:bodyLineHeights.length?Math.min(...bodyLineHeights):null,missingImages:[...board.querySelectorAll('img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),sourceImages,heading:board.querySelector('h1').innerText,renderedText:board.innerText,mainText:stage.innerText,stageHeight:sb.height,contentHeight:stage.scrollHeight};
}

async function worker() {
  while(jobs.length) {
    const {thread,post,id}=jobs.shift();
    assert(thread.sequence>5&&!publishedIds.has(thread.id),`Cannot render published image ${id}`);
    const alt=post.alt;
    const page=await browser.newPage({viewport:{width:1200,height:1500},deviceScaleFactor:1});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'/boards-revision.html');
    await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
    const plan=await page.evaluate(([t,n])=>window.showRevision(t,n),[thread.id,post.number]);
    assert.equal(plan.alt,alt,`${id}: board must use curated post.alt unchanged`);
    assert.equal(await page.locator('.board').getAttribute('aria-label'),alt,`${id}: accessible description changed`);
    const result=await page.locator('.board').evaluate(inspectBoard);
    result.id=id;
    result.sourceLegibility=result.sourceImages.map(i=>{
      const a=plan.assets.find(a=>a.id===i.assetId);
      return{assetId:i.assetId,sourceCssPx:a.minimumTextCssPx||null,minSourceTextAt390:a.minimumTextCssPx?Number((a.minimumTextCssPx*(a.deviceScaleFactor||2)*i.renderedWidth/a.width*390/1200).toFixed(2)):null,role:a.kind};
    });
    checks.push(result);
    assert.deepEqual(result.missingImages,[],id);
    if(result.issues.length||result.contrastFailures.length){console.log(`${id} FAIL ${result.issues.length} layout, ${result.contrastFailures.length} contrast; ${result.contentHeight}/${result.stageHeight}px`);await page.close();continue;}
    if(auditOnly){console.log(`${id} OK`);await page.close();continue;}
    const raw=await page.locator('.board').screenshot({type:'png',animations:'disabled'});
    await page.close();
    const bytes=await sharp(raw).jpeg({quality:90,chromaSubsampling:'4:4:4',mozjpeg:true}).toBuffer();
    const meta=await sharp(bytes,{failOn:'error'}).metadata();
    await sharp(bytes,{failOn:'error'}).raw().toBuffer();
    assert.equal(meta.width,1200);assert.equal(meta.height,1500);assert.ok(bytes.length<5_000_000,id);
    const file=`images/${id}.jpg`;
    if(reproduceOnly)assert.equal(hash(bytes),priorManifest.images.find(i=>i.path===file).sha256,'Byte-reproducible master '+id);
    else await fs.writeFile(path.join(root,file),bytes);
    const referenceIds={'N05-06':'RESUME-junior-preview','N10-06':'INVOICE-sample-preview','C09-06':'RESUME-content-preview','E03-06':'QUIZ-builder-result','C08-06':'QUIZ-analyst-result'};
    const reference=referenceIds[id]?sourceRegistry.find(a=>a.id===referenceIds[id]):null;
    images.push({threadId:thread.id,threadSequence:thread.sequence,threadTitle:thread.title,postNumber:post.number,path:file,repoPath:'social-assets/knowledge-threads-month/'+file,sha256:hash(bytes),width:1200,height:1500,bytes:bytes.length,alt,canonicalUrl:content.siteOrigin+(post.linkPath||''),composition:post.visual.composition,visualKind:plan.kind,actualHeading:result.heading,publicationDate:calendar.dates.find(d=>d.id===thread.id).date,contentPostSha256:hash(JSON.stringify(post)),sourceUrls:thread.sources.filter(s=>s.supports.some(s=>s.posts.includes(post.number))).map(s=>s.url),assetPaths:plan.assets.map(a=>a.file),sourceAssets:plan.assets.map(a=>({file:a.file,sha256:a.sha256,kind:a.kind,sourceUrl:a.sourceUrl,sourceRevision:a.sourceRevision,derivedFrom:a.derivedFrom,parentSha256:a.parentSha256,extract:a.extract,provenance:a.provenance,caption:a.caption})),referenceAssets:reference?[{file:reference.file,sha256:reference.sha256,sourceUrl:reference.sourceUrl,kind:'Complete original source preview',provenance:'Full unretouched source preview for inspection. The master uses readable excerpts.'}]:[],renderedText:result.renderedText});
    console.log(`${id} ${Math.round(bytes.length/1024)} KB OK`);
  }
}
try{await Promise.all(Array.from({length:workers},worker));}finally{await browser.close();await new Promise(r=>server.close(r));}
checks.sort((a,b)=>a.id.localeCompare(b.id));
const issueCount=checks.reduce((n,c)=>n+c.issues.length,0),contrastFailureCount=checks.reduce((n,c)=>n+c.contrastFailures.length,0);
assert.equal(hash(await fs.readFile(path.join(root,'content.json'))),contentSha256,'Manuscript changed during rendering');
assert.equal(hash(await fs.readFile(path.join(root,'calendar.json'))),calendarSha256,'Calendar changed during rendering');
await assertPublishedUnchanged();
if(auditOnly){console.log(JSON.stringify({auditOnly:true,checked:checks.length,issueCount,contrastFailureCount,errors},null,2));process.exit(issueCount||contrastFailureCount||errors.length?1:0);}
if(reproduceOnly){assert.equal(issueCount,0);assert.equal(contrastFailureCount,0);assert.deepEqual(errors,[]);const evidence={checkedAt:new Date().toISOString(),contentSha256,byteIdenticalMasters:images.length,masters:images.map(i=>({file:i.path,sha256:i.sha256})),renderEnvironment};await writeJSON('assets/revision/reproducibility.json',evidence);console.log(JSON.stringify({byteIdenticalMasters:images.length,issueCount,contrastFailureCount},null,2));process.exit(0);}
const mergeChecks=existing=>[...existing.filter(c=>!checks.some(next=>next.id===c.id)),...checks];
const auditChecks=mergeChecks(priorAudit.images);
assert.deepEqual(auditChecks.filter(isPublishedCheck),priorAudit.images.filter(isPublishedCheck),'Published audit checks changed');
await writeJSON('assets/revision/render-audit.json',{checkedAt:new Date().toISOString(),contentSha256,calendarSha256,pageErrors:errors,issueCount:auditChecks.reduce((n,c)=>n+c.issues.length,0),contrastFailureCount:auditChecks.reduce((n,c)=>n+c.contrastFailures.length,0),images:auditChecks});
assert.equal(issueCount,0,'Resolve all layout issues');assert.equal(contrastFailureCount,0);assert.deepEqual(errors,[]);
for(const image of images) {
  const post=content.threads.find(t=>t.id===image.threadId).posts.find(p=>p.number===image.postNumber);
  assert.equal(image.alt,post.alt,`${image.path}: curated alt changed during rendering`);
}
let previous=await readJSON('image-manifest.json');
if(selected)for(const image of previous.images.filter(i=>i.threadSequence>5&&!publishedIds.has(i.threadId)))if(!images.some(i=>i.path===image.path))images.push(image);
images.push(...frozenEntries);
images.sort((a,b)=>a.threadSequence-b.threadSequence||a.postNumber-b.postNumber);
assert.equal(images.length,180);assert.equal(new Set(images.map(i=>i.sha256)).size,180);
assert.deepEqual(images.filter(i=>publishedIds.has(i.threadId)),frozenEntries,'Published entries must survive the manifest merge exactly');
const manifest={schemaVersion:2,generatedAt:new Date().toISOString(),contentSha256,calendarSha256,threadCount:30,masterCount:180,replacementCount:150,publishedHistoryCount:30,totalBytes:images.reduce((n,i)=>n+i.bytes,0),format:'JPEG',colorSpace:'sRGB',width:1200,height:1500,renderer:'render-revision.mjs',renderEnvironment,sourceCredits:'assets/revision/source-credits.json',captureCredits:'assets/revision/capture-credits.json',images};
await writeJSON('image-manifest.json',manifest);
const oldChecks=await readJSON('assets/render-checks.json');
const allChecks=mergeChecks(oldChecks.images);
assert.deepEqual(allChecks.filter(isPublishedCheck),frozenChecks,'Published checks must survive the merge exactly');
assert.equal(allChecks.length,180);assert.equal(new Set(allChecks.map(c=>c.id)).size,180);
await writeJSON('assets/render-checks.json',{checkedAt:new Date().toISOString(),contentSha256,calendarSha256,issueCount:0,contrastFailureCount:0,pageErrors:[],images:allChecks});
const allAssets=(await readJSON('assets/revision/visual-assets.json')).assets;
const used=new Set(images.flatMap(i=>i.assetPaths||[]));
await writeJSON('assets/revision/source-credits.json',{recordedAt:new Date().toISOString(),contentSha256,brand:[{file:'assets/wordmark.png',credit:'Existing Hashtag Web3 wordmark'},{file:'assets/inter.woff2',credit:'Existing approved Inter font'}],sources:allAssets.filter(a=>used.has(a.file)),factSources:'content.json per-post source mappings; assets/revision/source-data.json',policy:'Photographs illustrate places. Official-rule summaries and comparisons are authored, not website UI. Salary figures are model estimates; resume and invoice parties are fictional; catalog counts are historical. Event covers use contain.'});
await writeJSON('assets/revision/capture-credits.json',allAssets.filter(a=>used.has(a.file)&&/capture/.test(a.kind)));
await fs.writeFile(path.join(root,'ALT-TEXT.md'),'# Image descriptions\n\nC01, E01, N01, C02 and E02 are preserved published history through October 22, 2026. Future descriptions use the curated post alt text.\n\n'+images.map(i=>`## ${i.threadId}-${String(i.postNumber).padStart(2,'0')}\n\n\`${i.path}\`\n\n${i.alt}\n`).join('\n'));
await fs.mkdir(path.join(root,'assets/revision/mobile'),{recursive:true});
for(const thread of futureThreads) {
  if(selected&&!selected.some(s=>s===thread.id||s.startsWith(thread.id+'-')))continue;
  const members=images.filter(i=>i.threadId===thread.id),layers=[];
  const header=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1206" height="80"><rect width="100%" height="100%" fill="#fff"/><text x="12" y="28" font-family="Arial" font-size="21" fill="#171719">${esc(thread.id+' · '+thread.title)}</text><text x="12" y="59" font-family="Arial" font-size="20" fill="#176349">${esc(calendar.dates.find(d=>d.id===thread.id).date)} · Six replacement masters · Each image at 390 px</text></svg>`);
  layers.push({input:header,left:0,top:0});
  for(const [index,image] of members.entries())layers.push({input:await sharp(path.join(root,image.path)).resize(390,488).toBuffer(),left:6+(index%3)*402,top:86+Math.floor(index/3)*500});
  await sharp({create:{width:1206,height:1080,channels:3,background:'#fff'}}).composite(layers).jpeg({quality:91,chromaSubsampling:'4:4:4'}).toFile(path.join(root,'contact-sheets',thread.id+'.jpg'));
  for(const image of members)await sharp(path.join(root,image.path)).resize(390,488).jpeg({quality:93,chromaSubsampling:'4:4:4'}).toFile(path.join(root,'assets/revision/mobile',path.basename(image.path)));
}
await assertPublishedUnchanged();
console.log(JSON.stringify({replacements:images.filter(i=>i.threadSequence>5).length,masters:180,issueCount,contrastFailureCount,totalMiB:manifest.totalBytes/1048576,maxBytes:Math.max(...images.map(i=>i.bytes)),contentSha256},null,2));
