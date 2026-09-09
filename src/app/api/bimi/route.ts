import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'logo-bimi.svg');
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'SVG not found.', hint: 'The BIMI logo asset is missing on the server.', docUrl: 'https://hashtagweb3.com/developers' } },
      { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
