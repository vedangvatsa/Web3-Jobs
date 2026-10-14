import fs from 'node:fs';
import assert from 'node:assert/strict';
import type { Job } from '../src/types';
import { EXPANSION_SOURCES, verifyExpansionSource, expansionCandidates, verifyExpansionJob, rememberExpansionDate } from './lib/web3-expansion-feeds';
import { countryGet, pageEvidence } from './lib/country-source-http';
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
  for(const s of EXPANSION_SOURCES){
    const roles:object[]=[];
    try{
      const verification=await verifyExpansionSource(s);
      if(s.status!=='recurring'){reports.push({company:s.company,status:'monitored-careers-only',official:verification.official,board:verification.board,apiJobCount:null,acceptedCount:0,eligible:null});continue;}
      const snapshot=await expansionCandidates(s,verification.page);
      for(const candidate of snapshot.jobs){
        try{
          if(!isConcreteJobOpening(candidate.title,candidate.link)||getJobSourceIssue(candidate)){roles.push({title:candidate.title,link:candidate.link,outcome:'not-concrete-or-rejected'});continue;}
          if(s.provider==='greenhouse'){
            const reason=jobAgeExclusionReason(rememberExpansionDate(candidate,history));
            if(reason){roles.push({title:candidate.title,link:candidate.link,date:candidate.date,outcome:reason});continue;}
          }
          const primary=await countryGet(candidate.link),verified=await verifyExpansionJob(candidate,s,primary);
          let job=rememberExpansionDate(verified.job,history);
          const reason=jobAgeExclusionReason(job);if(reason){roles.push({title:job.title,link:job.link,date:job.date,outcome:reason,primary:pageEvidence(primary)});continue;}
          const identity=getJobIdentity(job);
          if(current.has(identity)){roles.push({identity,title:job.title,outcome:'already-covered',primary:pageEvidence(primary),application:verified.application});continue;}
          job=preserveOriginalJobDate(job,history);current.set(identity,job);added.push(job);store.descriptions[getJobContentKey(job)]=verified.description;
          roles.push({identity,title:job.title,link:job.link,date:job.date,outcome:'added',primary:pageEvidence(primary),application:verified.application});
        }catch(error){roles.push({title:candidate.title,link:candidate.link,outcome:'unverified',error:String(error)});}
      }
      reports.push({company:s.company,status:'checked-additive-feed',official:verification.official,board:verification.board,api:snapshot.api,apiJobCount:snapshot.apiJobCount,quarantinedUnknownOriginalDate:snapshot.quarantined,acceptedCount:roles.filter((r)=>'outcome' in r&&r.outcome==='added').length,roles});
    }catch(error){failures++;console.warn(`Source verification failed for ${s.company}: ${String(error)}`);reports.push({company:s.company,status:'blocked',error:String(error),apiJobCount:null,acceptedCount:0,roles});}
    console.log(`${s.company}: checked`);
  }
  const result=[...current.values()];
  if(!dryRun)writeJobDateHistory(history);
  if(added.length){
    assignJobSlugsAndSyncLegacyArchive(result,archive,loadReservedRootSlugsSync(),loadPublishedRootSlugsSync());
    for(const old of before)assert.deepEqual(current.get(getJobIdentity(old)),old);
    if(!dryRun){writeJobLegacyArchive(archive);fs.writeFileSync('content/jobs-cache.json',JSON.stringify(result,null,2)+'\n');writeJobDescriptionStore({descriptions:store.descriptions,aliases:{...store.aliases,...buildJobDescriptionAliases(result,store.descriptions)}});}
  }
  const report={checkedAt:new Date().toISOString(),dryRun,before:before.length,after:result.length,added:added.map(j=>({id:j.id,title:j.title,company:j.company,link:j.link,date:j.date,slug:j.slug})),removed:[],expiryRemovals:[],failures,reports};
  fs.writeFileSync(`content/sources/hiring-links-636-import${dryRun?'-dry-run':''}.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));if(failures)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
