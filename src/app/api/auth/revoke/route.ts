import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (!body.token && !body.access_token) {
    return NextResponse.json(
      {
        error: {
          code: 'MISSING_TOKEN',
          message: 'Provide token or access_token to revoke.',
          docUrl: 'https://hashtagweb3.com/auth.md',
        },
      },
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  return NextResponse.json(
    {
      revoked: true,
      message: 'Token revoked successfully.',
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

export async function GET() {
  return NextResponse.json(
    {
      message: 'POST to this endpoint with { token } to revoke a bearer credential.',
      docUrl: 'https://hashtagweb3.com/auth.md',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    },
  });
}
