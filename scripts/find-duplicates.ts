#!/usr/bin/env node

/**
 * Script to find and remove duplicate jobs
 * Run with: npx tsx scripts/find-duplicates.ts
 */

import { getJobs } from '../src/lib/jobs';

async function findDuplicates() {
  console.log('🔍 Checking for duplicate jobs...\n');
  
  const jobs = await getJobs();
  const jobMap = new Map<string, any[]>();
  
  // Group jobs by title + company
  jobs.forEach(job => {
    const key = `${job.title}|${job.company}`.toLowerCase();
    if (!jobMap.has(key)) {
      jobMap.set(key, []);
    }
    jobMap.get(key)!.push(job);
  });
  
  // Find duplicates
  let duplicateCount = 0;
  jobMap.forEach((jobList, key) => {
    if (jobList.length > 1) {
      duplicateCount++;
      console.log(`\n🔴 DUPLICATE FOUND (${jobList.length} instances):`);
      console.log(`Title: ${jobList[0].title}`);
      console.log(`Company: ${jobList[0].company}`);
      jobList.forEach((job, index) => {
        console.log(`\n  Instance ${index + 1}:`);
        console.log(`    ID: ${job.id}`);
        console.log(`    Link: ${job.link}`);
        console.log(`    Source: ${job.source || 'Unknown'}`);
        console.log(`    Date: ${job.date}`);
      });
      console.log('---');
    }
  });
  
  if (duplicateCount === 0) {
    console.log('✅ No duplicates found!');
  } else {
    console.log(`\n❌ Found ${duplicateCount} duplicate job(s)`);
  }
}

findDuplicates().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
