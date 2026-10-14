import { load } from 'cheerio';
import records from '../../content/web3-expansion-sources.json';
import type { Job } from '../../src/types';
import { getAtsBoardFromUrl, atsBoardKey } from '../../src/lib/ats-board-identity';
import { getJobIdentity } from '../../src/lib/job-slugs';
import { normalizeSourcePostingDate } from '../../src/lib/job-source-date';
import { assertAtsSourceAllowed } from '../../src/lib/job-source-policy';
import { candidates, hasForm, postings, verifyPrimary, verifyApplication, type FeedSource } from './country-local-feeds';
import { links, sameUrl } from './country-local-sources';
import { countryGet, pageEvidence, type CountryPage } from './country-source-http';
import { validateAshbyOrganization } from './ashby-employer-verification';
export type ExpansionSource=FeedSource & {website:string;country:null;geography:null;apiUrl:string|null;officialCareersUrl:string;status:string;ownership:{linkedUrl:string};web3:{quote:string}};
export const EXPANSION_SOURCES=records as ExpansionSource[];
const clean=(s:string)=>load(s).text().normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function matchesBoard(url:string,s:FeedSource){const b=getAtsBoardFromUrl(url);return !!b&&atsBoardKey(b.provider,b.board)===atsBoardKey(s.provider,s.board);}
export async function verifyExpansionSource(s:ExpansionSource,read=countryGet){
  assertAtsSourceAllowed(s.provider,s.board);
  const official=await read(s.officialCareersUrl);
  if(official.status!==200||/just a moment|access denied|captcha/i.test(load(official.body)('title').text())||!links(official).includes(s.ownership.linkedUrl))throw new Error('Official outbound missing or unavailable');
  const board=await read(s.boardUrl);
  if(board.status!==200||!sameUrl(board.finalUrl,s.boardUrl)||/just a moment|access denied|page not found|404/i.test(load(board.body)('title').text()))throw new Error('Board unavailable or moved');
  if(s.provider==='ashby'){
    const match=board.body.match(/window\.__appData\s*=\s*(\{[^\n\r]*\});/);
    if(!match)throw new Error('Missing Ashby organization identity');
    validateAshbyOrganization(s.board,s.company,JSON.parse(match[1]).organization||{});
  }
  return {official:pageEvidence(official),board:pageEvidence(board),page:board};
}
export async function expansionCandidates(s:ExpansionSource,board:CountryPage,read=countryGet):Promise<{jobs:Job[];quarantined:number;apiJobCount:number;api?:ReturnType<typeof pageEvidence>}>{
  if(['breezy','teamtailor'].includes(s.provider)){const jobs=await candidates(s,board,read);return{jobs,quarantined:0,apiJobCount:jobs.length};}
  if(!['greenhouse','ashby','lever'].includes(s.provider)||!s.apiUrl)throw new Error('Unsupported recurring adapter');
  if(!matchesBoard(s.apiUrl,s))throw new Error('Wrong API board');
  const p=await read(s.apiUrl);if(p.status!==200||!sameUrl(p.finalUrl,s.apiUrl))throw new Error('API unavailable or moved');
  const value=JSON.parse(p.body),rows=s.provider==='lever'?value:value.jobs;
  if(!Array.isArray(rows)||s.provider==='greenhouse'&&value.meta?.total!==undefined&&value.meta.total!==rows.length)throw new Error('Incomplete API snapshot');
  const jobs:Job[]=rows.map((r:Record<string,unknown>)=>{
    const title=String(r.title||r.text||''),link=String(r.absolute_url||r.jobUrl||r.hostedUrl||'');
    const id=String(r.id||new URL(link).pathname.split('/').pop()||'');
    if(!title||!id||!matchesBoard(link,s)||s.provider==='greenhouse'&&new URL(link).pathname.split('/').pop()!==id)throw new Error('Foreign or malformed API posting');
    return{id,title,link,company:s.company,source:`${s.provider==='greenhouse'?'Greenhouse':s.provider==='ashby'?'Ashby':'Lever'}: ${s.company} [${s.board}]`,date:s.provider==='greenhouse'?normalizeSourcePostingDate(r.first_published):'',dateVerified:s.provider==='greenhouse'&&!!normalizeSourcePostingDate(r.first_published),dateSource:s.provider==='greenhouse'?'Greenhouse.first_published':undefined,location:typeof r.location==='string'?r.location:typeof r.location==='object'&&r.location?String((r.location as {name?:string}).name||''):undefined};
  });
  if(new Set(jobs.map(getJobIdentity)).size!==jobs.length)throw new Error('Duplicate API identities');
  return{jobs:s.provider==='greenhouse'?jobs:[],quarantined:s.provider==='greenhouse'?0:jobs.length,apiJobCount:jobs.length,api:pageEvidence(p)};
}
export async function verifyExpansionJob(job:Job,s:ExpansionSource,p:CountryPage,read=countryGet,now=Date.now()){
  if(s.provider!=='greenhouse')return{...verifyPrimary(job,s,p,now),application:await verifyApplication(job,s,p,read)};
  if(p.status!==200||!matchesBoard(p.finalUrl,s)||getJobIdentity({...job,link:p.finalUrl})!==getJobIdentity(job)||now-Date.parse(p.checkedAt)>86400000||Date.parse(p.checkedAt)>now+300000)throw new Error('Primary identity unavailable or stale');
  const $=load(p.body),visible=$('body').clone();visible.find('script,style,noscript').remove();
  if(/no longer accepting|no longer available|position (?:has been|is) closed|job (?:not found|has been closed)/i.test(visible.text()))throw new Error('Closed or soft-404 job');
  if(!$('h1,h2').toArray().some(e=>clean($(e).text())===clean(job.title)))throw new Error('Wrong visible job title');
  const rows=postings(p.body),r=rows.find(r=>clean(r.title||'')===clean(job.title)&&clean(r.hiringOrganization?.name||'')===clean(s.company));
  if(rows.length&&(rows.length!==1||!r||r.url&&getJobIdentity({...job,link:r.url})!==getJobIdentity(job)))throw new Error('Primary employer/job mismatch');
  if(!rows.length&&!clean($('title').text()).endsWith(`at ${clean(s.company)}`))throw new Error('Primary employer mismatch');
  if(!$('form').toArray().some(e=>{try{const u=new URL($(e).attr('action')||'',p.finalUrl);return u.origin===new URL(p.finalUrl).origin&&u.pathname===new URL(p.finalUrl).pathname;}catch{return false;}}))throw new Error('Wrong application job identity');
  if(r?.validThrough&&(!normalizeSourcePostingDate(r.validThrough)||Date.parse(r.validThrough)<now))throw new Error('Expired application');
  const description=r?.description||$('.job__description').html()||'';if(load(description).text().length<100)throw new Error('Missing job description');
  const apply=links(p).find(l=>{try{const u=new URL(l);return u.origin===new URL(p.finalUrl).origin&&u.pathname===new URL(p.finalUrl).pathname&&u.searchParams.get('gh_jid')===job.id;}catch{return false;}});
  const application=hasForm(p)?p:apply?await read(apply):null;
  if(!application||application.status!==200||getJobIdentity({...job,link:application.finalUrl})!==getJobIdentity(job)||!hasForm(application)||!clean(load(application.body).text()).includes(clean(job.title)))throw new Error('No usable exact-job application form on direct GET');
  return{job,description,application:pageEvidence(application)};
}
