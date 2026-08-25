import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const originalUrl = request.headers.get('x-original-url') || request.url;
    const url = new URL(originalUrl);
    const pathname = url.pathname;

    let targetFile = 'llms.txt';

    if (pathname.startsWith('/jobs')) {
      targetFile = 'jobs/llms.txt';
    } else if (pathname.startsWith('/developers')) {
      targetFile = 'developers/llms.txt';
    } else if (pathname.startsWith('/glossary')) {
      targetFile = 'glossary/llms.txt';
    } else if (pathname.startsWith('/learn')) {
      targetFile = 'learn/llms.txt';
    }

    const filePath = path.join(process.cwd(), 'public', targetFile);
    
    if (!fs.existsSync(filePath)) {
      const mainPath = path.join(process.cwd(), 'public', 'llms.txt');
      const content = fs.readFileSync(mainPath, 'utf8');
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding',
          'X-Robots-Tag': 'index, follow',
          'X-AI-Usage': 'indexing=yes, search=yes, inference=yes, citation=yes',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding',
        'X-Robots-Tag': 'index, follow',
        'X-AI-Usage': 'indexing=yes, search=yes, inference=yes, citation=yes',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return NextResponse.json(
      { error: 'Failed to negotiate markdown content' },
      { status: 500 }
    );
  }
}
