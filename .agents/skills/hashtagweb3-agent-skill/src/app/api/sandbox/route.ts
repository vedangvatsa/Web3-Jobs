import { NextResponse } from 'next/server';

export const revalidate = 86400;

export async function GET() {
  return NextResponse.json(
    {
      environment: 'sandbox',
      status: 'operational',
      version: '1.0.0',
      description: 'Hashtag Web3 Sandbox & Testing Environment. Free, unauthenticated test sandbox with mock data for AI agents and developer integrations.',
      auth: {
        zero_auth_access: true,
        free_tier: true,
        test_api_key: 'h3_test_sandbox_key_demo123',
        rate_limit: '1000 requests per minute',
        self_serve_registration: 'https://hashtagweb3.com/api/sandbox/auth/register',
      },
      endpoints: {
        jobs: 'https://hashtagweb3.com/api/sandbox/jobs',
        glossary: 'https://hashtagweb3.com/api/sandbox/glossary',
        news: 'https://hashtagweb3.com/api/sandbox/news',
        events: 'https://hashtagweb3.com/api/sandbox/events',
        auth_register: 'https://hashtagweb3.com/api/sandbox/auth/register',
        echo: 'https://hashtagweb3.com/api/sandbox/echo',
      },
      production_endpoints: {
        jobs: 'https://hashtagweb3.com/api/v1/jobs',
        glossary: 'https://hashtagweb3.com/api/v1/glossary',
        news: 'https://hashtagweb3.com/api/v1/news',
        events: 'https://hashtagweb3.com/api/v1/events',
        auth: 'https://hashtagweb3.com/api/auth/register',
      },
      documentation: 'https://hashtagweb3.com/developers',
      openapi_spec: 'https://hashtagweb3.com/openapi.json',
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'X-Environment': 'sandbox',
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '999',
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-API-Key',
    },
  });
}
