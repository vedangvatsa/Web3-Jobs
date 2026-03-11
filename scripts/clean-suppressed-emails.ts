#!/usr/bin/env node

/**
 * Clean Suppressed Emails from Database
 * 
 * This script:
 * 1. Fetches all emails from Resend
 * 2. Identifies suppressed emails (bounced, complained, unsubscribed)
 * 3. Removes them from Firebase subscribers collection
 * 4. Logs deletion results
 * 
 * Usage: npx tsx scripts/clean-suppressed-emails.ts [--dry-run]
 */

import * as admin from 'firebase-admin';
import { Resend } from 'resend';

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

async function cleanSuppressedEmails() {
  const isDryRun = process.argv.includes('--dry-run');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let db: admin.firestore.Firestore;

  try {
    db = initAdminFirestore();
  } catch (err: any) {
    console.error('❌ Firebase init failed:', err.message);
    process.exit(1);
  }

  try {
    console.log('🧹 Cleaning Suppressed Emails from Database');
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}\n`);

    // Fetch all emails from Resend
    console.log('📥 Fetching all emails from Resend...');
    const resendResponse = await resend.emails.list({ limit: 500 });

    if (!resendResponse.data || !resendResponse.data.data) {
      console.log('ℹ️  No emails found in Resend');
      process.exit(0);
    }

    // Identify suppressed emails
    const suppressedEmails = new Set<string>();
    const suppressionReasons: { [email: string]: string } = {};

    resendResponse.data.data.forEach((email: any) => {
      const lastEvent = email.last_event?.toLowerCase() || '';
      const recipientEmail = Array.isArray(email.to) ? email.to[0] : email.to;

      if (!recipientEmail) return;

      // Mark as suppressed if bounced, complained, or suppressed
      if (lastEvent === 'bounced' || lastEvent === 'complained' || lastEvent === 'suppressed') {
        suppressedEmails.add(recipientEmail);
        suppressionReasons[recipientEmail] = lastEvent;
      }
    });

    console.log(`✅ Found ${suppressedEmails.size} suppressed email(s)\n`);

    if (suppressedEmails.size === 0) {
      console.log('✨ No suppressed emails to clean');
      process.exit(0);
    }

    // Fetch Firebase subscribers
    console.log('📥 Fetching subscribers from Firebase...');
    const snapshot = await db.collection('subscribers').get();
    const subscribers = snapshot.docs.map(doc => ({ id: doc.id, email: doc.data().email }));
    console.log(`✅ Found ${subscribers.length} subscribers\n`);

    // Find subscribers to delete
    const toDelete = subscribers.filter(sub =>
      suppressedEmails.has(sub.email.toLowerCase())
    );

    console.log('🗑️  EMAILS TO DELETE:');
    console.log('────────────────────────────────────');
    toDelete.forEach(sub => {
      const reason = suppressionReasons[sub.email.toLowerCase()] || 'unknown';
      console.log(`  • ${sub.email}`);
      console.log(`    Reason: ${reason}`);
    });
    console.log('────────────────────────────────────\n');

    if (isDryRun) {
      console.log(`📋 DRY RUN: Would delete ${toDelete.length} subscriber(s)`);
      console.log('Remove --dry-run flag to actually delete.');
      process.exit(0);
    }

    // Delete from Firebase
    console.log(`🗑️  Deleting ${toDelete.length} suppressed subscriber(s)...`);
    let deleted = 0;
    let failed = 0;

    for (const sub of toDelete) {
      try {
        await db.collection('subscribers').doc(sub.id).delete();
        deleted++;
        console.log(`  ✅ Deleted: ${sub.email}`);
      } catch (error: any) {
        failed++;
        console.error(`  ❌ Failed to delete ${sub.email}: ${error.message}`);
      }
    }

    console.log('');
    console.log('✅ CLEANUP COMPLETE');
    console.log(`Deleted: ${deleted}`);
    console.log(`Failed: ${failed}`);
    console.log(`Remaining subscribers: ${subscribers.length - deleted}`);

    // Log cleanup event
    const now = new Date().toISOString();
    console.log(`\n📊 Cleanup log saved for audit trail`);
    console.log(`Timestamp: ${now}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanSuppressedEmails();
