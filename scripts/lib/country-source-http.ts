import https from 'node:https';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const until = new Map<string, number>();
export type CountryPage = { url:string; finalUrl:string; status:number; checkedAt:string; bodySha256:string; body:string };
export async function countryGet(url:string, hops=0):Promise<CountryPage> {
  const u=new URL(url);
  if(u.protocol!=='https:'||u.username||u.password||u.port||hops>4) throw new Error('Invalid public HTTPS URL or redirect limit');
  const wait=Math.max(0,(until.get(u.hostname)||0)-Date.now());
  if(wait>30000) throw new Error('Deferred by Retry-After');
  await new Promise(r=>setTimeout(r,wait));
  const result=await new Promise<{status:number;body:string;location?:string}>((resolve,reject)=>{
    const request=https.get(url,{family:4,headers:{'User-Agent':'Mozilla/5.0',Accept:'text/html,application/json,application/xml'}},response=>{
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
  const final=result.location&&result.status>=300&&result.status<400?await countryGet(new URL(result.location,url).href,hops+1):undefined;
  const page:CountryPage={url,finalUrl:final?.finalUrl||url,status:final?.status||result.status,checkedAt:new Date().toISOString(),body:final?.body||result.body,bodySha256:''};
  page.bodySha256=createHash('sha256').update(page.body).digest('hex');
  fs.mkdirSync('.cache/country-local-crypto',{recursive:true});
  const immutable=`.cache/country-local-crypto/body-${page.bodySha256}.json`;
  if(!fs.existsSync(immutable))fs.writeFileSync(immutable,JSON.stringify(page));
  fs.writeFileSync(`.cache/country-local-crypto/${createHash('sha256').update(url).digest('hex')}.json`,JSON.stringify(page));
  return page;
}
export const pageEvidence=({body,...p}:CountryPage)=>p;
