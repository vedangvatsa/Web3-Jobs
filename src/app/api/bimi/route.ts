import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.redirect('https://hashtagweb3.com/logo-bimi.svg', 307);
}
