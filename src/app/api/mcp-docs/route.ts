import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 86400;

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', '.well-known', 'mcp-docs', 'server-card.json');
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);

    return NextResponse.json(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'MCP documentation server card not found' }, { status: 404 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, MCP-Protocol-Version',
    },
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const method = body.method as string;
  const params = (body.params as Record<string, unknown>) || {};
  const id = body.id ?? null;

  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'get_documentation',
            description: 'Retrieve comprehensive developer API guides, OpenAPI schema details, and agent authentication workflows.',
            inputSchema: {
              type: 'object',
              properties: {
                topic: { type: 'string', description: 'Documentation topic (api, auth, rate_limits, pagination, mcp)' },
              },
            },
          },
          {
            name: 'search_playbooks',
            description: 'Search 700+ Web3 career guides, resume building tips, salary calculations, and interview questions.',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search term for career playbooks and guides' },
              },
              required: ['query'],
            },
          },
        ],
      },
    });
  }

  if (method === 'tools/call') {
    const toolName = params.name as string;
    const toolArgs = (params.arguments as Record<string, string | number>) || {};

    if (toolName === 'get_documentation') {
      const topic = String(toolArgs.topic || 'overview');
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: `Hashtag Web3 Documentation for ${topic}: Visit https://hashtagweb3.com/developers or see OpenAPI spec at https://hashtagweb3.com/openapi.json. For Agent auth, consult https://hashtagweb3.com/auth.md.`,
            },
          ],
        },
      });
    }

    if (toolName === 'search_playbooks') {
      const query = String(toolArgs.query || '');
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: `Web3 Career Resources matching "${query}": Browse https://hashtagweb3.com/blog, https://hashtagweb3.com/salary-calculator, or https://hashtagweb3.com/interview-questions.`,
            },
          ],
        },
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Unknown documentation tool: ${toolName}` },
    });
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  });
}
