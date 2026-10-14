import https from 'node:https';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import type { LookupAddress } from 'node:dns';
import { isIP } from 'node:net';
const until = new Map<string, number>();
const pending = new Map<string, Promise<void>>();
async function hostSlot<T>(host:string,read:()=>Promise<T>):Promise<T> {
  const previous=pending.get(host)||Promise.resolve();
  let release!:()=>void;
  const slot=new Promise<void>(resolve=>{release=resolve;}),tail=previous.then(()=>slot);
  pending.set(host,tail);await previous;
  try{return await read();}finally{release();if(pending.get(host)===tail)pending.delete(host);}
}
export function assertPublicAddress(address:string) {
  const parts=address.split('.').map(Number),[a,b,c]=parts;
  if(isIP(address)!==4||a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0&&(c===0||c===2))||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19||b===51&&c===100)||a===203&&b===0&&c===113)throw new Error('Non-public destination');
}
export function publicCountryUrl(value:string) {
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password||u.port||!u.hostname.includes('.')||isIP(u.hostname.replace(/^\[|\]$/g,''))||/(?:^|\.)(?:localhost|local|localdomain|internal|test|invalid)$/.test(u.hostname))throw new Error('Invalid public HTTPS URL');
  return u;
}
export type CountryPage = { url:string; finalUrl:string; status:number; checkedAt:string; bodySha256:string; body:string };
export async function countryGet(url:string, hops=0):Promise<CountryPage> {
  const u=publicCountryUrl(url);
  if(hops>4) throw new Error('Invalid public HTTPS URL or redirect limit');
  const result=await hostSlot(u.hostname,async()=>{
  const wait=Math.max(0,(until.get(u.hostname)||0)-Date.now());
  if(wait>30000) throw new Error('Deferred by Retry-After');
  await new Promise(r=>setTimeout(r,wait));
  const addresses=await new Promise<LookupAddress[]>((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('20-second DNS deadline')),20000);
    lookup(u.hostname,{family:4,all:true}).then(resolve,reject).finally(()=>clearTimeout(timer));
  });
  if(!addresses.length)throw new Error('Unresolved public destination');
  addresses.forEach(a=>assertPublicAddress(a.address));
  return await new Promise<{status:number;body:string;location?:string}>((resolve,reject)=>{
    const request=https.get(url,{family:4,lookup:(_host,_options,callback)=>callback(null,addresses[0].address,4),headers:{'User-Agent':'Mozilla/5.0',Accept:'text/html,application/json,application/xml'}},response=>{
      const retry=response.headers['retry-after'];
      const when=retry?(/^\d+$/.test(retry)?Date.now()+Number(retry)*1000:Date.parse(retry)):0;
      until.set(u.hostname,Math.max(Date.now()+350,Number.isFinite(when)?when:0));
      const chunks:Buffer[]=[];let size=0;
      response.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>12*1024*1024)request.destroy(new Error('Response too large'));else chunks.push(chunk);});
      response.on('end',()=>{clearTimeout(timer);resolve({status:response.statusCode||0,body:Buffer.concat(chunks).toString('utf8'),location:response.headers.location});});
      response.on('error',reject);
    });
    const timer=setTimeout(()=>request.destroy(new Error('20-second GET deadline')),20000);
    request.on('error',e=>{clearTimeout(timer);reject(e);});
  });
  });
  const final=result.location&&result.status>=300&&result.status<400?await countryGet(new URL(result.location,url).href,hops+1):undefined;
  const page:CountryPage={url,finalUrl:final?.finalUrl??url,status:final?.status??result.status,checkedAt:new Date().toISOString(),body:final?.body??result.body,bodySha256:''};
  page.bodySha256=createHash('sha256').update(page.body).digest('hex');
  fs.mkdirSync('.cache/country-local-crypto',{recursive:true});
  const immutable=`.cache/country-local-crypto/body-${page.bodySha256}.json`;
  try{fs.writeFileSync(immutable,JSON.stringify(page),{flag:'wx'});}catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;}
  fs.writeFileSync(`.cache/country-local-crypto/${createHash('sha256').update(url).digest('hex')}.json`,JSON.stringify(page));
  return page;
}
export const pageEvidence=({body,...p}:CountryPage)=>p;
