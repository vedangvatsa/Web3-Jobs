import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {chromium} from 'playwright';
import {root, executablePath, hash, writeJSON, protect} from './revision-lib.mjs';

await protect();
const sourceUrl='https://consensus-hongkong.coindesk.com/';
const browser=await chromium.launch({headless:true,executablePath});
try {
  const page=await browser.newPage({viewport:{width:560,height:1300},deviceScaleFactor:2,colorScheme:'light',reducedMotion:'reduce'});
  const response=await page.goto(sourceUrl,{waitUntil:'networkidle',timeout:90000});
  assert(response.ok());
  await page.evaluate(()=>document.fonts.ready);
  for(const name of ['Reject All','Reject all','Decline All','Accept All Cookies','Accept all']) {
    const button=page.getByRole('button',{name,exact:true});if(await button.isVisible())await button.click();
  }
  const heading=page.getByRole('heading',{name:'Money. Markets. Machines.',exact:true});
  await heading.waitFor();
  if(process.argv.includes('--inspect')) {
    console.log(await heading.evaluate(el=>el.parentElement.parentElement.outerHTML.slice(0,9000)));
  } else {
    const region=page.locator('.date-venue-text');
    const secondary=page.locator('.sub-text').filter({hasText:'Explore the exhibition from Feb 2-3, 2027'});
    const text=(await region.innerText())+'\n'+(await secondary.innerText());
    assert(text.includes('Feb 1-3, 2027')&&text.includes('Feb 2-3, 2027'),text);
    await region.scrollIntoViewIfNeeded();
    const a=await region.boundingBox(),b=await secondary.boundingBox();
    const box={x:Math.floor(Math.min(a.x,b.x)),y:Math.floor(a.y),width:Math.ceil(Math.max(a.x+a.width,b.x+b.width)-Math.min(a.x,b.x)),height:Math.ceil(b.y+b.height-a.y)};
    const bytes=await page.screenshot({type:'png',clip:box,animations:'disabled'});
    const file='assets/revision/detail/consensus-hong-kong-2027.png';
    await fs.writeFile(path.join(root,file),bytes);
    const meta=await sharp(bytes).metadata();
    await writeJSON('assets/revision/event-captures.json',[{id:'poster-premier-consensus-hk-2027',file,kind:'event-organizer-capture',eventId:'premier-consensus-hk-2027',sourceUrl,sourceRevision:'response-sha256:'+hash(await response.body()),capturedAt:new Date().toISOString(),sha256:hash(bytes),width:meta.width,height:meta.height,bytes:bytes.length,visibleText:text,cssWidth:box.width,cssHeight:box.height,deviceScaleFactor:2,provenance:'Live organizer page; genuine unretouched contiguous hero/date-panel screenshot. No DOM or stylesheet edits.',credit:'CoinDesk Consensus Hong Kong official 2027 page',replacesRuntimeCover:{file:'public/events/premier-consensus-hk-2027-90fdb900.webp',reason:'Runtime ID says 2027 but the image visibly says Feb 10-12, 2026. Original left untouched.'},fit:'contain'}]);
    console.log({file,width:meta.width,height:meta.height,text});
  }
}finally{await browser.close();}
