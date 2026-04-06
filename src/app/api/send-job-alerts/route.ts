import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server-init';
import { sendBatchJobAlerts, type JobListing } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * API route to send job alerts to all subscribers
 * POST /api/send-job-alerts
 * 
 * Body: { jobs: JobListing[], dryRun?: boolean }
 * Authorization: Bearer token (set CRON_SECRET in env)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (protect from unauthorized access)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'your-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobs, dryRun = false } = body as { jobs: JobListing[]; dryRun?: boolean };

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: 'No jobs provided' },
        { status: 400 }
      );
    }

    // Fetch all subscribers from Firestore
    const db = serverFirestore;
    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }
    const subscribersCol = collection(db, 'subscribers');
    const snapshot = await getDocs(subscribersCol);

    if (snapshot.empty) {
      return NextResponse.json({
        message: 'No subscribers found',
        sent: 0,
        failed: 0,
      });
    }

    const emails = [...new Set(
      snapshot.docs
        .map(doc => (doc.data().email as string)?.toLowerCase().trim())
        .filter(Boolean)
    )];

    if (dryRun) {
      return NextResponse.json({
        message: 'Dry run completed',
        subscriberCount: emails.length,
        jobCount: jobs.length,
        wouldSendTo: emails.slice(0, 5), // Show first 5 emails
      });
    }

    // Send emails in batches
    console.log(`📧 Sending job alerts to ${emails.length} subscribers...`);
    const result = await sendBatchJobAlerts(emails, jobs);

    return NextResponse.json({
      message: 'Job alerts sent',
      sent: result.sent,
      failed: result.failed,
      total: emails.length,
      jobs: jobs.length,
    });

  } catch (error: any) {
    console.error('Error sending job alerts:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
