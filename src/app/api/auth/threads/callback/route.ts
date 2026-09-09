import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const APP_ID = '1504312414704579';
const APP_SECRET = process.env.THREADS_APP_SECRET;
const REDIRECT_URI = 'https://hashtagweb3.com/api/auth/threads/callback';

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };
const DOC_URL = 'https://hashtagweb3.com/developers';

function apiError(code: string, message: string, hint: string, status: number) {
  return NextResponse.json({ error: { code, message, hint, docUrl: DOC_URL } }, { status, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS_HEADERS, 'Access-Control-Allow-Methods': 'GET, OPTIONS' },
  });
}

export async function GET(request: NextRequest) {
  if (!APP_SECRET) {
    return apiError(
      'OAUTH_NOT_CONFIGURED',
      'Threads OAuth is not configured on the server.',
      'Set THREADS_APP_SECRET in the environment.',
      500
    );
  }
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json(
      { error: { code: 'MISSING_CODE', message: 'No authorization code provided in callback query.', hint: 'Restart the Threads OAuth flow.', docUrl: DOC_URL } },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    // 1. Exchange short-lived code
    const tokenForm = new URLSearchParams({
      client_id: APP_ID,
      client_secret: APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code,
    });

    const tokenRes = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenForm,
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return NextResponse.json(
        { error: { code: 'TOKEN_EXCHANGE_FAILED', message: 'Short-lived token exchange failed.', hint: errText.slice(0, 200), docUrl: DOC_URL } },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const tokenData = await tokenRes.json();
    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id;

    // 2. Exchange long-lived token
    const longLivedRes = await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${APP_SECRET}&access_token=${shortLivedToken}`);
    
    if (!longLivedRes.ok) {
      const errText = await longLivedRes.text();
      return NextResponse.json(
        { error: { code: 'TOKEN_EXCHANGE_FAILED', message: 'Long-lived token exchange failed.', hint: errText.slice(0, 200), docUrl: DOC_URL } },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const longLivedData = await longLivedRes.json();
    const longLivedToken = longLivedData.access_token;

    return NextResponse.json({
      status: 'success',
      message: 'Threads authentication complete!',
      THREADS_USER_ID: String(userId),
      THREADS_ACCESS_TOKEN: longLivedToken,
      instructions: 'Copy THREADS_USER_ID and THREADS_ACCESS_TOKEN into your .env.local file.',
    }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err.message || 'Internal server error.', hint: 'Retry the OAuth flow.', docUrl: DOC_URL } },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
