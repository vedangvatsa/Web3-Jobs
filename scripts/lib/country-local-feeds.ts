import { load } from 'cheerio';
import Parser from 'rss-parser';
import type { Job } from '../../src/types';
import { getJobIdentity } from '../../src/lib/job-slugs';
import { normalizeSourcePostingDate } from '../../src/lib/job-source-date';
import { extractBreezyPostingDate } from '../../src/lib/breezy-posting-date';
import { assertAtsSourceAllowed } from '../../src/lib/job-source-policy';
import { countryGet, pageEvidence, type CountryPage } from './country-source-http';
import { links, sameUrl, type CountrySource } from './country-local-sources';
export type FeedSource=Pick<CountrySource,'provider'|'board'|'boardUrl'|'company'>;
type Posting={title?:string;url?:string;datePosted?:string;validThrough?:string;description?:string;identifier?:{value?:string};hiringOrganization?:{name?:string};jobLocation?:{address?:{addressLocality?:string;addressCountry?:string}};experienceRequirements?:{description?:string}};
export function postings(body:string):Posting[]{
  const result:Posting[]=[],$=load(body);
  const visit=(v:unknown)=>{if(Array.isArray(v)){v.forEach(visit);return;}if(!v||typeof v!=='object')return;const n=v as Record<string,unknown>;if([n['@type']].flat().includes('JobPosting'))result.push(n as Posting);if(n['@graph'])visit(n['@graph']);};
  $('script[type="application/ld+json"]').each((_,e)=>{try{visit(JSON.parse($(e).text()));}catch{}});return result;
}
const titleKey=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export function originalDate(raw:unknown,provider:string){
  if(typeof raw!=='string')return '';
  const m=provider==='bizneo'?raw.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/):null;
  return normalizeSourcePostingDate(m?`${m[1]}T${m[2]}${m[3]}:${m[4]}`:raw);
}
export function owned(url:string,s:FeedSource){try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&u.origin===new URL(s.boardUrl).origin;}catch{return false;}}
export async function candidates(s:FeedSource,board:CountryPage,read=countryGet):Promise<Job[]>{
  assertAtsSourceAllowed(s.provider,s.board);
  if(s.provider==='breezy'){
    const p=await read(new URL('json',s.boardUrl).href);
    if(p.status!==200||!sameUrl(p.url,p.finalUrl))throw new Error('Breezy feed unavailable');
    const rows=JSON.parse(p.body) as Array<{id:string;name:string;url:string;location?:{name?:string}}>;
    if(!Array.isArray(rows)||rows.some(r=>!r.id||!r.name||!owned(r.url,s))||new Set(rows.map(r=>r.id)).size!==rows.length)throw new Error('Malformed Breezy snapshot');
    return rows.map(r=>({id:r.id,title:r.name,company:s.company,link:r.url,date:'',dateVerified:false,source:`Breezy: ${s.company} [${s.board.split('.')[0]}]`,location:r.location?.name}));
  }
  const queue=[s.provider==='teamtailor'?new URL('/jobs',s.boardUrl).href:s.boardUrl],seen=new Set<string>(),found=new Set<string>();
  while(queue.length){
    const url=queue.shift()!;if(seen.has(url))continue;if(seen.size>=50)throw new Error('Pagination limit reached');seen.add(url);
    const p=sameUrl(url,board.finalUrl)?board:await read(url);
    if(p.status!==200||!sameUrl(url,p.finalUrl))throw new Error('Incomplete board pagination');
    for(const value of links(p)){const u=new URL(value);if(!owned(value,s))continue;if(/^\/jobs\/[a-z0-9-]+\/?$/i.test(u.pathname)){u.search='';u.hash='';found.add(u.href);}else if(u.pathname==='/jobs'&&u.searchParams.has('page')){u.hash='';if(!seen.has(u.href))queue.push(u.href);}}
  }
  if(s.provider==='teamtailor'){
    const p=await read(new URL('/jobs.rss',s.boardUrl).href);if(p.status!==200||!sameUrl(p.url,p.finalUrl))throw new Error('RSS unavailable');
    const rss=await new Parser().parseString(p.body);
    if(!rss.title||!titleKey(rss.title).includes(titleKey(s.company)))throw new Error('Wrong RSS owner');
    const rssLinks=new Set(rss.items.map(i=>i.link).filter((v):v is string=>Boolean(v)));
    if([...found].some(l=>!rssLinks.has(l))||rss.items.some(i=>!i.link||!i.title||!owned(i.link,s)))throw new Error('Incomplete or foreign RSS');
    return rss.items.map(i=>({id:i.guid||i.link!,title:i.title!,company:s.company,link:i.link!,date:'',dateVerified:false,source:`Teamtailor: ${s.company} [${s.board}]`}));
  }
  if(s.provider!=='bizneo')throw new Error('Unsupported import adapter');
  const results:Job[]=[];
  for(const link of found){
    const p=await read(link),rows=postings(p.body),r=rows[0];
    if(p.status!==200||!sameUrl(link,p.finalUrl)||rows.length!==1||!r.title||!r.identifier?.value||titleKey(r.hiringOrganization?.name||'')!==titleKey(s.company))throw new Error('Malformed or foreign Bizneo posting');
    results.push({id:String(r.identifier.value),title:r.title,company:s.company,link,date:'',dateVerified:false,source:`Bizneo: ${s.company} [${s.board}]`});
  }
  if(!results.length&&!/0 ofertas|no (?:hay|tenemos).*ofertas/i.test(load(board.body).text()))throw new Error('Unrecognized empty Bizneo board');
  return results;
}
export function verifyPrimary(job:Job,s:FeedSource,p:CountryPage,now=Date.now()){
  if(p.status!==200||!owned(p.finalUrl,s)||getJobIdentity({...job,link:p.finalUrl})!==getJobIdentity(job)||now-Date.parse(p.checkedAt)>86400000||Date.parse(p.checkedAt)>now+300000)throw new Error('Wrong or stale primary page');
  const $=load(p.body);
  if(/just a moment|access denied/i.test($('title').text())||/no longer accepting|position (?:has been|is) closed/i.test($.text()))throw new Error('Closed or challenged job');
  if(s.provider==='breezy'){
    const proof=extractBreezyPostingDate(job,p.body,{url:p.finalUrl,checkedAt:p.checkedAt,bodySha256:p.bodySha256});
    if(!proof)throw new Error('Unverified Breezy original date');const{description,...fields}=proof;return{job:{...job,...fields},description:description||''};
  }
  const rows=postings(p.body),r=rows[0];
  if(rows.length!==1||titleKey(r.title||'')!==titleKey(job.title)||titleKey(r.hiringOrganization?.name||'')!==titleKey(s.company)||r.url&&getJobIdentity({...job,link:r.url})!==getJobIdentity(job))throw new Error('Primary job/employer mismatch');
  if(!$('h1,h2').toArray().some(e=>titleKey($(e).text())===titleKey(job.title)))throw new Error('Missing matching visible title');
  const date=originalDate(r.datePosted,s.provider);if(!date)throw new Error('Missing original date');
  if(r.validThrough&&(!normalizeSourcePostingDate(r.validThrough)||Date.parse(r.validThrough)<now))throw new Error('Expired application');
  const description=[r.description,r.experienceRequirements?.description].filter(Boolean).join('\n');
  if(load(description).text().length<100)throw new Error('Insufficient source description');
  return{job:{...job,date,dateVerified:true,dateSource:`${s.provider==='bizneo'?'Bizneo':'Teamtailor'}.JobPosting.datePosted`,location:job.location||[r.jobLocation?.address?.addressLocality,r.jobLocation?.address?.addressCountry].filter(Boolean).join(', ')},description};
}
export function hasForm(p:CountryPage){const $=load(p.body);return $('form').toArray().some(e=>$(e).find('input[type="email"],input[autocomplete="email"],input[name="email"],input#email').length>0&&$(e).find('input:not([type="hidden"]),textarea').length>=2&&$(e).find('button,input[type="submit"]').toArray().some(b=>/submit|apply|enviar candidatura|send application/i.test($(b).text()||$(b).attr('value')||'')));}
export async function verifyApplication(job:Job,s:FeedSource,p:CountryPage,read=countryGet){
  if(hasForm(p))return pageEvidence(p);
  const $=load(p.body),base=new URL(p.finalUrl);
  let route:string|undefined;
  if(s.provider==='bizneo')route=$('#job-inscription[hx-get]').attr('hx-get');
  else route=$('a[href]').toArray().filter(e=>/apply|application/i.test($(e).text())).map(e=>$(e).attr('href')!).find(v=>{const u=new URL(v,p.finalUrl);return u.origin===base.origin&&[`${base.pathname.replace(/\/$/,'')}/apply`,`${base.pathname.replace(/\/$/,'')}/applications/new`].includes(u.pathname.replace(/\/$/,''));});
  if(!route)throw new Error('Missing exact-job application route');const u=new URL(route,p.finalUrl);
  if(u.origin!==base.origin||s.provider==='bizneo'&&(u.pathname!=='/registration/new'||u.searchParams.get('job_id')!==base.pathname.split('/').pop()||[...u.searchParams].length!==1))throw new Error('Wrong application identity');
  const application=await read(u.href);
  if(application.status!==200||!sameUrl(application.finalUrl,u.href)||!hasForm(application)||!titleKey(load(application.body).text()).includes(titleKey(job.title)))throw new Error('Application GET lacks matching form');
  return pageEvidence(application);
}
