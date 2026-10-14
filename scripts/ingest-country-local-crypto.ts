import fs from 'node:fs';
import assert from 'node:assert/strict';
import type { Job } from '../src/types';
import { COUNTRY_SOURCES,verifyCountrySource } from './lib/country-local-sources';
import { candidates,verifyPrimary,verifyApplication } from './lib/country-local-feeds';
import { countryGet,pageEvidence } from './lib/country-source-http';
import { getJobIdentity,getJobContentKey,assignJobSlugsAndSyncLegacyArchive } from '../src/lib/job-slugs';
import { preserveOriginalJobDate } from '../src/lib/job-source-date';
import { jobAgeExclusionReason } from '../src/lib/job-age-policy.mjs';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { getJobSourceIssue } from '../src/lib/job-source-policy';
import { readJobDateHistory,writeJobDateHistory } from './lib/job-ingestion-policy';
import { readJobDescriptionStore,writeJobDescriptionStore,buildJobDescriptionAliases } from './lib/job-description-store';
import { loadJobLegacyArchive,writeJobLegacyArchive } from './lib/job-slug-assignment';
import { loadReservedRootSlugsSync,loadPublishedRootSlugsSync } from '../src/lib/reserved-root-slugs';
async function main(){
  const dryRun=process.argv.includes('--dry-run'),before=JSON.parse(fs.readFileSync('content/jobs-cache.json','utf8')) as Job[];
  const history=readJobDateHistory(),store=readJobDescriptionStore(),archive=loadJobLegacyArchive();
  const current=new Map(before.map(j=>[getJobIdentity(j),j])),added:Job[]=[],reports:object[]=[];let failures=0;
  const expansion=process.argv.includes('--hiring-links-548');
  const priorCompanies=expansion?new Set<string>(JSON.parse(fs.readFileSync('.cache/hiring-links-548/baseline.json','utf8')).countrySources.map((s: {company:string})=>s.company)):new Set<string>();
  for(const s of COUNTRY_SOURCES.filter(s=>!expansion||!priorCompanies.has(s.company))){
    const roles:object[]=[];
    try{
      const verification=await verifyCountrySource(s);
      if(s.status!=='recurring'){reports.push({company:s.company,status:'monitored-careers-only',official:verification.official,board:verification.board,fetched:null,eligible:null});continue;}
      const jobs=await candidates(s,verification.page);
      if(new Set(jobs.map(getJobIdentity)).size!==jobs.length)throw new Error('Duplicate feed identities');
      for(const candidate of jobs){
        try{
          if(!isConcreteJobOpening(candidate.title,candidate.link)||getJobSourceIssue(candidate)){roles.push({title:candidate.title,outcome:'not-concrete-or-rejected'});continue;}
          const primary=await countryGet(candidate.link),verified=verifyPrimary(candidate,s,primary);
          let job=preserveOriginalJobDate(verified.job,{...history});
          const reason=jobAgeExclusionReason(job);if(reason){roles.push({title:job.title,link:job.link,date:job.date,outcome:reason,primary:pageEvidence(primary)});continue;}
           const application=await verifyApplication(job,s,primary);
           const insertionReason = jobAgeExclusionReason(job);
           if (insertionReason) { roles.push({title:job.title,link:job.link,date:job.date,outcome:insertionReason,primary:pageEvidence(primary),application}); continue; }
          const identity=getJobIdentity(job);
          if(current.has(identity)){roles.push({identity,title:job.title,outcome:'already-covered',primary:pageEvidence(primary),application});continue;}
          job=preserveOriginalJobDate(job,history);current.set(identity,job);added.push(job);store.descriptions[getJobContentKey(job)]=verified.description;
          roles.push({identity,title:job.title,link:job.link,date:job.date,outcome:'added',primary:pageEvidence(primary),application});
        }catch(error){roles.push({title:candidate.title,link:candidate.link,outcome:'unverified',error:String(error)});}
      }
      reports.push({company:s.company,status:'checked-additive-feed',official:verification.official,board:verification.board,fetched:jobs.length,roles});
    }catch(error){failures++;console.warn(`Source verification failed for ${s.company}: ${String(error)}`);reports.push({company:s.company,status:'blocked',error:String(error),roles});}
  }
  const result=[...current.values()];
  assignJobSlugsAndSyncLegacyArchive(result,archive,loadReservedRootSlugsSync(),loadPublishedRootSlugsSync());
  for(const old of before){const now=current.get(getJobIdentity(old))!;for(const k of ['id','link','slug','date'] as const)assert.equal(now[k],old[k]);}
  if(!dryRun){writeJobDateHistory(history);writeJobLegacyArchive(archive);fs.writeFileSync('content/jobs-cache.json',JSON.stringify(result,null,2)+'\n');writeJobDescriptionStore({descriptions:store.descriptions,aliases:{...store.aliases,...buildJobDescriptionAliases(result,store.descriptions)}});}
  const report={checkedAt:new Date().toISOString(),dryRun,before:before.length,after:result.length,added:added.map(j=>({id:j.id,title:j.title,company:j.company,link:j.link,date:j.date,slug:j.slug})),removed:[],failures,reports};
  fs.mkdirSync('content/sources',{recursive:true});fs.writeFileSync(`content/sources/${expansion?'hiring-links-548-import':'country-local-import'}${dryRun?'-dry-run':''}.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  if(failures)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
