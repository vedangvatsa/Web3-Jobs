import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {root,repo,hash,readJSON,writeJSON} from './revision-lib.mjs';

const references=[
  {slug:'taipei',sourceUrl:'https://www.travel.taipei/en/attraction/details/564',imageUrl:'https://www.travel.taipei/content/images/attractions/222129/1024x768_attractions-image-fjck6hgjre6acqcp2mhcqq.jpg',credit:'Taipei City Department of Information and Tourism, Travel Taipei; Xiangshan / Elephant Mountain photograph',reason:'The mapped Taipei image visibly shows Hotel Gracery and Godzilla in Tokyo, with Japanese street signs.'},
  {slug:'cartagena',sourceUrl:'https://colombia.travel/en/cartagena',imageUrl:'https://colombia.travel/sites/default/files/actividades/Cartagena-82-Foto-ProColombia.jpg',credit:'Photo: ProColombia, Colombia Travel, Cartagena historic center',reason:'The mapped Cartagena image is a close-up of wooden boats without identifiable Cartagena context. Replaced with the official Cartagena historic-center photograph.'},
  {
    slug:'tallinn',
    sourceUrl:'https://visittallinn.ee/eng/visitor/see-do/neighbourhoods/old-town',
    imageUrl:'https://file.visittallinn.ee/39lbk9/tallinn-old-town-kaupo-kalda-2025-4.jpg',
    credit:'Photo: Kaupo Kalda, Visit Tallinn; Toompea and Tallinn Old Town at sunset',
    reason:'The mapped Tallinn image visibly shows Barcelona with the Sagrada Familia. Replaced with the credited official Visit Tallinn photograph of Toompea and Tallinn Old Town.',
    sourceEvidence:{pageTitle:'Old Town - Visit Tallinn',heading:'Tallinn Old Town',publisher:'The Tourism Department of Tallinn Strategic Management Office',photoTitle:'Toompea and Tallinn Old Town at sunset',photoDescription:'View of Toompea and Tallinn Old Town at sunset with church towers and red rooftops in warm evening light',photoCredit:'Kaupo Kalda',mediaId:35778,originalName:'tallinn old town_kaupo kalda_2025 (4).jpg',originalPath:'/39lbk9/tallinn-old-town-kaupo-kalda-2025-4.jpg',publishedWidth:6000,publishedHeight:4000,evidenceLocation:'Credited photo gallery and the matching IMAGE record in the public page __NUXT_DATA__ payload'},
    visualVerification:{method:'Opened the public original photograph and visually inspected the skyline.',landmarks:['Niguliste (St Nicholas) Church tower on the left','Toompea Hill and its limestone retaining walls','St Mary\'s Cathedral bell tower above Toompea','Red-tiled roofs of Tallinn Old Town'],authenticity:'Named photographer and explicit Tallinn location on the municipal tourism page; original JPEG downloaded directly from the page\'s public image host. No generated imagery, compositing, retouching or content replacement.'},
  },
];
const copyCampaign=process.argv.includes('--copy-campaign');
const slugs=process.argv.slice(2).filter(arg=>arg!=='--copy-campaign');
for(const slug of slugs)assert(references.some(reference=>reference.slug===slug),`Unknown photo reference: ${slug}`);
assert(!copyCampaign||slugs.length,'Select explicit city slugs when copying campaign photos');
await fs.mkdir(path.join(root,'assets/revision/photo-references'),{recursive:true});
const mapping=await readJSON('../../content/nomad-display-images.json');
const records=await readJSON('assets/revision/photo-references.json').catch(error=>{if(error.code==='ENOENT')return [];throw error;});
for(const reference of references.filter(reference=>!slugs.length||slugs.includes(reference.slug))) {
  const response=await fetch(reference.imageUrl);assert(response.ok,`${response.status} ${reference.imageUrl}`);
  const downloaded=Buffer.from(await response.arrayBuffer());
  const originalMeta=await sharp(downloaded).metadata();
  const originalFile=`assets/revision/photo-references/${reference.slug}-original.jpg`;
  await fs.writeFile(path.join(root,originalFile),downloaded);
  const file=`assets/revision/photo-references/${reference.slug}.webp`;
  await sharp(downloaded).rotate().resize({width:1200,withoutEnlargement:true}).webp({quality:92}).toFile(path.join(root,file));
  const bytes=await fs.readFile(path.join(root,file)),meta=await sharp(bytes).metadata();
  const m=mapping[`/images/nomads/${reference.slug}.webp`],replacedFile=`public${m.base}-${m.width}.webp`;
  const record={...reference,file,sha256:hash(bytes),width:meta.width,height:meta.height,bytes:bytes.length,originalFile,originalWidth:originalMeta.width,originalHeight:originalMeta.height,originalBytes:downloaded.length,downloadSha256:hash(downloaded),download:{status:response.status,contentType:response.headers.get('content-type'),resolvedUrl:response.url},fetchedAt:new Date().toISOString(),transform:'EXIF orientation, maximum width 1200, no enlargement, WebP quality 92',replacesDirectoryPhoto:{file:replacedFile,sha256:hash(await fs.readFile(path.join(repo,replacedFile))),reason:reference.reason}};
  const index=records.findIndex(existing=>existing.slug===reference.slug);
  if(index<0)records.push(record);else records[index]=record;
  if(copyCampaign) {
    const campaignFile=path.join(root,`assets/revision/photos/${reference.slug}.webp`);
    await fs.copyFile(path.join(root,file),campaignFile);
    assert.equal(hash(await fs.readFile(campaignFile)),record.sha256,`${reference.slug} campaign copy`);
  }
  console.log({slug:reference.slug,originalWidth:originalMeta.width,originalHeight:originalMeta.height,originalBytes:downloaded.length,width:meta.width,height:meta.height,bytes:bytes.length,sha256:record.sha256,downloadSha256:record.downloadSha256,campaignCopied:copyCampaign});
}
await writeJSON('assets/revision/photo-references.json',records);
