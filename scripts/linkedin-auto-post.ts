/**
 * Auto-post new jobs to LinkedIn
 * Run with: pnpm linkedin:post-jobs
 */

import admin from 'firebase-admin';
import { postToLinkedIn, formatJobForLinkedIn } from '../src/lib/linkedin';

// Initialize Firebase Admin
const serviceAccount = require('../firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hashtag-web3-production.firebaseapp.com',
});

const db = admin.firestore();

async function autoPostJobs() {
  try {
    console.log('🔍 Searching for unposted jobs...');

    // Find jobs not yet posted to LinkedIn
    const unpostedJobs = await db
      .collection('jobs')
      .where('postedToLinkedIn', '==', false)
      .limit(10)
      .get();

    console.log(`Found ${unpostedJobs.docs.length} unposted jobs`);

    for (const doc of unpostedJobs.docs) {
      const job = doc.data();

      try {
        console.log(`📤 Posting: ${job.title} at ${job.company}`);

        const postOptions = formatJobForLinkedIn(job);
        const result = await postToLinkedIn(postOptions);

        // Mark as posted
        await doc.ref.update({
          postedToLinkedIn: true,
          linkedInPostId: result.postId,
          linkedInPostUrl: result.url,
          postedToLinkedInAt: new Date(),
        });

        console.log(`✅ Posted to LinkedIn: ${result.url}`);

        // Wait 2 seconds between posts to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed to post ${job.title}:`, error);
        // Mark as failed so we don't retry
        await doc.ref.update({
          postedToLinkedIn: false,
          linkedInPostError: (error as Error).message,
        });
      }
    }

    console.log('✨ Done!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  autoPostJobs();
}

export { autoPostJobs };
