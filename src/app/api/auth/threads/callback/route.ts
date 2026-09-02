import { NextRequest, NextResponse } from 'next/server';

const APP_ID = '1522577345822759';
const APP_SECRET = process.env.THREADS_APP_SECRET || 'e4be55e142ff55b6a98cf092ecb3edd6';
const REDIRECT_URI = 'https://hashtagweb3.com/api/auth/threads/callback';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided in callback query' }, { status: 400 });
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
      return NextResponse.json({ error: 'Short-lived token exchange failed', details: errText }, { status: 400 });
    }

    const tokenData = await tokenRes.json();
    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id;

    // 2. Exchange long-lived token
    const longLivedRes = await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${APP_SECRET}&access_token=${shortLivedToken}`);
    
    if (!longLivedRes.ok) {
      const errText = await longLivedRes.text();
      return NextResponse.json({ error: 'Long-lived token exchange failed', details: errText }, { status: 400 });
    }

    const longLivedData = await longLivedRes.json();
    const longLivedToken = longLivedData.access_token;

    return NextResponse.json({
      status: 'success',
      message: 'Threads authentication complete!',
      THREADS_USER_ID: String(userId),
      THREADS_ACCESS_TOKEN: longLivedToken,
      instructions: 'Copy THREADS_USER_ID and THREADS_ACCESS_TOKEN into your .env.local file.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
