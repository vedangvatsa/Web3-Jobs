import { NextResponse } from 'next/server';

export async function GET() {
  const markdown = `# 404 Not Found: Hashtag Web3

> This resource does not exist on hashtagweb3.com.

## Where to look next

- [Homepage](https://hashtagweb3.com/)
- [Web3 Jobs](https://hashtagweb3.com/jobs)
- [Blockchain Glossary](https://hashtagweb3.com/glossary)
- [Crypto Events](https://hashtagweb3.com/events)
- [Developer API](https://hashtagweb3.com/developers)
- [Sitemap](https://hashtagweb3.com/sitemap.xml)
- [LLMs Context](https://hashtagweb3.com/llms.txt)
- [OpenAPI Spec](https://hashtagweb3.com/openapi.json)
- [MCP Server](https://hashtagweb3.com/api/mcp)
`;

  return new NextResponse(markdown, {
    status: 404,
    headers: {
      'Content-Type': 'text/markdown; charset=UTF-8',
      'Vary': 'Accept, Accept-Encoding',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
