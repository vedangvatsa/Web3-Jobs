#!/usr/bin/env node

/**
 * Script to filter and send new job alerts from the past N days
 * Usage: npm run send-new-jobs -- --days 7 --limit 15
 *
 * This script:
 * 1. Fetches all jobs from RSS feeds
 * 2. Filters jobs published in the last N days
 * 3. Fetches subscribers from both 'subscribers' and 'manual_additions' collections
 * 4. Sends emails to all unique subscribers via AWS SES (50k/day capacity)
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY env var (base64-encoded service account JSON)
 * or FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON string).
 * Requires AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY, AWS_SES_REGION.
 */

import * as admin from 'firebase-admin';
import { getJobs } from '@/lib/jobs';
import { sendBatchJobAlerts, type JobListing } from '@/lib/email';

/**
 * Fetch all unique emails from both 'subscribers' and 'manual_additions' collections.
 */
async function fetchAllSubscribers(db: admin.firestore.Firestore): Promise<string[]> {
  console.log('📥 Fetching subscribers from all collections...');

  const [subscribersSnap, manualSnap] = await Promise.all([
    db.collection('subscribers').get(),
    db.collection('manual_additions').get(),
  ]);

  const allEmails = [
    ...subscribersSnap.docs.map(doc => (doc.data().email as string)?.toLowerCase().trim()),
    ...manualSnap.docs.map(doc => (doc.data().email as string)?.toLowerCase().trim()),
  ].filter(Boolean);

  const uniqueEmails = [...new Set(allEmails)];

  console.log(`  subscribers: ${subscribersSnap.size} docs`);
  console.log(`  manual_additions: ${manualSnap.size} docs`);
  console.log(`  ✅ Total unique emails: ${uniqueEmails.length}`);

  return uniqueEmails;
}

/**
 * Get a week identifier like "2026-W13" for batch tracking.
 * Resets every Monday so the batch cycle starts fresh each week.
 */
function getWeekId(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

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

  console.log('📅 Job Alerts (AWS SES)');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Days back: ${daysBack}`);
  console.log(`Job limit: ${jobLimit}`);
  console.log('');

  if (!process.env.AWS_SES_ACCESS_KEY_ID || !process.env.AWS_SES_SECRET_ACCESS_KEY) {
    console.error('❌ AWS SES credentials are missing');
    console.log('Set AWS_SES_ACCESS_KEY_ID and AWS_SES_SECRET_ACCESS_KEY');
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
    // Fetch subscribers from both collections
    const emails = await fetchAllSubscribers(db);

    if (emails.length === 0) {
      console.log('⚠️  No subscribers found');
      process.exit(0);
    }

    const emailsToSend = emails;

    // Fetch jobs and filter by date
    console.log(`📥 Fetching jobs from last ${daysBack} days...`);
    const allJobs = await getJobs();

    const now = new Date();
    const thresholdDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const MAX_PER_COMPANY = 2;

    // Filter by date and sort newest-first
    const recentJobs = allJobs
      .filter((job: any) => {
        const jobDate = new Date(job.date);
        return jobDate >= thresholdDate;
      })
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Enforce per-company cap, then take top jobLimit
    const companyCounts = new Map<string, number>();
    const newJobs: JobListing[] = [];

    for (const job of recentJobs) {
      if (newJobs.length >= jobLimit) break;

      const company = job.company?.name || job.company || 'Unknown Company';
      const key = company.toLowerCase();
      const count = companyCounts.get(key) || 0;

      if (count >= MAX_PER_COMPANY) continue;

      companyCounts.set(key, count + 1);
      newJobs.push({
        title: job.title,
        company,
        location: job.location || 'Remote',
        salary: job.salary,
        url: job.link || job.url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hashtagweb3.com'}/jobs/${job.id}`,
        tags: job.tags?.slice(0, 5) || [],
      });
    }

    console.log(`✅ Found ${newJobs.length} new jobs`);
    console.log('');

    if (newJobs.length === 0) {
      console.log('⚠️  No new jobs in the last', daysBack, 'days');
      process.exit(0);
    }

    if (isDryRun) {
      console.log('📋 DRY RUN SUMMARY:');
      console.log(`Would send to: ${emailsToSend.length} subscribers`);
      console.log(`Sample emails: ${emailsToSend.slice(0, 5).join(', ')}`);
      console.log('');
      console.log('New jobs to include:');
      newJobs.forEach((job: any, i: number) => {
        console.log(`  ${i + 1}. ${job.title} at ${job.company}`);
      });
      console.log('');
      console.log('✅ Dry run completed. Remove --dry-run to send emails.');
      process.exit(0);
    }

    // Send emails to this batch
    console.log(`📧 Sending emails to ${emailsToSend.length} subscribers...`);
    const result = await sendBatchJobAlerts(emailsToSend, newJobs);

    console.log('');
    console.log('✅ SUCCESS!');
    console.log(`Sent: ${result.sent}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Batch size: ${emailsToSend.length}`);
    console.log(`Total subscribers: ${emails.length}`);
    console.log(`Jobs included: ${newJobs.length}`);
    
    // Log delivery metrics to console for monitoring
    console.log('');
    console.log('📊 DELIVERY DETAILS:');
    if (result.failed > 0) {
      console.log('Failed sends:');
      result.details
        .filter(d => !d.success)
        .forEach(d => {
          console.log(`  ❌ ${d.email}: ${d.error}`);
        });
    }
    
    // Save detailed metrics to file for tracking
    const metricsFile = `delivery-metrics-${new Date().toISOString().split('T')[0]}.json`;
    const metrics = {
      timestamp: new Date().toISOString(),
      provider: 'aws-ses',
      summary: {
        sent: result.sent,
        failed: result.failed,
        total: emailsToSend.length,
        jobsIncluded: newJobs.length,
        successRate: ((result.sent / emailsToSend.length) * 100).toFixed(2) + '%',
      },
      jobs: newJobs.map(j => ({ title: j.title, company: j.company })),
      failures: result.details
        .filter(d => !d.success)
        .map(d => ({ email: d.email, error: d.error })),
    };
    
    const fs = await import('fs');
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
    console.log(`\n📁 Detailed metrics saved to: ${metricsFile}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendNewJobAlerts();
