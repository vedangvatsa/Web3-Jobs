import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect('https://hashtagweb3.com/agent-instructions.md', 307);
}
