import fs from 'node:fs';
import { COUNTRY_SOURCES, verifyCountrySource } from './lib/country-local-sources';
import { EXPANSION_SOURCES, verifyExpansionSource, expansionCandidates } from './lib/web3-expansion-feeds';
import { candidates, verifyPrimary, verifyApplication } from './lib/country-local-feeds';
import { countryGet, pageEvidence } from './lib/country-source-http';
import { jobAgeExclusionReason } from '../src/lib/job-age-policy.mjs';

async function main() {
  const jobsBefore=JSON.parse(fs.readFileSync('content/jobs-cache.json','utf8')).length;
  const queue=[...COUNTRY_SOURCES.map(source=>({source,regional:true})),...EXPANSION_SOURCES.map(source=>({source,regional:false}))];
  const rows:object[]=[];
  async function worker() {
    for (;;) {
      const item=queue.shift();if(!item)return;
      const {source:s,regional}=item;
      try {
        const proof=regional?await verifyCountrySource(s as typeof COUNTRY_SOURCES[number]):await verifyExpansionSource(s as typeof EXPANSION_SOURCES[number]);
        if(s.status!=='recurring') {
          rows.push({company:s.company,provider:s.provider,status:'live-careers-only-monitor',official:proof.official,board:proof.board,candidateCount:null,eligibleCount:null});
          console.log(JSON.stringify(rows.at(-1)));continue;
        }
        const snapshot=regional?{jobs:await candidates(s,proof.page),apiJobCount:null,quarantined:0}:await expansionCandidates(s as typeof EXPANSION_SOURCES[number],proof.page);
        const sample:object[]=[];
        for(const job of snapshot.jobs.slice(0,2)) {
          try {
            if(s.provider==='greenhouse'){sample.push({title:job.title,date:job.date,age:jobAgeExclusionReason(job)});continue;}
            const p=await countryGet(job.link),verified=verifyPrimary(job,s,p);
            const age=jobAgeExclusionReason(verified.job);
            const application=age?null:await verifyApplication(verified.job,s,p);
            sample.push({title:job.title,date:verified.job.date,age,primary:pageEvidence(p),application});
          } catch(error) {sample.push({title:job.title,outcome:'unverified',error:String(error)});}
        }
        rows.push({company:s.company,provider:s.provider,status:'live-source-verified',official:proof.official,board:proof.board,apiJobCount:snapshot.apiJobCount,candidateCount:snapshot.jobs.length,quarantined:snapshot.quarantined,dateOutcomes:s.provider==='greenhouse'?snapshot.jobs.map(j=>({title:j.title,date:j.date,age:jobAgeExclusionReason(j)})):null,sample});
      } catch(error) {rows.push({company:s.company,status:'blocked-or-unavailable',error:String(error),candidateCount:null});}
      console.log(JSON.stringify(rows.at(-1)));
    }
  }
  await Promise.all(Array.from({length:3},worker));
  const report={checkedAt:new Date().toISOString(),registryCount:COUNTRY_SOURCES.length+EXPANSION_SOURCES.length,recurringCount:[...COUNTRY_SOURCES,...EXPANSION_SOURCES].filter(s=>s.status==='recurring').length,monitorCount:[...COUNTRY_SOURCES,...EXPANSION_SOURCES].filter(s=>s.status!=='recurring').length,primarySampleLimitPerSource:2,jobsBefore,jobsAfter:JSON.parse(fs.readFileSync('content/jobs-cache.json','utf8')).length,jobsAdded:0,jobsRemoved:0,rows};
  fs.writeFileSync('content/sources/independent-country-expansion-audit.json',JSON.stringify(report,null,2)+'\n');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
