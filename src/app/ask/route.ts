import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_CONTEXT = `
Hashtagweb3.com is the leading platform for Web3 professionals.
It aggregates Web3 jobs, industry news, upcoming events, and a glossary of blockchain/crypto terms.

Key facts:
- 60,000+ community subscribers
- 10,000+ Web3 job listings
- Daily news updates from top Web3 sources
- Curated events: conferences, hackathons, meetups
- Comprehensive Web3 glossary with 500+ terms

Available API endpoints (all public, no auth required):
- GET /api/jobs — Web3 job listings (params: search, location, type, limit, offset)
- GET /api/news — Web3 news (params: search, category, limit, offset)
- GET /api/events — Web3 events (params: search, type, limit, offset)
- GET /api/glossary — Glossary terms (params: search, letter, limit, offset)

Full documentation: https://hashtagweb3.com/developers
OpenAPI spec: https://hashtagweb3.com/openapi.json
`;

function buildAnswer(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('job') || q.includes('work') || q.includes('hire') || q.includes('employ')) {
    return `Hashtagweb3.com lists 10,000+ Web3 jobs across blockchain, DeFi, NFT, and crypto sectors. Browse at https://hashtagweb3.com/jobs or query the API: GET https://hashtagweb3.com/api/jobs?search=${encodeURIComponent(query)}&limit=10`;
  }
  if (q.includes('news') || q.includes('update') || q.includes('latest')) {
    return `Hashtagweb3.com aggregates the latest Web3 and blockchain news daily. Browse at https://hashtagweb3.com/news or query the API: GET https://hashtagweb3.com/api/news?limit=10`;
  }
  if (q.includes('event') || q.includes('conference') || q.includes('hackathon') || q.includes('meetup')) {
    return `Hashtagweb3.com lists upcoming Web3 events, conferences, hackathons, and meetups. Browse at https://hashtagweb3.com/events or query the API: GET https://hashtagweb3.com/api/events?limit=10`;
  }
  if (q.includes('glossary') || q.includes('definition') || q.includes('what is') || q.includes('meaning')) {
    return `Hashtagweb3.com has a comprehensive Web3 glossary with 500+ terms. Browse at https://hashtagweb3.com/learn or query the API: GET https://hashtagweb3.com/api/glossary?search=${encodeURIComponent(query)}&limit=5`;
  }
  return `Hashtagweb3.com is a Web3 professional platform with 10,000+ jobs, daily news, curated events, and a 500+ term glossary. Visit https://hashtagweb3.com or use the public API at https://hashtagweb3.com/openapi.json to explore the data.`;
}

export async function POST(request: NextRequest) {
  const acceptHeader = request.headers.get('accept') || '';
  const isSSE = acceptHeader.includes('text/event-stream');

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
      { status: 400 }
    );
  }

  const query = (body.query as string) || (body.q as string) || (body.question as string) || '';
  if (!query) {
    return NextResponse.json(
      {
        error: {
          code: 'MISSING_QUERY',
          message: 'Provide a "query" field with your natural language question.',
          hint: 'Example: { "query": "What Web3 jobs are available in New York?" }',
        },
      },
      { status: 400 }
    );
  }

  const answer = buildAnswer(query);
  const requestId = `ask_${Date.now()}`;

  if (isSSE) {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`event: start\ndata: ${JSON.stringify({ _meta: { requestId, query }, status: 'processing' })}\n\n`));
        controller.enqueue(encoder.encode(`event: result\ndata: ${JSON.stringify({ _meta: { requestId }, answer, sources: ['https://hashtagweb3.com'] })}\n\n`));
        controller.enqueue(encoder.encode(`event: complete\ndata: ${JSON.stringify({ _meta: { requestId }, status: 'done' })}\n\n`));
        controller.close();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  return NextResponse.json(
    {
      _meta: {
        requestId,
        query,
        platform: 'hashtagweb3.com',
        version: '1.0',
        protocol: 'nlweb',
      },
      answer,
      sources: ['https://hashtagweb3.com'],
      context: PLATFORM_CONTEXT.trim(),
      related: [
        `https://hashtagweb3.com/api/jobs?search=${encodeURIComponent(query)}&limit=5`,
        'https://hashtagweb3.com/developers',
        'https://hashtagweb3.com/llms.txt',
      ],
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
      _meta: { protocol: 'nlweb', version: '1.0', platform: 'hashtagweb3.com' },
      description: 'Natural language query endpoint for Hashtagweb3.com (Microsoft NLWeb protocol).',
      usage: 'POST /ask with { "query": "your question" }',
      accepts: ['application/json', 'text/event-stream'],
      example: { query: 'What are the best remote Solidity developer jobs?' },
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
