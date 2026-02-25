#!/usr/bin/env node

/**
 * Script to send job alert emails to all subscribers
 * Usage:
 *   npm run send-alerts           - Send latest 10 jobs to all subscribers
 *   npm run send-alerts --dry-run - Preview without sending
 *   npm run send-alerts --limit 5 - Send only 5 latest jobs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';

async function sendJobAlerts() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const limitIndex = args.indexOf('--limit');
  const jobLimit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : 10;

  console.log('🚀 Job Alert Sender');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Job limit: ${jobLimit}`);
  console.log('');

  if (!firebaseConfig.apiKey) {
    console.error('❌ Firebase config is missing');
    process.exit(1);
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing');
    console.log('Get your API key from https://resend.com/api-keys');
    process.exit(1);
  }

  if (!process.env.EMAIL_FROM) {
    console.warn('⚠️ EMAIL_FROM is not set. Using the default resend.dev sender may reduce deliverability.');
  }

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Fetch subscribers
    console.log('📥 Fetching subscribers...');
    const subscribersCol = collection(db, 'subscribers');
    const snapshot = await getDocs(subscribersCol);

    if (snapshot.empty) {
      console.log('❌ No subscribers found');
      process.exit(0);
    }

    const emails = snapshot.docs.map(doc => doc.data().email).filter(Boolean);
    console.log(`✅ Found ${emails.length} subscribers`);

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
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://hashtagweb3.com',
        tags: job.tags?.slice(0, 5) || [],
      }));

    console.log(`✅ Selected ${latestJobs.length} jobs to send`);
    console.log('');

    if (isDryRun) {
      console.log('📋 DRY RUN SUMMARY:');
      console.log(`Would send to: ${emails.length} subscribers`);
      console.log(`Sample emails: ${emails.slice(0, 3).join(', ')}`);
      console.log('');
      console.log('Jobs to include:');
      latestJobs.forEach((job: any, i: number) => {
        console.log(`  ${i + 1}. ${job.title} at ${job.company}`);
      });
      console.log('');
      console.log('✅ Dry run completed. Remove --dry-run to send emails.');
      process.exit(0);
    }

    // Send emails via API
    console.log('📧 Sending emails...');
    const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-token';
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
        dryRun: false,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to send alerts:', result.error);
      process.exit(1);
    }

    console.log('');
    console.log('✅ SUCCESS!');
    console.log(`Sent: ${result.sent}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Total: ${result.total}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendJobAlerts();
