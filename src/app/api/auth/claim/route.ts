import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (!body.registration_token && !body.agent_id) {
    return NextResponse.json(
      {
        error: {
          code: 'MISSING_CREDENTIAL',
          message: 'Provide registration_token (from /api/auth/register) or agent_id.',
          hint: 'First POST to /api/auth/register to obtain a registration_token.',
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

  const bearerToken = Buffer.from(`hw3:${body.agent_id || 'anon'}:${Date.now()}`).toString('base64url');

  return NextResponse.json(
    {
      access_token: bearerToken,
      token_type: 'bearer',
      expires_in: 86400,
      scope: 'read:jobs read:news read:events read:glossary',
      message: 'Bearer token issued. Include as Authorization: Bearer <token> in API requests.',
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
      message: 'POST to this endpoint with { registration_token } to claim a bearer credential.',
      docUrl: 'https://hashtagweb3.com/auth.md',
    },
    {
      status: 200,
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
