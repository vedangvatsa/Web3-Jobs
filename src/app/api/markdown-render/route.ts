import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function ensureFrontmatter(content: string, title: string, description: string, canonical: string): string {
  if (content.trim().startsWith('---')) {
    return content;
  }
  const frontmatter = `---
title: ${title}
description: ${description}
canonical: ${canonical}
last-updated: 2026-08-25
---

`;
  return frontmatter + content;
}

export async function GET(request: NextRequest) {
  try {
    const originalUrl = request.headers.get('x-original-url') || request.url;
    const url = new URL(originalUrl);
    let pathname = url.pathname;

    // Strip .md suffix if present for route lookup
    const cleanPath = pathname.replace(/\.md$/, '') || '/';

    let targetFile = 'llms.txt';
    let title = 'Hashtag Web3 - Web3 Jobs, Developer API & Blockchain Talent Intelligence';
    let description = 'Premier Web3 job board, blockchain career resource platform, and decentralized talent intelligence network.';
    let canonical = `https://hashtagweb3.com${cleanPath === '/' ? '' : cleanPath}`;

    if (cleanPath.startsWith('/jobs')) {
      targetFile = 'jobs/llms.txt';
      title = 'Hashtag Web3 Jobs & Hiring Directory';
      description = 'Search verified active Web3, crypto, DeFi, and blockchain job postings.';
    } else if (cleanPath.startsWith('/developers') || cleanPath.startsWith('/docs')) {
      targetFile = 'developers/llms.txt';
      title = 'Hashtag Web3 Developer API & Agent Integrations';
      description = 'API reference, OpenAPI specifications, MCP servers, and LLM agent instructions.';
    } else if (cleanPath.startsWith('/glossary')) {
      targetFile = 'glossary/llms.txt';
      title = 'Hashtag Web3 Blockchain & Crypto Technical Glossary';
      description = 'Authoritative technical definitions for 200+ blockchain, DeFi, and cryptography terms.';
    } else if (cleanPath.startsWith('/learn')) {
      targetFile = 'learn/llms.txt';
      title = 'Hashtag Web3 Learn & Career Playbooks';
      description = 'Curated Web3 courses and career guides for builders and developers.';
    } else if (cleanPath.startsWith('/auth')) {
      targetFile = 'auth.md';
      title = 'Hashtag Web3 Agent Authentication Guide';
      description = 'WorkOS auth.md compliant authentication guide for autonomous AI agents.';
    }

    const filePath = path.join(process.cwd(), 'public', targetFile);
    let rawContent = '';

    if (fs.existsSync(filePath)) {
      rawContent = fs.readFileSync(filePath, 'utf8');
    } else {
      const mainPath = path.join(process.cwd(), 'public', 'llms.txt');
      rawContent = fs.readFileSync(mainPath, 'utf8');
    }

    const finalMarkdown = ensureFrontmatter(rawContent, title, description, canonical);

    return new NextResponse(finalMarkdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding, User-Agent',
        'X-Robots-Tag': 'index, follow',
        'X-AI-Usage': 'indexing=yes, search=yes, inference=yes, citation=yes',
        'Link': `<${canonical}>; rel="canonical"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return new NextResponse(
      `---\ntitle: Hashtag Web3\ndescription: Web3 Jobs & Developer Platform\ncanonical: https://hashtagweb3.com\nlast-updated: 2026-08-25\n---\n\n# Hashtag Web3\n\nVisit https://hashtagweb3.com or query /llms.txt for platform context.\n`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function HEAD(request: NextRequest) {
  const response = await GET(request);
  return new NextResponse(null, {
    status: response.status,
    headers: response.headers,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
    },
  });
}
