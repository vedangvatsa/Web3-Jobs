#!/usr/bin/env node

/**
 * Script to export all emails from the 'subscribers' collection in Firestore to a CSV file.
 * Run with: npm run export:emails
 */

import { collection, getDocs } from 'firebase/firestore';
import { serverFirestore } from '../src/firebase/server-init';
import fs from 'fs/promises';
import path from 'path';

async function exportEmails() {
  console.log('🔄 Initializing Firebase and connecting to Firestore...');
  
  if (!serverFirestore) {
    console.error('❌ Firebase is not initialized. Please ensure your .env file is set up correctly.');
    process.exit(1);
  }

  try {
    const db = serverFirestore;
    const subscribersCol = collection(db, 'subscribers');

    console.log("📥 Fetching documents from 'subscribers' collection...");
    const snapshot = await getDocs(subscribersCol);

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
