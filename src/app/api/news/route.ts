
import { getNewsFeed } from '@/lib/news';
import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache the response on the CDN for 5 minutes (ISR)

export async function GET() {
 try {
  const newsItems = await getNewsFeed();
  return NextResponse.json(newsItems);
 } catch (error) {
  console.error("API Error fetching news:", error);
  return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
 }
}
