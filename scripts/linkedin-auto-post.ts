/**
 * Auto-post new jobs to LinkedIn
 * Run with: pnpm linkedin:post-jobs
 */

import admin from 'firebase-admin';
import { randomUUID } from 'node:crypto';
import { postToLinkedIn, formatJobForLinkedIn } from '../src/lib/linkedin';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';
import { assertPublishableJob } from './lib/job-publish-guard.mjs';

async function fetchRecentLinkedInPosts(accessToken: string, organizationId: string): Promise<any[]> {
  try {
    const url = `https://api.linkedin.com/rest/posts?author=urn%3Ali%3Aorganization%3A${organizationId}&q=author&count=50`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'LinkedIn-Version': '202405',
      },
    });

    if (!res.ok) {
      console.warn(`[Pre-flight] LinkedIn API warning: ${res.status} ${await res.text()}`);
      return [];
    }

    const data = await res.json() as any;
    return data.elements || [];
  } catch (err) {
    console.warn('[Pre-flight] LinkedIn fetch failed:', err);
    return [];
  }
}

function isJobAlreadyPosted(job: any, recentPosts: any[]): { posted: boolean; postId?: string; url?: string } {
  const jobTitleClean = job.title.toLowerCase().trim();
  const jobCompanyClean = job.company ? job.company.toLowerCase().trim() : '';
  const jobUrl = job.applicationUrl || job.url || '';

  for (const post of recentPosts) {
    const commentary = (post.commentary || '').toLowerCase();
    
    // Check 1: Check if commentary contains title and company
    const matchesTitle = commentary.includes(jobTitleClean);
    const matchesCompany = jobCompanyClean ? commentary.includes(jobCompanyClean) : true;
    
    if (matchesTitle && matchesCompany) {
      return {
        posted: true,
        postId: post.id,
        url: `https://www.linkedin.com/feed/update/${post.id}`
      };
    }
    
    // Check 2: Check if link matches
    const postLink = post.content?.contentEntities?.[0]?.entityLocation || '';
    if (jobUrl && postLink && (postLink.includes(jobUrl) || jobUrl.includes(postLink))) {
      return {
        posted: true,
        postId: post.id,
        url: `https://www.linkedin.com/feed/update/${post.id}`
      };
    }
  }

  return { posted: false };
}

async function autoPostJobs() {
  try {
    if (!admin.apps.length) admin.initializeApp({
      credential: admin.credential.cert(require('../firebase-adminsdk.json')),
      databaseURL: 'https://hashtag-web3-production.firebaseapp.com',
    });
    const db = admin.firestore();
    console.log('🔍 Searching for unposted jobs...');

    // Find jobs not yet posted to LinkedIn
    const unpostedJobs = await db
      .collection('jobs')
      .where('postedToLinkedIn', '==', false)
      .limit(10)
      .get();

    console.log(`Found ${unpostedJobs.docs.length} unposted jobs`);

    if (unpostedJobs.docs.length > 0) {
      const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
      const organizationId = process.env.LINKEDIN_ORG_ID || '89714573';
      
      let recentPosts: any[] = [];
      if (accessToken) {
        console.log('🔍 Fetching recent LinkedIn posts for pre-flight check...');
        recentPosts = await fetchRecentLinkedInPosts(accessToken, organizationId);
        console.log(`Fetched ${recentPosts.length} recent posts from LinkedIn.`);
      }

      for (const doc of unpostedJobs.docs) {
        const job: admin.firestore.DocumentData = { id: doc.id, ...doc.data() };
        if (!isJobAgeEligible(job)) {
          console.log(`Skipping ineligible job ${doc.id}`);
          continue;
        }
        if (job.postedToLinkedIn || job.linkedInPostId || job.linkedInPublishReservation) {
          console.log(`Keeping existing LinkedIn receipt or reservation for ${doc.id}`);
          continue;
        }

        // Pre-flight check
        if (recentPosts.length > 0) {
          const match = isJobAlreadyPosted(job, recentPosts);
          if (match.posted) {
            console.log(`⚠️ Pre-flight: ${job.title} at ${job.company} was already posted to LinkedIn! Updating state and skipping...`);
            await doc.ref.update({
              postedToLinkedIn: true,
              linkedInPostId: match.postId || 'already-posted',
              linkedInPostUrl: match.url || 'already-posted',
              postedToLinkedInAt: new Date(),
            });
            continue;
          }
        }

        try {
          console.log(`📤 Posting: ${job.title} at ${job.company}`);

          const postOptions = { ...formatJobForLinkedIn(job), linkUrl: job.link };
          await assertPublishableJob(job);
          const reservation = randomUUID();
          await db.runTransaction(async transaction => {
            const latest = (await transaction.get(doc.ref)).data();
            if (!latest || !isJobAgeEligible(latest)) throw new Error('Job is no longer eligible');
            if (latest.postedToLinkedIn || latest.linkedInPostId || latest.linkedInPublishReservation) throw new Error('LinkedIn delivery is already recorded or reserved');
            if (['date', 'link', 'title', 'company'].some(key => latest[key] !== job[key])) throw new Error('Queued LinkedIn job changed');
            transaction.update(doc.ref, { linkedInPublishReservation: reservation });
          });
          const result = await postToLinkedIn(postOptions, async () => {
            const latest = (await doc.ref.get()).data();
            if (!latest || !isJobAgeEligible(latest)) throw new Error('Job is no longer eligible');
            if (latest.linkedInPublishReservation !== reservation || latest.postedToLinkedIn || latest.linkedInPostId) throw new Error('LinkedIn reservation changed');
            if (['date', 'link', 'title', 'company'].some(key => latest[key] !== job[key])) throw new Error('Queued LinkedIn job changed');
            await assertPublishableJob(job);
          });
          if (typeof result.postId !== 'string' || !result.postId.trim()) throw new Error('LinkedIn returned no post receipt; reservation retained');

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
            linkedInPostError: (error as Error).message,
          });
        }
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
