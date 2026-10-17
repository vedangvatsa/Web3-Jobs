import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import sharp from 'sharp';

const root=path.dirname(fileURLToPath(import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const manifest=JSON.parse(await fs.readFile(path.join(root,'image-manifest.json'),'utf8'));
const contentBytes=await fs.readFile(path.join(root,'content.json'));
const content=JSON.parse(contentBytes);
const checks=JSON.parse(await fs.readFile(path.join(root,'assets/render-checks.json'),'utf8'));
assert.equal(hash(contentBytes),'0746fb349f7f2dec4813b8df5ecaf50ef9443ae6f66709d549c738ca28afd761','Original manuscript hash');
assert.equal(manifest.contentSha256,hash(contentBytes));
assert.equal(checks.issueCount,0);assert.equal(checks.contrastFailureCount,0);assert.deepEqual(checks.pageErrors,[]);
const actualFiles=await fs.readdir(path.join(root,'images'));
assert.equal(actualFiles.length,180);assert.ok(actualFiles.every(file=>/^[CEN]\d{2}-0[1-6]\.jpg$/.test(file)));
assert.equal(manifest.images.length,180);assert.equal(new Set(manifest.images.map(i=>i.sha256)).size,180);
let totalBytes=0,minBytes=Infinity,maxBytes=0;
for(const thread of content.threads){
  const images=manifest.images.filter(i=>i.threadId===thread.id);
  assert.deepEqual(images.map(i=>i.postNumber),[1,2,3,4,5,6]);
  await fs.access(path.join(root,'contact-sheets',thread.id+'.jpg'));
  for(const image of images){
    const bytes=await fs.readFile(path.join(root,image.path));
    const meta=await sharp(bytes).metadata();
    assert.equal(hash(bytes),image.sha256);assert.equal(meta.format,'jpeg');assert.equal(meta.width,1200);assert.equal(meta.height,1500);assert.equal(meta.space,'srgb');assert.ok(bytes.length<5_000_000);assert.equal(bytes.length,image.bytes);
    const post=thread.posts[image.postNumber-1];
    assert.equal(hash(JSON.stringify(post)),image.contentPostSha256);
    assert.equal(image.canonicalUrl,content.siteOrigin+(post.linkPath||''));
    assert.ok(!/\/(x|th)(?:[/?#]|$)/.test(image.canonicalUrl));
    assert.ok(image.alt.length>100&&image.alt.length<=1000);
    assert.ok(image.sourceUrls.length>0);
    if(post.visual.composition==='screenshot')assert.ok(image.assetPaths.length>0);
    for(const asset of image.assetPaths)await fs.access(path.join(root,asset));
    totalBytes+=bytes.length;minBytes=Math.min(minBytes,bytes.length);maxBytes=Math.max(maxBytes,bytes.length);
  }
}
assert.equal(totalBytes,manifest.totalBytes);
for(const name of ['inter.woff2','wordmark.png'])assert.equal(hash(await fs.readFile(path.join(root,'assets',name))),hash(await fs.readFile(path.join(root,'../nomad-resources-thread/assets',name))));
const captures=JSON.parse(await fs.readFile(path.join(root,'assets/capture-credits.json'),'utf8'));
const capturePaths=new Set(captures.map(c=>c.file));
for(const image of manifest.images.filter(i=>i.composition==='screenshot'))for(const asset of image.assetPaths)assert.ok(capturePaths.has(asset),asset);

const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{const bytes=await fs.readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'}).end(bytes);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,executablePath:'/Users/vedang/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
const page=await browser.newPage();const pageErrors=[];page.on('pageerror',err=>pageErrors.push(err.message));
const viewports=[];
try{
  await page.goto(base+'/preview.html');
  await page.waitForFunction(()=>document.querySelectorAll('figure').length===180);
  assert.equal(await page.locator('#nav a').count(),30);
  assert.equal(await page.locator('figure>a').count(),180);
  for(const width of [360,390,768,1440]){
    await page.setViewportSize({width,height:900});
    const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,gridColumns:getComputedStyle(document.querySelector('.grid')).gridTemplateColumns,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length}));
    assert.ok(result.scrollWidth<=width,JSON.stringify(result));assert.equal(result.brokenImages,0);viewports.push(result);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.mode').focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('.mode').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('figure img').first().evaluate(el=>Math.round(el.getBoundingClientRect().width)),390);
  await page.keyboard.press('Space');assert.equal(await page.locator('.mode').getAttribute('aria-pressed'),'false');
  for(const link of await page.locator('#nav a').all()){await link.click();const id=await link.getAttribute('href');assert.equal(await page.locator(id).count(),1);}
  const descriptions=await page.locator('details').all();
  for(const detail of descriptions){await detail.locator('summary').click();assert.ok(await detail.getAttribute('open')!==null);await detail.locator('summary').click();}
  await page.locator('#nav a').first().focus();await page.keyboard.press('Enter');assert.ok(page.url().endsWith('#C01'));
  const imageLinks=await page.locator('figure>a,.master').evaluateAll(links=>links.map(a=>a.href));
  for(const link of imageLinks){const response=await page.request.get(link);assert.equal(response.status(),200,link);}
  assert.deepEqual(pageErrors,[]);
  const originalManifest=await fs.readFile(path.join(root,'image-manifest.json'));
  await page.route('**/image-manifest.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({...manifest,images:[]})}));
  await page.goto(base+'/preview.html');await page.getByText('No rendered images are listed yet.').waitFor();
  await page.unroute('**/image-manifest.json');
  await page.route('**/image-manifest.json',route=>route.fulfill({status:503,body:'Unavailable'}));
  await page.goto(base+'/preview.html');await page.getByText('The image manifest could not load. Serve this folder over local HTTP and reload.').waitFor();
  assert.equal(hash(await fs.readFile(path.join(root,'image-manifest.json'))),hash(originalManifest));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
const counts=Object.fromEntries([...new Set(manifest.images.map(i=>i.visualKind))].map(k=>[k,manifest.images.filter(i=>i.visualKind===k).length]));
const report={validatedAt:new Date().toISOString(),status:'PASS',masterCount:180,threadCount:30,dimensions:'1200x1500',format:'JPEG',colorSpace:'sRGB',uniqueHashes:180,totalBytes,totalMiB:totalBytes/1048576,minBytes,maxBytes,limitBytes:5_000_000,sourceManuscriptUnchanged:true,contentSha256:hash(contentBytes),layoutIssues:0,textCollisions:0,authoredTextContrastFailures:0,missingImages:0,renderPageErrors:0,screenshotBriefs:manifest.images.filter(i=>i.composition==='screenshot').length,productCaptureFiles:captures.length,layoutKinds:counts,contactSheets:30,mobilePreviewSheets:5,gallery:{viewports,threadAnchors:30,masterLinks:180,contactSheetLinks:30,descriptionToggles:180,keyboardControls:true,mobileModeWidth:390,emptyState:true,errorState:true},altTextMaxCharacters:Math.max(...manifest.images.map(i=>i.alt.length))};
await fs.writeFile(path.join(root,'assets/validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
