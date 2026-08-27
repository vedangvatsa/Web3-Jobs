import { NextResponse } from 'next/server';

const MOCK_SANDBOX_NEWS = [
  {
    title: 'Ethereum Layer 2 Activity Surpasses 10,000 TPS Benchmark (Sandbox Test)',
    link: 'https://hashtagweb3.com/news/sandbox-layer-2-milestone',
    pubDate: 'Fri, 28 Aug 2026 00:00:00 GMT',
    contentSnippet: 'Test headline for sandbox API evaluation and agent parsing validation.',
    source: 'Hashtag Web3 Sandbox Wire',
    isSandbox: true,
  },
];

export async function GET() {
  return NextResponse.json(
    {
      environment: 'sandbox',
      total: MOCK_SANDBOX_NEWS.length,
      count: MOCK_SANDBOX_NEWS.length,
      news: MOCK_SANDBOX_NEWS,
      message: 'Sandbox mock news response. Safe for automated agent testing.',
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
