import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {chromium} from 'playwright';
import {root, repo, executablePath, hash, readJSON, writeJSON, protect} from './revision-lib.mjs';

export const countryPhotos = {Malaysia:'kuala-lumpur',Thailand:'bangkok',Philippines:'manila',Japan:'osaka',Taiwan:'taipei',Canada:'toronto','United Kingdom':'london',Nepal:'kathmandu',Indonesia:'bali',Vietnam:'da-nang'};

async function verifyPublishedFiles() {
  const published=await readJSON('assets/revision/published-prefix-2026-10-22.json');
  for(const [file,sha256] of Object.entries(published.files))assert.equal(hash(await fs.readFile(path.join(root,file))),sha256,`Published file ${file}`);
  return published;
}

async function toolDetailCrops(assets,crop) {
  async function regionCrop(id,original,name) {
    const region=original.regions?.[name];
    assert(region,`${original.id}: recapture native ${name} geometry with capture-tools.ts`);
    return crop(id,original,region.extract,region.visibleText,region.minimumTextCssPx);
  }
  for(const original of [...assets].filter(a=>/^RESUME-(technical|content|community)-summary$/.test(a.id)))await regionCrop(original.id+'-text',original,'text');
  const junior=assets.find(a=>a.id==='RESUME-junior-fields-after');
  if(junior) {
    await regionCrop('RESUME-junior-project-name-role',junior,'project-name-role');
    await regionCrop('RESUME-junior-project-link',junior,'project-link');
  }
  const invoice=assets.find(a=>a.id==='INVOICE-sample-items-totals');
  if(invoice)for(const name of ['first-row','subtotal','totals'])await regionCrop('INVOICE-sample-'+name,invoice,name);
  const invoiceFields=assets.find(a=>a.id==='INVOICE-sample-item-fields');
  if(invoiceFields)await regionCrop('INVOICE-sample-tax-discount',invoiceFields,'tax-discount');
}

async function prepareSelectedTools(selected) {
  await protect();
  const published=await verifyPublishedFiles();
  const prior=await readJSON('assets/revision/visual-assets.json');
  const tools=await readJSON('assets/revision/tool-captures.json');
  const invoiceDetails=await readJSON('assets/revision/invoice-detail-captures.json');
  for(const id of selected)assert(tools.scenarios.some(s=>s.id===id&&['/resume-builder','/invoice-generator'].includes(s.route)),`--only accepts resume/invoice scenario IDs: ${id}`);
  const matches=asset=>selected.some(id=>asset.id.startsWith(id+'-'));
  const assets=[];
  for(const capture of [...tools.captures,...invoiceDetails].filter(matches)) {
    assert(!Object.hasOwn(published.files,capture.file),`Published source ${capture.file}`);
    const bytes=await fs.readFile(path.join(root,capture.file)),meta=await sharp(bytes).metadata();
    assert.equal(hash(bytes),capture.sha256,capture.id);
    assert.equal(meta.width,capture.width,capture.id);assert.equal(meta.height,capture.height,capture.id);
    assets.push({file:capture.file,sha256:capture.sha256,bytes:bytes.length,width:meta.width,height:meta.height,...capture,kind:'tool-capture'});
  }
  if(selected.includes('INVOICE-sample')) {
    const detail=assets.find(a=>a.id==='INVOICE-sample-notes-readable');
    assert(detail,'Refresh invoice notes with capture-invoice-detail.mjs');
    assert.deepEqual(detail.inputs,tools.scenarios.find(s=>s.id==='INVOICE-sample').inputs,'Invoice notes capture is stale');
  }
  await toolDetailCrops(assets,async(id,original,extract,visibleText,minimumTextCssPx)=>{
    const file=`assets/revision/crops/${id}.png`;
    assert(matches({id})&&!Object.hasOwn(published.files,file),`Cannot replace source ${id}`);
    assert(extract.left>=0&&extract.top>=0&&extract.width>0&&extract.height>0&&extract.left+extract.width<=original.width&&extract.top+extract.height<=original.height,`Crop bounds ${id}`);
    const parent=await fs.readFile(path.join(root,original.file));
    assert.equal(hash(parent),original.sha256,`Parent capture ${id}`);
    const bytes=await sharp(parent).extract(extract).png({compressionLevel:9}).toBuffer();
    assert.deepEqual(await sharp(bytes).ensureAlpha().raw().toBuffer(),await sharp(parent).extract(extract).ensureAlpha().raw().toBuffer(),`Exact crop pixels ${id}`);
    await fs.writeFile(path.join(root,file),bytes);
    const scale=original.deviceScaleFactor||2;
    assets.push({file,sha256:hash(bytes),bytes:bytes.length,width:extract.width,height:extract.height,id,scenarioId:original.scenarioId,kind:original.kind,sourceUrl:original.sourceUrl,sourceRevision:original.sourceRevision,sourceFileHashes:original.sourceFileHashes,provenance:original.provenance,derivedFrom:original.file,parentSha256:original.sha256,extract,visibleText,minimumTextCssPx,deviceScaleFactor:scale,cssWidth:extract.width/scale,cssHeight:extract.height/scale,detail:'Contiguous crop of the application capture. Bounds measured from native elements; decoded pixels verified against the parent.'});
  });
  const updates=new Map(assets.map(a=>[a.id,a]));
  assert.equal(updates.size,assets.length,'Unique updated source IDs');
  for(const previous of prior.assets.filter(matches))assert(updates.has(previous.id),`Missing replacement source ${previous.id}`);
  const merged=prior.assets.map(previous=>updates.get(previous.id)||previous);
  merged.push(...assets.filter(asset=>!prior.assets.some(previous=>previous.id===asset.id)));
  assert.deepEqual(merged.filter(a=>!matches(a)),prior.assets.filter(a=>!matches(a)),'Unselected source metadata changed');
  await verifyPublishedFiles();
  await writeJSON('assets/revision/visual-assets.json',{...prior,generatedAt:new Date().toISOString(),assets:merged});
  console.log(JSON.stringify({updatedScenarios:selected,updatedSources:assets.length,preservedSources:prior.assets.filter(a=>!matches(a)).length,publishedFiles:Object.keys(published.files).length,exactPixelCrops:assets.filter(a=>a.derivedFrom).length},null,2));
  return {assets:merged,tools};
}

export async function prepare() {
  const selected=process.argv.find(arg=>arg.startsWith('--only='))?.slice(7).split(',');
  if(selected)return prepareSelectedTools(selected);
  await protect();
  const published=await verifyPublishedFiles();
  const prior=await readJSON('assets/revision/visual-assets.json');
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
    if(Object.hasOwn(published.files,file)) {
      const frozen=prior.assets.find(a=>a.file===file);
      assert(frozen&&frozen.sha256===published.files[file],`Published crop metadata ${file}`);
      assets.push(frozen);return frozen;
    }
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
  await toolDetailCrops(assets,crop);
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
  await verifyPublishedFiles();
  await writeJSON('assets/revision/visual-assets.json',{generatedAt:new Date().toISOString(),contentSha256:hash(await fs.readFile(path.join(root,'content.json'))),assets});
  console.log(`Prepared ${assets.length} source assets, ${citySlugs.size} city photos, ${eventIds.size} event sources (runtime imagery plus the official date-panel replacement).`);
  return {assets,content,source,tools,learning,details};
}
if(process.argv[1]===new URL(import.meta.url).pathname)await prepare();
