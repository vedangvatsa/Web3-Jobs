import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'index.md');
    const content = fs.readFileSync(filePath, 'utf8');

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600',
        'X-AI-Usage': 'indexing=yes, search=yes, inference=yes, citation=yes',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Markdown index not found' }, { status: 404 });
  }
}
