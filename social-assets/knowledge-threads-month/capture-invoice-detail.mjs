import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {chromium} from 'playwright';
import {root, repo, executablePath, readJSON, writeJSON, hash, protect} from './revision-lib.mjs';

await protect();
const published=await readJSON('assets/revision/published-prefix-2026-10-22.json');
async function verifyPublishedFiles() {
  for(const [file,sha256] of Object.entries(published.files))assert.equal(hash(await fs.readFile(path.join(root,file))),sha256,`Published file ${file}`);
}
await verifyPublishedFiles();
const tools=await readJSON('assets/revision/tool-captures.json');
const scenario=tools.scenarios.find(s=>s.id==='INVOICE-sample');
const sourceCapture=tools.captures.find(c=>c.id==='INVOICE-sample-preview');
assert(scenario&&sourceCapture,'Capture INVOICE-sample first');
assert.deepEqual(sourceCapture.inputs,scenario.inputs,'Invoice source capture is stale');
assert(['127.0.0.1','localhost'].includes(new URL(tools.origin).hostname),'Capture the local application only');
async function verifySourceFiles() {
  for(const [file,sha256] of Object.entries(sourceCapture.sourceFileHashes))assert.equal(hash(await fs.readFile(path.join(repo,file))),sha256,`Application source ${file}`);
}
await verifySourceFiles();
const browser=await chromium.launch({headless:true,executablePath,args:['--blink-settings=defaultFontSize=20,defaultFixedFontSize=20']});
try{
  const page=await browser.newPage({viewport:{width:620,height:1500},deviceScaleFactor:2,colorScheme:'light',reducedMotion:'reduce',timezoneId:'UTC',locale:'en-US'});
  const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto(tools.origin+scenario.route,{waitUntil:'networkidle'});
  await page.getByRole('dialog',{name:'Discover more from Hashtag Web3'}).getByRole('button',{name:'Close',exact:true}).click({timeout:18000});
  await page.getByRole('button',{name:'Add Item',exact:true}).click();
  async function fill(fields,prefix='') {
    for(const [key,value] of Object.entries(fields)) {
      const name=prefix?prefix+'.'+key:key;
      if(Array.isArray(value)){for(const [i,item] of value.entries())await fill(item,name+'.'+i);}
      else if(typeof value==='string'||typeof value==='number')await page.locator(`[name="${name}"]`).fill(String(value));
    }
  }
  const {logo,issueDate,dueDate,currency,customCurrency,...fields}=scenario.inputs.fields;
  assert.equal(currency,'USD');assert.equal(fields.walletAddress,'');
  await fill(fields);
  for(const [label,date] of [['Issue Date',issueDate],['Due Date',dueDate]]) {
    const target=new Date(date+'T12:00:00'),month=target.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    await page.getByText(label,{exact:true}).first().locator('..').getByRole('button').click();
    const dialog=page.getByRole('dialog');
    for(let i=0;i<60;i++) {
      if(await dialog.getByText(month,{exact:true}).isVisible())break;
      const id=await dialog.getByRole('grid').getAttribute('aria-labelledby');
      const current=new Date('1 '+await page.locator(`[id="${id}"]`).innerText());
      await dialog.getByRole('button',{name:target<current?'Go to previous month':'Go to next month'}).click();
    }
    const day=dialog.getByRole('grid',{name:month,exact:true}).locator('button:not(.day-outside)').filter({hasText:new RegExp('^'+target.getDate()+'$')});
    await day.focus();await day.press('Enter');
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'hidden'});
  }
  const preview=page.locator('div.lg\\:col-span-2 > div > div.rounded-lg').first();
  for(const text of ['$600.00','$200.00','$800.00','-$50.00','$750.00','November 16, 2026','November 30, 2026',fields.paymentMethod,fields.notes])assert((await preview.innerText()).includes(text),text);
  assert.equal(await page.locator('[name="walletAddress"]').inputValue(),'');
  await page.setViewportSize({width:500,height:1700});
  const notes=preview.getByRole('heading',{name:'Notes:',exact:true}).locator('..');
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('html').evaluate(element=>getComputedStyle(element).fontSize),'20px');
  await notes.scrollIntoViewIfNeeded();
  let box=await notes.boundingBox();assert(box);
  await page.evaluate(y=>window.scrollBy(0,y-130),box.y);
  await page.keyboard.press('Escape');await page.mouse.move(1,1);
  box=await notes.boundingBox();assert(box);
  box={x:Math.floor(box.x),y:Math.floor(box.y),width:Math.ceil(box.x+box.width)-Math.floor(box.x),height:Math.ceil(box.y+box.height)-Math.floor(box.y)};
  const checks=await notes.evaluate((element,crop)=>{
    const sizes=[],clipped=[];
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())) {
      if(!node.textContent.trim())continue;
      sizes.push(parseFloat(getComputedStyle(node.parentElement).fontSize));
      const range=document.createRange();range.selectNodeContents(node);
      for(const rect of range.getClientRects())if(rect.width&&rect.height&&(rect.left<crop.x-1||rect.top<crop.y-1||rect.right>crop.x+crop.width+1||rect.bottom>crop.y+crop.height+1))clipped.push(node.textContent);
    }
    const obstructions=[...document.querySelectorAll('header,nav,[role="dialog"]')].filter(el=>{
      const style=getComputedStyle(el),b=el.getBoundingClientRect();
      return ['fixed','sticky'].includes(style.position)&&style.visibility!=='hidden'&&b.width&&b.height&&b.left<crop.x+crop.width&&b.right>crop.x&&b.top<crop.y+crop.height&&b.bottom>crop.y;
    }).length;
    return {minimum:Math.min(...sizes),maximum:Math.max(...sizes),clipped,obstructions};
  },box);
  assert(checks.minimum>=14);assert.deepEqual(checks.clipped,[]);assert.equal(checks.obstructions,0);
  const raw=await page.screenshot({type:'png',clip:box,animations:'disabled',caret:'hide'});
  const bytes=await sharp(raw).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer();
  const meta=await sharp(bytes).metadata(),file='assets/revision/detail/invoice-notes-readable.png';
  assert(!Object.hasOwn(published.files,file));assert(bytes.length<2_000_000);
  assert.equal(meta.width,box.width*2);assert.equal(meta.height,box.height*2);
  assert.deepEqual(pageErrors,[]);
  await verifySourceFiles();await verifyPublishedFiles();
  await fs.writeFile(path.join(root,file),bytes);
  const visibleText=await notes.innerText();assert(visibleText.includes(fields.notes));
  const capture={id:'INVOICE-sample-notes-readable',scenarioId:scenario.id,file,kind:'tool-capture',sourceUrl:'https://hashtagweb3.com/invoice-generator',localUrl:tools.origin+scenario.route,sourceRevision:sourceCapture.sourceRevision,sourceFileHashes:sourceCapture.sourceFileHashes,provenance:'Application rendered locally with the complete INVOICE-sample inputs. Native viewport narrowed for the Notes excerpt; no DOM text replacement or stylesheet injection.',inputs:scenario.inputs,expectedResult:scenario.expectedResult,visibleText,capturedAt:new Date().toISOString(),sha256:hash(bytes),width:meta.width,height:meta.height,bytes:bytes.length,deviceScaleFactor:2,cssWidth:box.width,cssHeight:box.height,minimumTextCssPx:checks.minimum,maximumTextCssPx:checks.maximum,browserDefaultFontSize:20,quality:{noObstruction:true,textWithinCrop:true,minimumFontPass:true,pageErrors}};
  const existing=await readJSON('assets/revision/invoice-detail-captures.json');
  await writeJSON('assets/revision/invoice-detail-captures.json',[...existing.filter(c=>c.id!==capture.id),capture]);
  await verifyPublishedFiles();await protect();
  console.log({file,width:meta.width,height:meta.height,visibleText});
}finally{await browser.close();}
