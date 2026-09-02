#!/usr/bin/env node

/**
 * Script to fetch all jobs from all feeds and update the cache
 * Run with: npx tsx scripts/fetch-jobs.ts
 */

import { getJobs } from '../src/lib/jobs';

async function fetchAllJobs() {
  console.log('🔄 Fetching jobs from all feeds...');
  try {
    const jobs = await getJobs();
    console.log(`✅ Successfully fetched ${jobs.length} jobs`);
    console.log('\nJobs by source:');
    
    const jobsBySource: Record<string, number> = {};
    jobs.forEach(job => {
      const source = job.source || 'Unknown';
      jobsBySource[source] = (jobsBySource[source] || 0) + 1;
    });
    
    Object.entries(jobsBySource)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        console.log(`  ${source}: ${count} jobs`);
      });
    
    console.log('\n✅ Cache updated successfully');
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    process.exit(1);
  }
}

fetchAllJobs();
