import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'api', 'openapi.yaml');
    const yamlContent = fs.readFileSync(filePath, 'utf8');

    return new NextResponse(yamlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'Vary': 'Accept-Encoding',
      },
    });
  } catch (error) {
    console.error('Error serving openapi.yaml:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to read OpenAPI specification.',
          hint: 'Please report this issue at https://hashtagweb3.com/contact',
          docUrl: 'https://hashtagweb3.com/developers',
        },
      },
      { status: 500 }
    );
  }
}
