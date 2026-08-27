import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect('https://hashtagweb3.com/auth.md', 307);
}
