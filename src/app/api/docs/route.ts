import { NextResponse } from 'next/server';

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

export async function GET() {
  return NextResponse.redirect('https://hashtagweb3.com/developers', {
    status: 307,
    headers: CORS_HEADERS,
  });
}

export async function HEAD() {
  return NextResponse.redirect('https://hashtagweb3.com/developers', {
    status: 307,
    headers: CORS_HEADERS,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS_HEADERS, 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS' },
  });
}
