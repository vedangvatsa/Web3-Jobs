import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { COUNTRY_SOURCES, verifyCountrySource } from './lib/country-local-sources';
import { candidates, verifyPrimary } from './lib/country-local-feeds';
import { configuredAtsBoards } from './lib/ats-source-inventory';
import { jobAgeExclusionReason } from '../src/lib/job-age-policy.mjs';
import type { CountryPage } from './lib/country-source-http';

const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
const captures = JSON.parse(fs.readFileSync('scripts/fixtures/country-local/captures.json', 'utf8')) as CountryPage[];
function source(company:string){const result=COUNTRY_SOURCES.find(s=>s.company===company);assert.ok(result);return result;}
async function captured(url:string):Promise<CountryPage>{
  const p = captures.find(page => page.url === url);
  assert.ok(p, `Missing committed capture ${url}`);
  assert.equal(hash(p.body),p.bodySha256);return p;
}
function fixture(url:string,body:string,status=200):CountryPage{return{url,finalUrl:url,status,body,checkedAt:new Date().toISOString(),bodySha256:hash(body)};}

test('captured Change source preserves five original dates and excludes all five stale vacancies',async()=>{
  const s=source('Change'),verification=await verifyCountrySource(s,captured);
  const jobs=await candidates(s,verification.page,captured);
  assert.equal(jobs.length,5);
  for(const job of jobs){
    assert.equal(job.date,'');assert.equal(job.dateVerified,false);
    const primary=await captured(job.link),verified=verifyPrimary(job,s,primary,Date.parse(primary.checkedAt));
    assert.equal(verified.job.company,'Change');assert.equal(verified.job.dateSource,'Teamtailor.JobPosting.datePosted');
    assert.equal(jobAgeExclusionReason(verified.job,Date.parse(primary.checkedAt)),'expired');
  }
});

test('captured Safello empty HTML and RSS agree without inventing a vacancy',async()=>{
  const s=source('Safello'),verification=await verifyCountrySource(s,captured);
  assert.deepEqual(await candidates(s,verification.page,captured),[]);
});

test('Teamtailor pagination, RSS coverage, ownership and malformed responses fail closed',async()=>{
  const s=source('Change'),jobUrl=new URL('/jobs/123-engineer',s.boardUrl).href;
  const board=fixture(s.boardUrl,'<title>Change</title>');
  const rss=(title='Change',items=`<item><title>Engineer</title><link>${jobUrl}</link><guid>${jobUrl}</guid></item>`)=>`<rss version="2.0"><channel><title>${title}</title><link>${s.boardUrl}</link><description>Jobs</description>${items}</channel></rss>`;
  const read=async(url:string)=>fixture(url,url.includes('.rss')?rss():`<a href="${jobUrl}">Engineer</a><a href="/jobs?page=2">Next</a>`);
  assert.equal((await candidates(s,board,read)).length,1);
  await assert.rejects(candidates(s,board,async url=>url.includes('page=2')?fixture(url,'Unavailable',403):read(url)),/Incomplete board pagination/);
  await assert.rejects(candidates(s,board,async url=>url.includes('.rss')?fixture(url,rss('Another employer')):read(url)),/Wrong RSS owner/);
  await assert.rejects(candidates(s,board,async url=>url.includes('.rss')?fixture(url,rss('Change','')):read(url)),/Incomplete or foreign RSS/);
  await assert.rejects(candidates(s,board,async url=>url.includes('.rss')?fixture(url,'<html>Challenge</html>'):read(url)));
  const foreign=`<item><title>Engineer</title><link>https://other.invalid/jobs/123-engineer</link></item>`;
  await assert.rejects(candidates(s,board,async url=>url.includes('.rss')?fixture(url,rss('Change',foreign)):read(url)),/Incomplete or foreign RSS/);
});

test('RSS publication freshness cannot replace a stale primary JobPosting date',async()=>{
  const s=source('Change'),verified=await verifyCountrySource(s,captured);
  const read=async(url:string)=>{
    const p=await captured(url);if(!url.endsWith('.rss'))return p;
    const body=p.body.replace(/<pubDate>[^<]*<\/pubDate>/g,'<pubDate>Wed, 14 Oct 2026 12:00:00 GMT</pubDate>');
    assert.notEqual(body,p.body,'Fresh RSS timestamp must actually replace the captured timestamp');
    return fixture(url,body);
  };
  const jobs=await candidates(s,verified.page,read);
  for(const job of jobs){const p=await captured(job.link);assert.equal(job.date,'');assert.equal(jobAgeExclusionReason(verifyPrimary(job,s,p,Date.parse(p.checkedAt)).job,Date.parse(p.checkedAt)),'expired');}
});

test('recurring workflow consumes five supported sources, keeps 41 monitors and leaves global leads disabled',()=>{
  const recurring=COUNTRY_SOURCES.filter(s=>s.status==='recurring');
  assert.deepEqual(recurring.map(s=>s.company).sort(),['Bit2Me','Change','Coinmotion','Safello','XREX']);
  assert.equal(COUNTRY_SOURCES.filter(s=>s.status==='careers-only').length,41);
  const configured=configuredAtsBoards().filter(s=>s.file==='content/country-local-crypto-sources.json');
  assert.deepEqual(configured.map(s=>s.company).sort(),recurring.map(s=>s.company).sort());
  const workflow=fs.readFileSync('.github/workflows/refresh-jobs-ingest.yml','utf8');
  assert.match(workflow,/run: npx tsx --test scripts\/test-country-local-crypto\.ts scripts\/test-hiring-links-548-recurring\.ts scripts\/test-hiring-links-csv\.ts && npx tsx scripts\/ingest-country-local-crypto\.ts\s*\n/);
  assert.match(workflow,/if: always\(\)[\s\S]*path: content\/sources\/country-local-import\.json/);
  assert.ok(!COUNTRY_SOURCES.some(s=>['AZA Finance','Kanga'].includes(s.company)));
  const discovery=JSON.parse(fs.readFileSync('content/sources/hiring-links-548-global-discovery.json','utf8'));
  assert.equal(discovery.status,'discovery-queue-not-enabled-sources');assert.equal(discovery.rows.length,183);
});
