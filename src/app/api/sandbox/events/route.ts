import { NextResponse } from 'next/server';

const MOCK_SANDBOX_EVENTS = [
  {
    name: 'ETHGlobal Bangkok 2026 (Sandbox Test)',
    startDate: '2026-11-15T09:00:00.000Z',
    endDate: '2026-11-17T18:00:00.000Z',
    location: 'Bangkok, Thailand',
    city: 'Bangkok',
    country: 'Thailand',
    type: 'hackathon',
    url: 'https://hashtagweb3.com/events/sandbox-ethglobal-bangkok',
    isSandbox: true,
  },
];

export async function GET() {
  return NextResponse.json(
    {
      environment: 'sandbox',
      total: MOCK_SANDBOX_EVENTS.length,
      count: MOCK_SANDBOX_EVENTS.length,
      events: MOCK_SANDBOX_EVENTS,
      message: 'Sandbox mock events response. Safe for automated agent testing.',
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
