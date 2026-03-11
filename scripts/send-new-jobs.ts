#!/usr/bin/env node

/**
 * Script to filter and send new job alerts from the past N days
 * Usage: npm run send-new-jobs -- --days 7 --limit 15
 *
 * This script:
 * 1. Fetches all jobs from jobs-cache.json
 * 2. Filters jobs published in the last N days
 * 3. Sends emails to subscribers with new jobs
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY env var (base64-encoded service account JSON)
 * or FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON string).
 */

import * as admin from 'firebase-admin';
import { getJobs } from '@/lib/jobs';
import { sendBatchJobAlerts, type JobListing } from '@/lib/email';

function initAdminFirestore(): admin.firestore.Firestore {
  if (admin.apps.length) {
    return admin.firestore();
  }

  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!base64Key && !rawJson) {
    throw new Error(
      'No Firebase Admin credentials found.\n' +
      'Set FIREBASE_SERVICE_ACCOUNT_KEY (base64-encoded) or FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON).'
    );
  }

  const serviceAccount = JSON.parse(
    base64Key ? Buffer.from(base64Key, 'base64').toString('utf8') : rawJson!
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin.firestore();
}

async function sendNewJobAlerts() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  const daysIndex = args.indexOf('--days');
  const daysBack = daysIndex >= 0 ? parseInt(args[daysIndex + 1]) : 7;

  const limitIndex = args.indexOf('--limit');
  const jobLimit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : 15;

  console.log('📅 New Job Alerts (Weekly)');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Days back: ${daysBack}`);
  console.log(`Job limit: ${jobLimit}`);
  console.log('');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing');
    console.log('Get your API key from https://resend.com/api-keys');
    process.exit(1);
  }

  let db: admin.firestore.Firestore;
  try {
    db = initAdminFirestore();
  } catch (err: any) {
    console.error('❌ Firebase Admin init failed:', err.message);
    process.exit(1);
  }

  try {
    // Fetch subscribers via Admin SDK (bypasses Firestore security rules)
    console.log('📥 Fetching subscribers...');
    const snapshot = await db.collection('subscribers').get();

    if (snapshot.empty) {
      console.log('⚠️  No subscribers found');
      process.exit(0);
    }

    const emails: string[] = snapshot.docs
      .map(doc => doc.data().email as string)
      .filter(Boolean);
    console.log(`✅ Found ${emails.length} subscribers`);

    // Fetch jobs and filter by date
    console.log(`📥 Fetching jobs from last ${daysBack} days...`);
    const allJobs = await getJobs();

    const now = new Date();
    const thresholdDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const newJobs: JobListing[] = allJobs
      .filter((job: any) => {
        const jobDate = new Date(job.date);
        return jobDate >= thresholdDate;
      })
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, jobLimit)
      .map((job: any) => ({
        title: job.title,
        company: job.company?.name || job.company || 'Unknown Company',
        location: job.location || 'Remote',
        salary: job.salary,
        // Use job.link directly since job.id contains full external URLs, not internal IDs
        url: job.link || job.url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hashtagweb3.com'}/jobs/${job.id}`,
        tags: job.tags?.slice(0, 5) || [],
      }));

    console.log(`✅ Found ${newJobs.length} new jobs`);
    console.log('');

    if (newJobs.length === 0) {
      console.log('⚠️  No new jobs in the last', daysBack, 'days');
      process.exit(0);
    }

    if (isDryRun) {
      console.log('📋 DRY RUN SUMMARY:');
      console.log(`Would send to: ${emails.length} subscribers`);
      console.log(`Sample emails: ${emails.slice(0, 3).join(', ')}`);
      console.log('');
      console.log('New jobs to include:');
      newJobs.forEach((job: any, i: number) => {
        console.log(`  ${i + 1}. ${job.title} at ${job.company}`);
      });
      console.log('');
      console.log('✅ Dry run completed. Remove --dry-run to send emails.');
      process.exit(0);
    }

    // Send emails
    console.log('📧 Sending emails...');
    const result = await sendBatchJobAlerts(emails, newJobs);

    console.log('');
    console.log('✅ SUCCESS!');
    console.log(`Sent: ${result.sent}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Total subscribers: ${emails.length}`);
    console.log(`Jobs included: ${newJobs.length}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendNewJobAlerts();
