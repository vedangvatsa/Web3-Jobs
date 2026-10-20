import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {chromium} from 'playwright';
import {root, executablePath, readJSON, writeJSON, hash, protect} from './revision-lib.mjs';

await protect();
const tools=await readJSON('assets/revision/tool-captures.json');
const scenario=tools.scenarios.find(s=>s.id==='INVOICE-sample');
const browser=await chromium.launch({headless:true,executablePath,args:['--blink-settings=defaultFontSize=20,defaultFixedFontSize=20']});
try{
  const page=await browser.newPage({viewport:{width:620,height:1500},deviceScaleFactor:2,colorScheme:'light',reducedMotion:'reduce',timezoneId:'UTC'});
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
  assert((await preview.innerText()).includes('$750.00'));
  assert.equal(await page.locator('[name="walletAddress"]').inputValue(),'');
  await page.setViewportSize({width:500,height:1700});
  const notes=preview.getByRole('heading',{name:'Notes:',exact:true}).locator('..');
  await notes.scrollIntoViewIfNeeded();
  const box=await notes.boundingBox();
  const bytes=await page.screenshot({type:'png',clip:box,animations:'disabled'});
  const meta=await sharp(bytes).metadata(),file='assets/revision/detail/invoice-notes-readable.png';
  await fs.writeFile(path.join(root,file),bytes);
  const visibleText=await notes.innerText();assert(visibleText.includes(fields.notes));
  await writeJSON('assets/revision/invoice-detail-captures.json',[{id:'INVOICE-sample-notes-readable',file,kind:'tool-capture',sourceUrl:'https://hashtagweb3.com/invoice-generator',localUrl:tools.origin+scenario.route,sourceRevision:tools.sourceRevision,sourceFileHashes:tools.sourceFileHashes,provenance:'Real application rendered locally. Same full INVOICE-sample scenario, native viewport narrowed for a readable complete Notes excerpt. No DOM or stylesheet edits.',inputs:scenario.inputs,visibleText,capturedAt:new Date().toISOString(),sha256:hash(bytes),width:meta.width,height:meta.height,bytes:bytes.length,deviceScaleFactor:2,cssWidth:box.width,cssHeight:box.height,minimumTextCssPx:17.5,browserDefaultFontSize:20}]);
  console.log({file,width:meta.width,height:meta.height,visibleText});
}finally{await browser.close();}
