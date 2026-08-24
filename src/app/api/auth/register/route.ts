import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const agentId = body.agent_id || body.client_id || `agent_${Date.now()}`;
  const registrationToken = Buffer.from(`${agentId}:${Date.now()}`).toString('base64url');

  return NextResponse.json(
    {
      agent_id: agentId,
      register_uri: 'https://hashtagweb3.com/api/auth/register',
      claim_uri: 'https://hashtagweb3.com/api/auth/claim',
      revocation_uri: 'https://hashtagweb3.com/api/auth/revoke',
      registration_token: registrationToken,
      expires_in: 3600,
      message: 'Agent registered. Use the registration_token to claim a bearer credential via POST /api/auth/claim.',
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
      register_uri: 'https://hashtagweb3.com/api/auth/register',
      claim_uri: 'https://hashtagweb3.com/api/auth/claim',
      revocation_uri: 'https://hashtagweb3.com/api/auth/revoke',
      identity_types_supported: ['anonymous', 'identity_assertion'],
      message: 'POST to this endpoint with { agent_id, identity_type } to register an agent identity.',
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
