import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 86400;

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', '.well-known', 'api-catalog');
    const content = fs.readFileSync(filePath, 'utf8');

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/linkset+json;profile="https://www.rfc-editor.org/info/rfc9727"',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'API catalog not found' }, { status: 404 });
  }
}
