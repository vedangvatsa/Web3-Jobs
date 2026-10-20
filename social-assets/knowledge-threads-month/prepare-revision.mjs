import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {chromium} from 'playwright';
import {root, repo, executablePath, hash, readJSON, writeJSON, protect} from './revision-lib.mjs';

export const countryPhotos = {Malaysia:'kuala-lumpur',Thailand:'bangkok',Philippines:'manila',Japan:'osaka',Taiwan:'taipei',Canada:'toronto','United Kingdom':'london',Nepal:'kathmandu',Indonesia:'bali',Vietnam:'da-nang'};
export async function prepare() {
  await protect({initialize:true});
  const content=await readJSON('content.json');
  const source=await readJSON('assets/revision/source-data.json');
  const mapping=await readJSON('../../content/nomad-display-images.json');
  const events=await readJSON('../../content/events-runtime.json');
  const tools=await readJSON('assets/revision/tool-captures.json');
  const learning=await readJSON('assets/revision/learning-captures.json');
  const details=await readJSON('assets/revision/detail-captures.json');
  const eventCaptures=await readJSON('assets/revision/event-captures.json');
  const invoiceDetails=await readJSON('assets/revision/invoice-detail-captures.json');
  const photoReferences=await readJSON('assets/revision/photo-references.json');
  for(const dir of ['photos','posters','crops','flags']) await fs.mkdir(path.join(root,'assets/revision',dir),{recursive:true});
  const assets=[];
  async function record(file, extra) {
    const bytes=await fs.readFile(path.join(root,file)),meta=await sharp(bytes).metadata();
    const result={file,sha256:hash(bytes),bytes:bytes.length,width:meta.width,height:meta.height,...extra};
    assets.push(result);return result;
  }
  const citySlugs=new Set(content.threads.filter(t=>t.sequence>3).flatMap(t=>t.posts.flatMap(p=>(p.visual.items||[]).filter(i=>i.type==='city').map(i=>i.slug))));
  for(const slug of Object.values(countryPhotos))citySlugs.add(slug);
  for(const slug of citySlugs) {
    const replacement=photoReferences.find(p=>p.slug===slug);
    if(replacement) {
      const file=`assets/revision/photos/${slug}.webp`;
      await fs.copyFile(path.join(root,replacement.file),path.join(root,file));
      await record(file,{...replacement,file,id:`photo-${slug}`,kind:'city-photograph',copiedFrom:'social-assets/knowledge-threads-month/'+replacement.file,caption:`Actual ${slug} photograph from the official tourism source. Place illustration; measurements are separately authored.`});
      continue;
    }
    const m=mapping[`/images/nomads/${slug}.webp`];assert(m,slug);
    const copiedFrom=`public${m.base}-${m.width}.webp`;
    const file=`assets/revision/photos/${slug}.webp`;
    await fs.copyFile(path.join(repo,copiedFrom),path.join(root,file));
    await record(file,{id:`photo-${slug}`,kind:'city-photograph',copiedFrom,sourceUrl:source.sourceMetadata.imageSources[slug],credit:'Existing Hashtag Web3 nomad-directory image; publisher source recorded in source-data.json',caption:`${slug.replaceAll('-',' ')} photo. Illustration of place, not a screenshot of a price, rule or measured connection.`});
  }
  const eventIds=new Set(content.threads.filter(t=>t.sequence>3).flatMap(t=>t.posts.flatMap(p=>(p.visual.items||[]).filter(i=>i.type==='event').map(i=>i.id))));
  for(const id of eventIds) {
    if(eventCaptures.some(c=>c.eventId===id)) {
      await fs.rm(path.join(root,`assets/revision/posters/${id}.webp`),{force:true});
      continue;
    }
    const event=events.find(e=>e.id===id);assert(event?.coverImage,id);
    const copiedFrom=`public${event.coverImage}`;
    const file=`assets/revision/posters/${id}${path.extname(copiedFrom)}`;
    await fs.copyFile(path.join(repo,copiedFrom),path.join(root,file));
    await record(file,{id:`poster-${id}`,kind:id==='premier-ethcc-2027'?'event-location-photograph':'event-poster',copiedFrom,sourceUrl:event.website||event.url,credit:event.name+' organizer imagery, as stored in events-runtime.json',eventId:id,fit:'contain'});
  }
  for(const c of [...tools.captures,...learning,...details]) {
    const a=await record(c.file,{...c,kind:c.id.startsWith('citizenship')?'citizenship-capture':c.id.match(/^(N03|N04|C07)/)?'question-capture':/^(N09|lesson-)/.test(c.id)?'lesson-capture':'tool-capture'});
    if(c.sha256)assert.equal(a.sha256,c.sha256,c.id);
  }
  for(const c of [...eventCaptures,...invoiceDetails])await record(c.file,c);
  async function crop(id, original, extract, visibleText, font = original.minimumTextCssPx) {
    const file=`assets/revision/crops/${id}.png`;
    await sharp(path.join(root,original.file)).extract(extract).png({compressionLevel:9}).toFile(path.join(root,file));
    return record(file,{id,kind:original.kind,sourceUrl:original.sourceUrl,sourceRevision:original.sourceRevision,provenance:original.provenance||original.detail,derivedFrom:original.file,parentSha256:original.sha256,extract,visibleText,minimumTextCssPx:font,deviceScaleFactor:original.deviceScaleFactor||2,cssWidth:extract.width/(original.deviceScaleFactor||2),detail:'Unretouched contiguous pixel crop. Coordinate rectangle and source hash recorded; image aspect ratio preserved. Omitted context is labeled in the authored summary, outside the screenshot.'});
  }
  for(const c of [...assets].filter(a=>a.id.match(/^(E02|E07).*-result$/))) {
    await crop(c.id+'-value',c,{left:78,top:306,width:624,height:220},c.expectedResult.display+' per year (USD)',20);
    await crop(c.id+'-amount',c,{left:78,top:306,width:624,height:140},c.expectedResult.display,60);
  }
  for(const c of [...assets].filter(a=>a.id.match(/^E02.*-controls$/)))await crop(c.id+'-role',c,{left:60,top:308,width:660,height:390},`Primary Role: ${c.inputs.uiLabels.role}. Years of Experience: 2 years.`,17.5);
  for(const c of [...assets].filter(a=>a.kind==='citizenship-capture')) {
    await crop(c.id+'-price',c,{left:44,top:218,width:672,height:130},c.visibleText.split('\n').slice(-3).join(' '),18);
    await crop(c.id+'-identity',c,{left:44,top:44,width:672,height:100},c.visibleText.split('\n')[0],24);
  }
  for(const c of [...assets].filter(a=>/^RESUME-(technical|content|community)-summary$/.test(a.id)))await crop(c.id+'-text',c,{left:0,top:270,width:c.width,height:c.height-270},c.visibleText.slice(c.visibleText.indexOf('Summary')),17.5);
  const junior=assets.find(a=>a.id==='RESUME-junior-fields-after');
  await crop('RESUME-junior-project-name-role',junior,{left:104,top:226,width:572,height:220},'Sample Escrow Demo. Personal practice project.',20);
  await crop('RESUME-junior-project-link',junior,{left:104,top:975,width:572,height:100},'Link to project/contribution. Empty sample field.',20);
  const invoice=assets.find(a=>a.id==='INVOICE-sample-items-totals');
  await crop('INVOICE-sample-first-row',invoice,{left:0,top:0,width:996,height:262},'Description, Qty, Rate, Total. Documentation draft (hours), 12, $50.00, $600.00.',20);
  await crop('INVOICE-sample-subtotal',invoice,{left:0,top:0,width:996,height:570},'Documentation draft (hours), 12 x $50 = $600. Revision and handoff (hours), 4 x $50 = $200. Subtotal: $800.',20);
  await crop('INVOICE-sample-totals',invoice,{left:190,top:490,width:806,height:266},'Subtotal: $800.00. Discount: -$50.00. Total: $750.00.',20);
  const invoiceFields=assets.find(a=>a.id==='INVOICE-sample-item-fields');
  await crop('INVOICE-sample-tax-discount',invoiceFields,{left:136,top:1090,width:964,height:410},'Subtotal $800.00. Tax (%) 0. Discount (flat) 50. Total $750.00.',17.5);
  const transferCode=assets.find(a=>a.id==='N09-04-transfer-code');
  await crop('N09-04-transfer-excerpt',transferCode,{left:20,top:0,width:660,height:130},'function test_Transfer() public {\n  token.transfer(alice, 100);\n  assertEq(token.balanceOf(alice), 100);',16);
  const lessonCrops={
    'N09-01-library':{left:0,top:0,width:1020,height:110},
  };
  for(const [id,rect] of Object.entries(lessonCrops)) {
    const c=assets.find(a=>a.id===id);await crop(id+'-excerpt',c,rect,c.visibleText,16);
  }
  const flags={Kazakhstan:'KZ',Mauritius:'MU','Costa Rica':'CR',Barbados:'BB',Bhutan:'BT',Maldives:'MV'};
  const browser=await chromium.launch({headless:true,executablePath});
  try {
    const page=await browser.newPage({viewport:{width:400,height:280},deviceScaleFactor:2});
    for(const [country,code] of Object.entries(flags)) {
      const emoji=[...code].map(c=>String.fromCodePoint(127397+c.charCodeAt(0))).join('');
      await page.setContent(`<html><body style="margin:0;background:white;display:grid;place-items:center;width:400px;height:280px;font:220px 'Apple Color Emoji'">${emoji}</body></html>`);
      const file=`assets/revision/flags/${code}.png`;
      await page.screenshot({path:path.join(root,file),type:'png'});
      await record(file,{id:`flag-${country}`,kind:'native-country-flag',sourceUrl:'https://unicode.org/emoji/charts/full-emoji-list.html#flags',credit:'Native Apple Color Emoji rendering of the Unicode country flag sequence',country,code,caption:'Country flag for identification. The adjacent rule text is an authored summary of the cited official sources, not an immigration interface.'});
    }
  } finally {await browser.close();}
  await writeJSON('assets/revision/visual-assets.json',{generatedAt:new Date().toISOString(),contentSha256:hash(await fs.readFile(path.join(root,'content.json'))),assets});
  console.log(`Prepared ${assets.length} source assets, ${citySlugs.size} city photos, ${eventIds.size} event sources (runtime imagery plus the official date-panel replacement).`);
  return {assets,content,source,tools,learning,details};
}
if(process.argv[1]===new URL(import.meta.url).pathname)await prepare();
