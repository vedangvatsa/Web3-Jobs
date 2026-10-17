import test from 'node:test';
import './test-kamino-source';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { expansionCandidates,verifyExpansionJob,verifyExpansionSource,EXPANSION_SOURCES,rememberExpansionDate } from './lib/web3-expansion-feeds';
import type { JobDateHistory } from '../src/lib/job-source-date';
import type { CountryPage } from './lib/country-source-http';
import { jobAgeExclusionReason } from '../src/lib/job-age-policy.mjs';
const captures=JSON.parse(fs.readFileSync('scripts/fixtures/web3-expansion/captures.json','utf8')) as CountryPage[];
const greenhouse=EXPANSION_SOURCES.find(s=>s.company==='Auros')!;
const ashby=EXPANSION_SOURCES.find(s=>s.company==='Arrakis Finance')!;
const read=async(url:string)=>{const p=captures.find(p=>p.url===url);assert.ok(p,`Unexpected GET ${url}`);assert.equal(createHash('sha256').update(p.body).digest('hex'),p.bodySha256);return p;};
test('captured Greenhouse public dates stay original and expired despite updated timestamps',async()=>{
  const snapshot=await expansionCandidates(greenhouse,captures[2],read);
  assert.equal(snapshot.apiJobCount,3);
  assert.equal(snapshot.jobs[0].date,'2025-11-04T23:42:59-05:00');
  assert.ok(snapshot.jobs.every(j=>jobAgeExclusionReason(j)==='expired'));
});
test('captured Ashby republishes are quarantined rather than fresh original dates',async()=>{
  const snapshot=await expansionCandidates(ashby,captures[2],read);
  assert.equal(snapshot.apiJobCount,3);assert.equal(snapshot.quarantined,3);assert.deepEqual(snapshot.jobs,[]);
});
test('an official page moved off its recorded authority cannot prove source ownership',async()=>{
  await assert.rejects(()=>verifyExpansionSource(greenhouse,async url=>({...captures[2],url,finalUrl:'https://unrelated.example/careers',body:`<a href="${greenhouse.ownership.linkedUrl}">Careers</a>`})),/Official outbound/);
});
test('captured exact Greenhouse job has matching employer/title and usable GET application form',async()=>{
  const snapshot=await expansionCandidates(greenhouse,captures[2],read),job=snapshot.jobs[0];
  const result=await verifyExpansionJob(job,greenhouse,captures[2],read,Date.parse(captures[2].checkedAt));
  assert.equal(result.application.url,job.link);assert.ok(result.description.length>100);
});
test('API snapshot cannot inject foreign boards, IDs or incomplete pagination',async()=>{
  for(const mutate of [(v:Record<string,unknown>)=>{(v.jobs as Record<string,unknown>[])[0].absolute_url='https://job-boards.greenhouse.io/wrong/jobs/4626981005';},(v:Record<string,unknown>)=>{(v.jobs as Record<string,unknown>[])[0].id=999;},(v:Record<string,unknown>)=>{v.meta={total:500};}]){
    const v=JSON.parse(captures[0].body);mutate(v);
    await assert.rejects(()=>expansionCandidates(greenhouse,captures[2],async()=>({...captures[0],body:JSON.stringify(v)})),/malformed|Incomplete/);
  }
});
test('HTTP-200 closed, wrong-title, absent-form and stale primary pages cannot pass',async()=>{
  const {jobs}=await expansionCandidates(greenhouse,captures[2],read),p=captures[2],now=Date.parse(p.checkedAt);
  for(const body of [p.body.replace('<body>','<body>Position is closed'),p.body.replace(/<h1[^>]*>.*?<\/h1>/,'<h1>Different role</h1>'),p.body.replace(/<form[\s\S]*?<\/form>/,'')])await assert.rejects(()=>verifyExpansionJob(jobs[0],greenhouse,{...p,body},read,now));
  await assert.rejects(()=>verifyExpansionJob(jobs[0],greenhouse,p,read,now+86400001),/stale/);
  await assert.rejects(()=>verifyExpansionJob(jobs[0],greenhouse,{...p,checkedAt:'invalid'},read,now),/stale/);
});
test('expired observations survive an empty import and block republish; history cannot rescue unknown or future dates',async()=>{
  const {jobs}=await expansionCandidates(greenhouse,captures[2],read),job=jobs[0],now=Date.parse('2026-10-14T12:00:00Z');
  const history:JobDateHistory={};
  assert.equal(jobAgeExclusionReason(rememberExpansionDate(job,history,now),now),'expired');
  const persisted=JSON.parse(JSON.stringify(history)) as JobDateHistory;
  assert.equal(jobAgeExclusionReason(rememberExpansionDate({...job,date:'2026-10-13'},persisted,now),now),'expired');
  for(const date of ['', '2099-01-01'])assert.equal(rememberExpansionDate({...job,date},persisted,now).dateVerified,false);
  assert.deepEqual(persisted,history);
});

async function primaryDateFixture(datePosted: unknown) {
  const {jobs}=await expansionCandidates(greenhouse,captures[2],read);
  const job={...jobs[0],date:'2026-10-13T10:00:00Z',dateVerified:true};
  const $=load('<body><h1></h1><script type="application/ld+json"></script><form><input type="email"><input name="name"><button>Submit</button></form></body>');
  $('h1').text(job.title);
  $('form').attr('action',job.link);
  $('script').text(JSON.stringify({
    '@type':'JobPosting',title:job.title,url:job.link,hiringOrganization:{name:job.company},datePosted,
    description:'An example role used only for original-date regression coverage. No actual vacancy is being advertised by this fixture.',
  }));
  const body=$.html(),now=Date.parse('2026-10-14T12:00:00Z');
  return {job,now,page:{url:job.link,finalUrl:job.link,status:200,body,bodySha256:createHash('sha256').update(body).digest('hex'),checkedAt:new Date(now).toISOString()} as CountryPage};
}

test('a recent Greenhouse API date cannot conceal an older employer posting date',async()=>{
  const {job,page,now}=await primaryDateFixture('2024-03-09');
  const result=await verifyExpansionJob(job,greenhouse,page,read,now);
  const history:JobDateHistory={};
  const observed=rememberExpansionDate(result.job,history,now);
  assert.equal(observed.date,'2024-03-09');
  assert.equal(jobAgeExclusionReason(observed,now),'expired');
  assert.equal(jobAgeExclusionReason(rememberExpansionDate(job,history,now),now),'expired');
  assert.equal(job.date,'2026-10-13T10:00:00Z');
});

test('invalid or future primary dates cannot be overridden by a valid Greenhouse API date',async()=>{
  for(const datePosted of ['not-a-date','2026-02-30','2099-01-01']) {
    const {job,page,now}=await primaryDateFixture(datePosted);
    await assert.rejects(verifyExpansionJob(job,greenhouse,page,read,now),/original date/);
  }
});

test('a later or absent primary date does not advance the API original date',async()=>{
  for(const datePosted of ['2026-10-13T12:00:00Z',undefined]) {
    const {job,page,now}=await primaryDateFixture(datePosted);
    const result=await verifyExpansionJob(job,greenhouse,page,read,now);
    assert.equal(result.job.date,job.date);
    assert.equal(jobAgeExclusionReason(result.job,now),null);
  }
});
