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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, MCP-Protocol-Version',
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

  if (method === 'initialize') {
    const clientVersion = (params as any)?.protocolVersion || '2024-11-05';
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: clientVersion,
        capabilities: {
          tools: { listChanged: false },
          resources: { subscribe: false, listChanged: false },
        },
        serverInfo: {
          name: 'hashtagweb3-mcp-docs-server',
          displayName: 'Hashtag Web3 Documentation Server',
          version: '1.0.0',
        },
        instructions: 'Hashtag Web3 Documentation MCP server. Use get_documentation for API guides and auth docs, search_playbooks for career and technical guides.',
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'MCP-Protocol-Version': clientVersion,
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  if (method === 'notifications/initialized' || method === 'initialized') {
    return new NextResponse(null, { status: 202, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (method === 'ping') {
    return NextResponse.json({ jsonrpc: '2.0', id, result: {} }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

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
            annotations: {
              readOnlyHint: true,
              destructiveHint: false,
              idempotentHint: true,
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
            annotations: {
              readOnlyHint: true,
              destructiveHint: false,
              idempotentHint: true,
            },
          },
        ],
      },
    }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (method === 'resources/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        resources: [
          {
            uri: 'hashtagweb3-docs://api/reference',
            name: 'Hashtag Web3 API Reference',
            description: 'Comprehensive API endpoints and parameters reference.',
            mimeType: 'text/markdown',
          },
          {
            uri: 'hashtagweb3-docs://auth/agent',
            name: 'Hashtag Web3 Agent Authentication Guide',
            description: 'WorkOS auth.md compliant agent registration and token workflow.',
            mimeType: 'text/markdown',
          },
        ],
      },
    }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  if (method === 'resources/read') {
    const uri = String(params.uri || '');
    if (uri === 'hashtagweb3-docs://api/reference') {
      const p = path.join(process.cwd(), 'public', 'developers', 'llms.txt');
      const text = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '# API Reference\n';
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          contents: [{ uri, mimeType: 'text/markdown', text }],
        },
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    if (uri === 'hashtagweb3-docs://auth/agent') {
      const p = path.join(process.cwd(), 'public', 'auth.md');
      const text = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '# Agent Authentication Guide\n';
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          contents: [{ uri, mimeType: 'text/markdown', text }],
        },
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32602, message: `Resource URI not found: ${uri}` },
    }, { headers: { 'Access-Control-Allow-Origin': '*' } });
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
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (toolName === 'search_playbooks') {
      const query = String(toolArgs.query || 'general');
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: `Hashtag Web3 Playbooks matching "${query}": Explore 700+ articles at https://hashtagweb3.com/blog and salary calculators at https://hashtagweb3.com/salary-calculator.`,
            },
          ],
        },
      }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Unknown tool: ${toolName}` },
    }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  }, { headers: { 'Access-Control-Allow-Origin': '*' } });
}
