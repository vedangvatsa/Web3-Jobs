import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateSitemapJson } from '../../../scripts/generate-sitemap-json';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'sitemap.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Vary': 'Accept, Accept-Encoding',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          'X-AI-Usage': 'indexing=yes, search=yes, inference=yes, citation=yes',
        },
      });
    }

    const data = await generateSitemapJson();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Vary': 'Accept, Accept-Encoding',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-AI-Usage': 'indexing=yes, search=yes, inference=yes, citation=yes',
      },
    });
  } catch (error) {
    console.error('Error serving sitemap.json:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap.json' }, { status: 500 });
  }
}
