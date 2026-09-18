import { NextRequest, NextResponse } from 'next/server';
import { verifyUnsubscribeToken } from '@/lib/email-unsubscribe';
import { unsubscribeEmailInResend } from '@/lib/resend-unsubscribe';

export const dynamic = 'force-dynamic';

function result(message: string, status = 200) {
  return new NextResponse(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

async function unsubscribe(token: string | null) {
  if (!process.env.RESEND_API_KEY) {
    return result('Email unsubscribe is temporarily unavailable.', 503);
  }

  const email = token ? verifyUnsubscribeToken(token) : null;
  if (!email) return result('Invalid unsubscribe link.', 400);

  try {
    const ok = await unsubscribeEmailInResend(email);
    if (!ok) {
      return result('We could not update your subscription. Try again or contact support@hashtagweb3.com.', 502);
    }
  } catch (err) {
    console.error('[unsubscribe]', err);
    return result('We could not update your subscription. Try again later.', 500);
  }

  return result('You have been unsubscribed from Hashtag Web3 job alerts.');
}

export async function GET(request: NextRequest) {
  return unsubscribe(request.nextUrl.searchParams.get('token'));
}

export async function POST(request: NextRequest) {
  return unsubscribe(request.nextUrl.searchParams.get('token'));
}
