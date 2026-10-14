import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { expansionCandidates,verifyExpansionJob,EXPANSION_SOURCES } from './lib/web3-expansion-feeds';
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
});
