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
  const apiKey = `h3_live_free_${Buffer.from(`${agentId}:${Date.now()}`).toString('base64url').slice(0, 32)}`;

  return NextResponse.json(
    {
      agent_id: agentId,
      api_key: apiKey,
      access_token: apiKey,
      token_type: 'Bearer',
      free_tier: true,
      register_uri: 'https://hashtagweb3.com/api/auth/register',
      claim_uri: 'https://hashtagweb3.com/api/auth/claim',
      revocation_uri: 'https://hashtagweb3.com/api/auth/revoke',
      registration_token: registrationToken,
      expires_in: 86400 * 30,
      message: 'Agent registered and API key generated. Use Bearer authorization header with this key or access public endpoints without credentials.',
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin',
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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin',
      'Allow': 'GET, POST, OPTIONS',
    },
  });
}
