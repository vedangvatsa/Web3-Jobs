/**
 * LinkedIn OAuth callback handler
 * GET /api/auth/linkedin/callback?code=...&state=...
 */

import admin from 'firebase-admin';
import { getLinkedInAccessToken } from '@/lib/linkedin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
 try {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Check for OAuth errors
  if (error) {
   return NextResponse.json(
    { error: `LinkedIn OAuth error: ${error}` },
    { status: 400 }
   );
  }

  if (!code) {
   return NextResponse.json(
    { error: 'No authorization code received' },
    { status: 400 }
   );
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
  return NextResponse.json(
   { error: (error as Error).message },
   { status: 500 }
  );
 }
}
