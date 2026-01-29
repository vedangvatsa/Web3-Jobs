
import { getAllArticles } from '@/lib/articles';
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET() {
  try {
    const articles = await getAllArticles();
    return NextResponse.json(articles);
  } catch (error) {
    console.error("API Error fetching articles:", error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
