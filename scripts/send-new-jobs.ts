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
import { Resend } from 'resend';

async function cleanSuppressedEmails(db: admin.firestore.Firestore, resend: Resend): Promise<number> {
  try {
    console.log('🧹 Cleaning suppressed emails from subscriber list...');

    // Fetch all emails from Resend
    const resendResponse = await resend.emails.list({ limit: 500 });

    if (!resendResponse.data || !resendResponse.data.data) {
      console.log('ℹ️  No emails found in Resend to check');
      return 0;
    }

    // Identify suppressed emails
    const suppressedEmails = new Set<string>();
    resendResponse.data.data.forEach((email: any) => {
      const lastEvent = email.last_event?.toLowerCase() || '';
      const recipientEmail = Array.isArray(email.to) ? email.to[0] : email.to;

      if (!recipientEmail) return;

      // Mark as suppressed if bounced, complained, or suppressed
      if (lastEvent === 'bounced' || lastEvent === 'complained' || lastEvent === 'suppressed') {
        suppressedEmails.add(recipientEmail.toLowerCase());
      }
    });

    if (suppressedEmails.size === 0) {
      console.log('✅ No suppressed emails found');
      return 0;
    }

    // Find and delete suppressed subscribers
    const snapshot = await db.collection('subscribers').get();
    let deleted = 0;

    for (const doc of snapshot.docs) {
      const email = doc.data().email?.toLowerCase();
      if (email && suppressedEmails.has(email)) {
        await doc.ref.delete();
        deleted++;
      }
    }

    if (deleted > 0) {
      console.log(`✅ Removed ${deleted} suppressed subscriber(s) from database`);
    }

    return deleted;
  } catch (error: any) {
    console.warn('⚠️  Failed to clean suppressed emails:', error.message);
    console.log('Continuing with email send anyway...');
    return 0;
  }
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
    // Clean suppressed emails first
    const resend = new Resend(process.env.RESEND_API_KEY);
    await cleanSuppressedEmails(db, resend);
    console.log('');

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
      summary: {
        sent: result.sent,
        failed: result.failed,
        total: emails.length,
        jobsIncluded: newJobs.length,
        successRate: ((result.sent / emails.length) * 100).toFixed(2) + '%',
      },
      jobs: newJobs.map(j => ({ title: j.title, company: j.company })),
      deliveries: result.details.map(d => ({
        email: d.email,
        success: d.success,
        messageId: d.messageId,
        error: d.error,
        timestamp: d.timestamp,
      })),
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
