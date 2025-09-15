
import { getJobs } from '@/lib/jobs';
import { NextResponse } from 'next/server';

export const revalidate = 43200; // Revalidate every 12 hours

export async function GET() {
  try {
    const jobs = await getJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("API Error fetching jobs:", error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

