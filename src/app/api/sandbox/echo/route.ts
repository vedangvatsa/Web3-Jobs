import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query: Record<string, string> = {};
  searchParams.forEach((v, k) => { query[k] = v; });

  return NextResponse.json(
    {
      environment: 'sandbox',
      method: 'GET',
      query,
      headers: {
        userAgent: request.headers.get('user-agent'),
        authorization: request.headers.get('authorization') ? 'Bearer [REDACTED]' : undefined,
        accept: request.headers.get('accept'),
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Environment': 'sandbox',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  return NextResponse.json(
    {
      environment: 'sandbox',
      method: 'POST',
      body,
      headers: {
        userAgent: request.headers.get('user-agent'),
        authorization: request.headers.get('authorization') ? 'Bearer [REDACTED]' : undefined,
        contentType: request.headers.get('content-type'),
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Environment': 'sandbox',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
}
