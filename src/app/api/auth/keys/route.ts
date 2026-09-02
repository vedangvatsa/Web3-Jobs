import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const name = body.name || body.agent_id || 'agent_default';
  const apiKey = `h3_live_free_${Buffer.from(`${name}:${Date.now()}`).toString('base64url').slice(0, 32)}`;

  return NextResponse.json({
    api_key: apiKey,
    key: apiKey,
    token: apiKey,
    name,
    tier: 'free',
    rate_limit: '120 requests/min',
    status: 'active',
    created_at: new Date().toISOString(),
    message: 'API key generated successfully with zero human friction.',
  }, {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    free_tier: true,
    self_serve: true,
    message: 'POST { name?: string } to generate an instant self-serve API key.',
    docUrl: 'https://hashtagweb3.com/developers',
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
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
