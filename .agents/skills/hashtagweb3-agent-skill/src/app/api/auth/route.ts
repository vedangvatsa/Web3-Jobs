import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required for privileged operations. Public read operations on /api/jobs, /api/news, /api/events, and /api/glossary are unauthenticated.',
        hint: 'Obtain an agent token via POST https://hashtagweb3.com/api/auth/register or query public endpoints directly.',
        docUrl: 'https://hashtagweb3.com/auth.md',
      },
    },
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer resource_metadata="https://hashtagweb3.com/.well-known/oauth-protected-resource"',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    },
  });
}
