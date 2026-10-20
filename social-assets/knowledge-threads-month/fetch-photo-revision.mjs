import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {root,repo,hash,readJSON,writeJSON} from './revision-lib.mjs';

const references=[
  {slug:'taipei',sourceUrl:'https://www.travel.taipei/en/attraction/details/564',imageUrl:'https://www.travel.taipei/content/images/attractions/222129/1024x768_attractions-image-fjck6hgjre6acqcp2mhcqq.jpg',credit:'Taipei City Department of Information and Tourism, Travel Taipei; Xiangshan / Elephant Mountain photograph',reason:'The mapped Taipei image visibly shows Hotel Gracery and Godzilla in Tokyo, with Japanese street signs.'},
  {slug:'cartagena',sourceUrl:'https://colombia.travel/en/cartagena',imageUrl:'https://colombia.travel/sites/default/files/actividades/Cartagena-82-Foto-ProColombia.jpg',credit:'Photo: ProColombia, Colombia Travel, Cartagena historic center',reason:'The mapped Cartagena image is a close-up of wooden boats without identifiable Cartagena context. Replaced with the official Cartagena historic-center photograph.'},
];
await fs.mkdir(path.join(root,'assets/revision/photo-references'),{recursive:true});
const mapping=await readJSON('../../content/nomad-display-images.json');
const records=[];
for(const reference of references) {
  const response=await fetch(reference.imageUrl);assert(response.ok,`${response.status} ${reference.imageUrl}`);
  const downloaded=Buffer.from(await response.arrayBuffer());
  const originalFile=`assets/revision/photo-references/${reference.slug}-original.jpg`;
  await fs.writeFile(path.join(root,originalFile),downloaded);
  const file=`assets/revision/photo-references/${reference.slug}.webp`;
  await sharp(downloaded).rotate().resize({width:1200,withoutEnlargement:true}).webp({quality:92}).toFile(path.join(root,file));
  const bytes=await fs.readFile(path.join(root,file)),meta=await sharp(bytes).metadata();
  const m=mapping[`/images/nomads/${reference.slug}.webp`],replacedFile=`public${m.base}-${m.width}.webp`;
  records.push({...reference,file,sha256:hash(bytes),width:meta.width,height:meta.height,originalFile,downloadSha256:hash(downloaded),fetchedAt:new Date().toISOString(),transform:'EXIF orientation, maximum width 1200, no enlargement, WebP quality 92',replacesDirectoryPhoto:{file:replacedFile,sha256:hash(await fs.readFile(path.join(repo,replacedFile))),reason:reference.reason}});
  console.log({slug:reference.slug,width:meta.width,height:meta.height,bytes:bytes.length});
}
await writeJSON('assets/revision/photo-references.json',records);
