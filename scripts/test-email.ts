#!/usr/bin/env node

/**
 * Test script to send a sample job alert email
 * Usage: RESEND_API_KEY=xxx npx tsx scripts/test-email.ts [email]
 */

import { sendJobAlertEmail, type JobListing } from '../src/lib/email';

const recipientEmail = process.argv[2] || 'vatsvedang@gmail.com';

async function getSampleJobs(): Promise<JobListing[]> {
  const jobsCache = await import('../content/jobs-cache.json');
  const allJobs = jobsCache.default || jobsCache;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hashtagweb3.com';

  return allJobs
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce((acc: any[], job: any) => {
      if (acc.length >= 10) return acc;
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
      url: siteUrl,
      tags: job.tags?.slice(0, 5) || [],
    }));
}

async function sendTestEmail() {
  const sampleJobs = await getSampleJobs();

  console.log('📧 Test Email Sender');
  console.log(`To: ${recipientEmail}`);
  console.log(`Jobs: ${sampleJobs.length}`);
  console.log('');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set');
    console.log('');
    console.log('Add to .env.local:');
    console.log('RESEND_API_KEY=re_xxxxxxxxxxxxx');
    console.log('');
    console.log('Get your API key from https://resend.com/api-keys');
    process.exit(1);
  }

  console.log('📤 Sending email...');
  const result = await sendJobAlertEmail(recipientEmail, sampleJobs);

  if (result.success) {
    console.log('');
    console.log('✅ SUCCESS! Email sent to', recipientEmail);
    console.log('');
    console.log('Check your inbox (and spam folder)');
  } else {
    console.log('');
    console.log('❌ FAILED:', result.error);
    console.log('');
    console.log('Common issues:');
    console.log('- Invalid API key');
    console.log('- Email domain not verified in Resend');
    console.log('- Rate limit exceeded');
  }
}

sendTestEmail().catch(console.error);
