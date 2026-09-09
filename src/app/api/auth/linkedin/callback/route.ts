/**
 * LinkedIn OAuth callback handler
 * GET /api/auth/linkedin/callback?code=...&state=...
 */

import admin from 'firebase-admin';
import { getLinkedInAccessToken } from '@/lib/linkedin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
 try {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Check for OAuth errors
  if (error) {
   return apiError('OAUTH_ERROR', `LinkedIn OAuth error: ${error}`, 'Restart the LinkedIn connection flow.', 400);
  }

  if (!code) {
   return apiError('MISSING_CODE', 'No authorization code received.', 'Restart the LinkedIn connection flow.', 400);
  }

  // Exchange code for access token
  const accessToken = await getLinkedInAccessToken(code);

  // Store access token in Firestore admin config
  const db = admin.firestore();
  await db.collection('config').doc('linkedin').set(
   {
    accessToken,
    accessTokenUpdatedAt: new Date(),
    state,
   },
   { merge: true }
  );

  // Redirect to success page
  return NextResponse.redirect(
   new URL('/admin/social?linkedin=connected', request.url)
  );
 } catch (error) {
  console.error('LinkedIn OAuth error:', error);
  return apiError('INTERNAL_ERROR', (error as Error).message, 'Retry the OAuth flow.', 500);
 }
}
