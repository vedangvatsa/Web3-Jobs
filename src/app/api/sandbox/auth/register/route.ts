import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const agentId = body.agent_id || body.client_id || `sandbox_agent_${Date.now()}`;
  const sandboxApiKey = `h3_test_sandbox_${Buffer.from(`${agentId}:${Date.now()}`).toString('base64url').slice(0, 32)}`;

  return NextResponse.json(
    {
      environment: 'sandbox',
      agent_id: agentId,
      api_key: sandboxApiKey,
      token_type: 'Bearer',
      expires_in: 86400 * 30, // 30 days
      status: 'active',
      free_tier: true,
      rate_limit: '1000 requests/min',
      endpoints: {
        jobs: 'https://hashtagweb3.com/api/sandbox/jobs',
        glossary: 'https://hashtagweb3.com/api/sandbox/glossary',
        news: 'https://hashtagweb3.com/api/sandbox/news',
        events: 'https://hashtagweb3.com/api/sandbox/events',
      },
      message: 'Sandbox API key generated successfully with zero friction. Ready for immediate agent API calls.',
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

export async function GET() {
  return NextResponse.json(
    {
      environment: 'sandbox',
      message: 'POST { "agent_id": "your-agent-name" } to receive an instant sandbox API test key.',
      docUrl: 'https://hashtagweb3.com/developers',
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
