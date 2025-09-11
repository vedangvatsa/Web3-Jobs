
import { getNewsFeed } from '@/lib/news';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Revalidate every 1 hour

export async function GET() {
  try {
    const newsItems = await getNewsFeed();
    return NextResponse.json(newsItems);
  } catch (error) {
    console.error("API Error fetching news:", error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
