import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { COUNTRY_SOURCES,verifyCountrySource,type CountrySource } from './lib/country-local-sources';
import { originalDate,candidates,verifyPrimary,verifyApplication } from './lib/country-local-feeds';
import type { CountryPage } from './lib/country-source-http';
import { jobAgeExclusionReason } from '../src/lib/job-age-policy.mjs';
import type { Job } from '../src/types';
const source=COUNTRY_SOURCES.find(s=>s.company==='Bit2Me')!;
function page(url:string,body:string,status=200):CountryPage{return{url,finalUrl:url,status,body,checkedAt:new Date().toISOString(),bodySha256:createHash('sha256').update(body).digest('hex')};}
const description='<p>Work with the legal team on blockchain securities, financial regulation and customer onboarding. Review compliance documentation and regulatory submissions.</p>';
const job:Job={id:'170538',company:'Bit2Me',title:'Legal Intern',link:'https://empleo.bit2me.com/jobs/legal-intern',date:'',source:'Bizneo: Bit2Me [empleo.bit2me.com]'};
function primary(fields:Record<string,unknown>={}){return page(job.link,`<h1>Legal Intern</h1><script type="application/ld+json">${JSON.stringify({'@type':'JobPosting',title:job.title,hiringOrganization:{name:job.company},identifier:{value:job.id},datePosted:'2026-10-05 14:04:37 +0200',description,...fields})}</script><div id="job-inscription" hx-get="/registration/new?job_id=legal-intern"></div>`);}
test('ownership needs current exact official outbound, not another tenant or a vendor homepage',async()=>{
  const read=async(url:string)=>page(url,url===source.officialCareersUrl?`<a href="${source.boardUrl}">Jobs</a>`:'<title>Bit2Me Careers</title>');
  assert.equal((await verifyCountrySource(source,read)).board.status,200);
  await assert.rejects(verifyCountrySource(source,async url=>page(url,'<a href="https://empleo.other.invalid/jobs">Jobs</a>')),/hiring link changed/);
  await assert.rejects(verifyCountrySource(source,async url=>({...await read(url),finalUrl:'https://different.invalid/'})),/unavailable or moved/);
  const redirect:CountrySource={...source,officialCareersUrl:'https://company.invalid/careers',ownership:{...source.ownership,kind:'redirect',finalUrl:source.boardUrl}};
  assert.equal((await verifyCountrySource(redirect,async url=>({...page(url,'<title>Careers</title>'),finalUrl:source.boardUrl}))).board.status,200);
});
test('original timezone dates reject rollover, missing timezone, future and stale jobs',()=>{
  assert.equal(originalDate('2026-10-05 14:04:37 +0200','bizneo'),'2026-10-05T14:04:37+02:00');
  for(const date of ['2026-02-30 14:04:37 +0200','2026-10-05 25:04:37 +0200','2026-10-05 14:04:37','5 de Octubre'])assert.equal(originalDate(date,'bizneo'),'');
  assert.equal(jobAgeExclusionReason(verifyPrimary(job,source,primary()).job,Date.parse('2026-10-14T12:00:00Z')),null);
  assert.equal(jobAgeExclusionReason(verifyPrimary(job,source,primary({datePosted:'2025-01-01'})).job),'expired');
  assert.equal(jobAgeExclusionReason(verifyPrimary(job,source,primary({datePosted:'2099-01-01'})).job),'future-date');
  assert.throws(()=>verifyPrimary(job,source,primary({datePosted:'',updatedAt:'2026-10-14'})),/Missing original/);
  assert.throws(()=>verifyPrimary(job,source,primary({hiringOrganization:{name:'Another company'}})),/mismatch/);
});
test('Bizneo pagination fails closed on missing page and malformed primary data',async()=>{
  const board=page(source.boardUrl,'<a href="/jobs/legal-intern">Role</a><a href="/jobs?page=2">2</a>');
  const read=async(url:string)=>url.includes('?page=2')?page(url,'<a href="/jobs/legal-intern">Role</a>'):primary();
  assert.equal((await candidates(source,board,read)).length,1);
  await assert.rejects(candidates(source,board,async url=>url.includes('?page=2')?page(url,'blocked',403):primary()),/pagination/);
  await assert.rejects(candidates(source,board,async url=>url.includes('?page=2')?read(url):page(url,'<h1>Missing schema</h1>')),/Malformed/);
});
test('application proof requires exact job-bound GET and a usable form, including Spanish submit',async()=>{
  const read=async(url:string)=>page(url,'<h2>Legal Intern</h2><form><input name="name"><input type="email"><button>Enviar candidatura</button></form>');
  assert.ok((await verifyApplication(job,source,primary(),read)).bodySha256);
  await assert.rejects(verifyApplication(job,source,page(job.link,'<div id="job-inscription" hx-get="/registration/new?job_id=wrong"></div>'),read),/identity/);
  await assert.rejects(verifyApplication(job,source,primary(),async url=>page(url,'<h2>Legal Intern</h2>')),/form/);
  await assert.rejects(verifyApplication(job,source,primary(),async url=>page(url,'blocked',403)),/form/);
});
