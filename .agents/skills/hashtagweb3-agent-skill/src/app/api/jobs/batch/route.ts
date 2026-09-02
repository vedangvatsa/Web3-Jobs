import { NextRequest, NextResponse } from 'next/server';
import { getJobs } from '@/lib/jobs';

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const queries: Array<{ search?: string; tag?: string; company?: string; limit?: number }> = 
    Array.isArray(body) ? body : (body.queries || body.requests || []);

  const allJobs = await getJobs();

  const results = queries.map((q, idx) => {
    let filtered = allJobs;
    if (q.search) {
      const term = q.search.toLowerCase();
      filtered = filtered.filter(j => j.title.toLowerCase().includes(term) || j.company.toLowerCase().includes(term));
    }
    if (q.company) {
      filtered = filtered.filter(j => j.company.toLowerCase().includes(q.company!.toLowerCase()));
    }
    const limit = q.limit || 10;
    return {
      index: idx,
      query: q,
      total: filtered.length,
      data: filtered.slice(0, limit),
    };
  });

  return NextResponse.json(
    {
      batch_results: results,
      total_queries: results.length,
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Idempotency-Key',
    },
  });
}
