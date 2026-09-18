import { NextRequest, NextResponse } from 'next/server';
import { runDailyBroadcast } from '@/lib/resend-daily';

/**
 * GET /api/cron/daily-alerts — daily job-alerts broadcast for cron-job.org.
 *
 * Auth: Authorization: Bearer <CRON_SECRET> (CRON_SECRET env on the server).
 * Query: ?dry_run=1 validates end-to-end without sending (creates + deletes
 * a draft). ?force=1 bypasses the per-day send lock (same as CLI --force).
 *
 * Same implementation as the GitHub Action path (src/lib/resend-daily.ts);
 * the per-UTC-day send lock + Resend-side duplicate check make double sends
 * impossible, so this route and the Action schedules back each other up.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 600;

function unauthorized() {
  return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Bad or missing cron secret.' } }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: { code: 'MISCONFIGURED', message: 'CRON_SECRET is not set on the server.' } },
      { status: 500 },
    );
  }
  const auth = request.headers.get('authorization') || '';
  if (auth !== `Bearer ${secret}`) return unauthorized();

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get('dry_run') === '1';
  const forceSend = searchParams.get('force') === '1';

  try {
    const result = await runDailyBroadcast({ jobLimit: 10, dryRun, forceSend });
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error('cron daily-alerts failed:', e?.message || e);
    return NextResponse.json(
      { ok: false, error: { code: 'SEND_FAILED', message: e?.message || 'Unknown error' } },
      { status: 500 },
    );
  }
}
