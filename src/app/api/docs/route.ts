import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect('https://hashtagweb3.com/developers', 307);
}

export async function HEAD() {
  return NextResponse.redirect('https://hashtagweb3.com/developers', 307);
}
