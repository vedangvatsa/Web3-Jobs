#!/usr/bin/env node

/**
 * Script to export all emails from the 'subscribers' collection in Firestore to a CSV file.
 * Run with: npm run export:emails
 */

import { getAdminFirestore, isFirebaseAdminConfigured } from '../src/lib/firebase-admin-server';
import fs from 'fs/promises';
import path from 'path';

async function exportEmails() {
  console.log('🔄 Initializing Firebase and connecting to Firestore...');

  // Firestore rules deny public reads, so the export must use the Admin SDK service account.
  if (!isFirebaseAdminConfigured()) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY is not set. Please ensure your .env.local file is set up correctly.');
    process.exit(1);
  }

  const db = getAdminFirestore();
  if (!db) {
    console.error('❌ Firebase Admin is not initialized. Check FIREBASE_SERVICE_ACCOUNT_KEY.');
    process.exit(1);
  }

  try {
    console.log("📥 Fetching documents from 'subscribers' collection...");
    const snapshot = await db.collection('subscribers').get();

    if (snapshot.empty) {
      console.log('No subscribers found.');
      process.exit(0);
      return;
    }

    const subscribers = snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 'N/A';
      return { email: data.email, createdAt };
    });

    console.log(`✅ Found ${subscribers.length} subscribers.`);

    const csvData = [
      ['email', 'subscribed_at'],
      ...subscribers.map(s => [s.email, s.createdAt])
    ].map(e => e.join(',')).join('\n');

    const outputPath = path.join(process.cwd(), 'subscribers.csv');
    await fs.writeFile(outputPath, csvData);

    console.log(`✅ Successfully exported ${subscribers.length} emails to subscribers.csv`);
    
    // In a script, we need to explicitly exit the process
    process.exit(0);

  } catch (error) {
    console.error('❌ Error exporting emails:', error);
    process.exit(1);
  }
}

exportEmails();
