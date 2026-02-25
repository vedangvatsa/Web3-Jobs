#!/usr/bin/env node

/**
 * Script to send job alert emails to all subscribers
 * Usage:
 *   npm run send-alerts           - Send latest 10 jobs to all subscribers
 *   npm run send-alerts --dry-run - Preview without sending
 *   npm run send-alerts --limit 5 - Send only 5 latest jobs
 */

async function sendJobAlerts() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const limitIndex = args.indexOf('--limit');
  const jobLimit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : 10;

  console.log('🚀 Job Alert Sender');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Job limit: ${jobLimit}`);
  console.log('');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing from your environment variables.');
    process.exit(1);
  }
  if (!process.env.CRON_SECRET) {
    console.error('❌ CRON_SECRET is missing. This is required to authorize the API call.');
    process.exit(1);
  }

  try {
    // Fetch latest jobs from jobs-cache.json
    console.log('📥 Fetching latest jobs...');
    const jobsCache = await import('../content/jobs-cache.json');
    const allJobs = jobsCache.default || jobsCache;
    
    // Get latest jobs (sorted by date, limit to jobLimit)
    const latestJobs = allJobs
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .reduce((acc: any[], job: any) => {
        if (acc.length >= jobLimit) return acc;
        const company = job.company || 'Unknown Company';
        if (acc.some((item: any) => item.company === company)) return acc;
        acc.push(job);
        return acc;
      }, [])
      .map((job: any) => ({
        title: job.title,
        company: job.company || 'Unknown Company',
        location: job.location || 'Remote',
        salary: job.salary,
        url: job.link,
        tags: job.tags?.slice(0, 5) || [],
      }));

    if (latestJobs.length === 0) {
      console.log('No jobs found to send. Exiting.');
      process.exit(0);
    }
    
    console.log(`✅ Selected ${latestJobs.length} jobs to include`);
    console.log('');

    // Call the API
    console.log(isDryRun ? '📋 Requesting dry run summary from API...' : '📧 Triggering email send via API...');
    const CRON_SECRET = process.env.CRON_SECRET;
    const API_URL = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-job-alerts`
      : 'http://localhost:3000/api/send-job-alerts';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
      body: JSON.stringify({
        jobs: latestJobs,
        dryRun: isDryRun,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to trigger alerts:', result.error || 'Unknown API error');
      process.exit(1);
    }
    
    console.log('');
    console.log('✅ API call successful!');
    
    if (isDryRun) {
        console.log('📋 DRY RUN SUMMARY:');
        console.log(`Would send to: ${result.subscriberCount} subscribers`);
        console.log(`Sample emails: ${(result.wouldSendTo || []).join(', ')}`);
        console.log('Jobs to include:');
        latestJobs.forEach((job: any, i: number) => {
            console.log(`  ${i + 1}. ${job.title} at ${job.company}`);
        });
    } else {
        console.log('✅ SEND COMPLETE!');
        console.log(`Sent: ${result.sent}`);
        console.log(`Failed: ${result.failed}`);
        console.log(`Total subscribers considered: ${result.total}`);
    }

  } catch (error: any) {
    console.error('❌ An unexpected error occurred:', error.message);
    process.exit(1);
  }
}

sendJobAlerts();
