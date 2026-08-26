import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 86400;

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', '.well-known', 'mcp', 'server-card.json');
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
    return NextResponse.json({ error: 'MCP server card not found' }, { status: 404 });
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

// MCP streamable-http: handles tool calls from MCP clients
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

  // tools/list — return available tools with _meta.ui.resourceUri for MCP Apps
  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'search_jobs',
            description: 'Search verified Web3 and crypto jobs by keyword, company, or technology tag.',
            inputSchema: {
              type: 'object',
              properties: {
                search: { type: 'string', description: 'Keyword (e.g. Solidity, Auditor, Rust)' },
                limit: { type: 'integer', default: 20, maximum: 100 },
              },
            },
            _meta: {
              ui: {
                resourceUri: 'ui://hashtagweb3.com/jobs'
              }
            }
          },
          {
            name: 'search_glossary',
            description: 'Query 200+ blockchain and Web3 glossary definitions.',
            inputSchema: {
              type: 'object',
              properties: {
                search: { type: 'string', description: 'Term to look up (e.g. Zero Knowledge, AMM)' },
              },
              required: ['search'],
            },
            _meta: {
              ui: {
                resourceUri: 'ui://hashtagweb3.com/glossary'
              }
            }
          },
          {
            name: 'get_news',
            description: 'Retrieve the latest Web3 and crypto headlines.',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { type: 'integer', default: 10, maximum: 50 },
              },
            },
            _meta: {
              ui: {
                resourceUri: 'ui://hashtagweb3.com/news'
              }
            }
          },
          {
            name: 'get_events',
            description: 'List upcoming Web3 conferences, hackathons, and summits.',
            inputSchema: {
              type: 'object',
              properties: {
                search: { type: 'string' },
                type: { type: 'string', enum: ['conference', 'hackathon', 'meetup', 'online'] },
              },
            },
            _meta: {
              ui: {
                resourceUri: 'ui://hashtagweb3.com/events'
              }
            }
          },
        ],
      },
    });
  }

  // resources/list — return resources including ui:// resources for MCP Apps
  if (method === 'resources/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        resources: [
          {
            uri: 'ui://hashtagweb3.com/jobs',
            name: 'Web3 Jobs Directory UI',
            description: 'Interactive UI showing the latest Web3 and blockchain job listings.',
            mimeType: 'text/html'
          },
          {
            uri: 'ui://hashtagweb3.com/glossary',
            name: 'Web3 Glossary UI',
            description: 'Interactive UI directory for Web3 concepts, terms, and definitions.',
            mimeType: 'text/html'
          },
          {
            uri: 'ui://hashtagweb3.com/news',
            name: 'Crypto News UI',
            description: 'Interactive UI feed for the latest crypto news headlines.',
            mimeType: 'text/html'
          },
          {
            uri: 'ui://hashtagweb3.com/events',
            name: 'Web3 Events Calendar UI',
            description: 'Interactive calendar listing upcoming blockchain and crypto conferences.',
            mimeType: 'text/html'
          },
          {
            uri: 'hashtagweb3://jobs/latest',
            name: 'Latest Web3 Jobs (JSON)',
            mimeType: 'application/json'
          },
          {
            uri: 'hashtagweb3://glossary/terms',
            name: 'Web3 Technical Glossary (JSON)',
            mimeType: 'application/json'
          },
          {
            uri: 'hashtagweb3://docs/overview',
            name: 'Hashtag Web3 Documentation & Guides (Markdown)',
            mimeType: 'text/markdown'
          }
        ]
      }
    });
  }

  // tools/call — proxy to REST API
  if (method === 'tools/call') {
    const toolName = params.name as string;
    const toolArgs = (params.arguments as Record<string, string | number>) || {};
    const baseUrl = 'https://hashtagweb3.com';

    let apiUrl = '';
    if (toolName === 'search_jobs') {
      const q = new URLSearchParams();
      if (toolArgs.search) q.set('search', String(toolArgs.search));
      if (toolArgs.limit) q.set('limit', String(toolArgs.limit));
      apiUrl = `${baseUrl}/api/jobs?${q}`;
    } else if (toolName === 'search_glossary') {
      const q = new URLSearchParams();
      if (toolArgs.search) q.set('search', String(toolArgs.search));
      apiUrl = `${baseUrl}/api/glossary?${q}`;
    } else if (toolName === 'get_news') {
      const q = new URLSearchParams();
      if (toolArgs.limit) q.set('limit', String(toolArgs.limit));
      apiUrl = `${baseUrl}/api/news?${q}`;
    } else if (toolName === 'get_events') {
      const q = new URLSearchParams();
      if (toolArgs.search) q.set('search', String(toolArgs.search));
      if (toolArgs.type) q.set('type', String(toolArgs.type));
      apiUrl = `${baseUrl}/api/events?${q}`;
    } else {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Unknown tool: ${toolName}` },
      });
    }

    try {
      const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        },
      });
    } catch {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: 'Upstream API error' },
      });
    }
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  });
}
