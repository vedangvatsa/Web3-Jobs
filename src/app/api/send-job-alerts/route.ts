import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server-init';
import { sendBatchJobAlerts, type JobListing } from '@/lib/email';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };
const DOC_URL = 'https://hashtagweb3.com/developers';

function apiError(code: string, message: string, hint: string, status: number) {
  return NextResponse.json({ error: { code, message, hint, docUrl: DOC_URL } }, { status, headers: CORS_HEADERS });
}

function apiOk(data: Record<string, unknown>) {
  return NextResponse.json(data, { headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS_HEADERS, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  });
}

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
  const expectedToken = process.env.CRON_SECRET;
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return apiError('UNAUTHORIZED', 'Unauthorized.', 'Provide a valid Authorization: Bearer <CRON_SECRET> header.', 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_BODY', 'Request body must be valid JSON.', 'POST { "jobs": [...] } with Content-Type: application/json.', 400);
  }
  const { jobs, dryRun = false } = body as { jobs: JobListing[]; dryRun?: boolean };

  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
    return apiError('MISSING_JOBS', 'No jobs provided.', 'POST { "jobs": [{...}], "dryRun": true } to test without sending.', 400);
  }

  // Fetch all subscribers from Firestore
  const db = serverFirestore;
  if (!db) {
    return apiError('DB_NOT_CONFIGURED', 'Database not configured.', 'Configure Firestore server credentials.', 503);
  }
  const subscribersCol = collection(db, 'subscribers');
  const snapshot = await getDocs(subscribersCol);

  if (snapshot.empty) {
    return apiOk({
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
    return apiOk({
      message: 'Dry run completed',
      subscriberCount: emails.length,
      jobCount: jobs.length,
      wouldSendTo: emails.slice(0, 5), // Show first 5 emails
    });
  }

  // Send emails in batches
  console.log(`📧 Sending job alerts to ${emails.length} subscribers...`);
  const result = await sendBatchJobAlerts(emails, jobs);

  return apiOk({
    message: 'Job alerts sent',
    sent: result.sent,
    failed: result.failed,
    total: emails.length,
    jobs: jobs.length,
  });

  } catch (error: any) {
    console.error('Error sending job alerts:', error);
    return apiError('INTERNAL_ERROR', error.message || 'Internal server error.', 'Retry the request; check server logs for details.', 500);
  }
}
