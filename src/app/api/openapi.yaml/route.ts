import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 86400;

export async function GET() {
  try {
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'api', 'openapi.yaml'),
      path.join(process.cwd(), 'public', 'openapi.yaml'),
      path.join(__dirname, '..', '..', '..', '..', 'public', 'api', 'openapi.yaml'),
      path.join(__dirname, '..', '..', '..', '..', 'public', 'openapi.yaml'),
    ];

    let yamlContent = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        yamlContent = fs.readFileSync(p, 'utf8');
        break;
      }
    }

    if (!yamlContent) {
      // Fallback read from public openapi.json converted/served
      const jsonPath = path.join(process.cwd(), 'public', 'openapi.json');
      if (fs.existsSync(jsonPath)) {
        yamlContent = fs.readFileSync(jsonPath, 'utf8');
      }
    }

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
