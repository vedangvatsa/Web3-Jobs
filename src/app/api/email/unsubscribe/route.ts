import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server-init';
import { verifyUnsubscribeToken } from '@/lib/email-unsubscribe';

export const dynamic = 'force-dynamic';

function result(message: string, status = 200) {
  return new NextResponse(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

async function unsubscribe(token: string | null) {
  const email = token ? verifyUnsubscribeToken(token) : null;
  if (!email || !serverFirestore) return result('Invalid unsubscribe link.', 400);

  const matches = await getDocs(query(collection(serverFirestore, 'subscribers'), where('email', '==', email)));
  await Promise.all(matches.docs.map((subscriber) => updateDoc(subscriber.ref, {
    subscribed: false,
    unsubscribedAt: new Date().toISOString(),
  })));

  return result('You have been unsubscribed from Hashtag Web3 job alerts.');
}

export async function GET(request: NextRequest) {
  return unsubscribe(request.nextUrl.searchParams.get('token'));
}

export async function POST(request: NextRequest) {
  return unsubscribe(request.nextUrl.searchParams.get('token'));
}
