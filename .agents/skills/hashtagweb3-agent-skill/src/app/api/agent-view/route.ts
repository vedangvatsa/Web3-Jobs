import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      _type: 'agent_mode_view',
      name: 'Hashtag Web3',
      url: 'https://hashtagweb3.com',
      description: 'Hashtag Web3 is the premier Web3 job board, blockchain career resource platform, and decentralized talent intelligence network.',
      documentation: 'https://hashtagweb3.com/developers',
      openapi: 'https://hashtagweb3.com/openapi.json',
      llms_txt: 'https://hashtagweb3.com/llms.txt',
      agent_instructions: 'https://hashtagweb3.com/agent-instructions.md',
      auth_guide: 'https://hashtagweb3.com/auth.md',
      
      authentication: {
        type: 'zero-auth',
        required: false,
        description: 'All read operations on jobs, news, events, and glossary require zero authentication.',
        sandbox_key_generation: 'POST https://hashtagweb3.com/api/sandbox/auth/register',
        auth_doc: 'https://hashtagweb3.com/auth.md',
        oauth_metadata: 'https://hashtagweb3.com/.well-known/oauth-authorization-server',
        protected_resource_metadata: 'https://hashtagweb3.com/.well-known/oauth-protected-resource',
      },

      endpoints: [
        {
          name: 'Search Web3 Jobs',
          method: 'GET',
          path: '/api/v1/jobs',
          url: 'https://hashtagweb3.com/api/v1/jobs',
          description: 'Search and filter live verified Web3, crypto, DeFi, and Solidity jobs.',
          parameters: {
            search: 'Keyword query (e.g. Solidity, Auditor, Rust)',
            tag: 'Ecosystem filter (e.g. Ethereum, Solana, DeFi)',
            company: 'Company name',
            limit: 'Results limit (1-100, default 20)',
            offset: 'Pagination offset',
          },
          example: 'https://hashtagweb3.com/api/v1/jobs?search=Solidity&tag=DeFi&limit=10',
        },
        {
          name: 'Blockchain Technical Glossary',
          method: 'GET',
          path: '/api/v1/glossary',
          url: 'https://hashtagweb3.com/api/v1/glossary',
          description: 'Query 200+ human-curated definitions of cryptographic, DeFi, and blockchain terms.',
          parameters: {
            search: 'Term or concept name (e.g. Zero Knowledge, AMM)',
            category: 'Category filter (e.g. DeFi, Cryptography)',
            limit: 'Results limit (default 50)',
          },
          example: 'https://hashtagweb3.com/api/v1/glossary?search=Zero%20Knowledge',
        },
        {
          name: 'Upcoming Web3 Events & Hackathons',
          method: 'GET',
          path: '/api/v1/events',
          url: 'https://hashtagweb3.com/api/v1/events',
          description: 'List upcoming global crypto conferences, summits, and builder hackathons.',
          parameters: {
            search: 'Search by event name or city',
            type: 'Event type (conference, hackathon, meetup, online)',
            country: 'Country filter',
            limit: 'Results limit (default 50)',
          },
          example: 'https://hashtagweb3.com/api/v1/events?type=hackathon',
        },
        {
          name: 'Crypto & Blockchain News Feed',
          method: 'GET',
          path: '/api/v1/news',
          url: 'https://hashtagweb3.com/api/v1/news',
          description: 'Retrieve real-time curated crypto headlines from top industry publications.',
          parameters: {
            search: 'Filter headlines by keyword',
            limit: 'Results limit (default 20, max 50)',
          },
          example: 'https://hashtagweb3.com/api/v1/news?limit=10',
        },
      ],

      mcp_servers: {
        product: {
          name: 'hashtagweb3-product-mcp',
          transport: 'streamable-http',
          url: 'https://hashtagweb3.com/api/mcp',
          manifest: 'https://hashtagweb3.com/.well-known/mcp/server-card.json',
          tools: ['search_jobs', 'search_glossary', 'get_events', 'get_news'],
        },
        docs: {
          name: 'hashtagweb3-docs-mcp',
          transport: 'streamable-http',
          url: 'https://hashtagweb3.com/api/mcp-docs',
          manifest: 'https://hashtagweb3.com/.well-known/mcp-docs/server-card.json',
          tools: ['get_documentation', 'search_playbooks'],
        },
      },

      sandbox: {
        url: 'https://hashtagweb3.com/api/sandbox',
        mock_endpoints: [
          'GET https://hashtagweb3.com/api/sandbox/jobs',
          'GET https://hashtagweb3.com/api/sandbox/glossary',
          'GET https://hashtagweb3.com/api/sandbox/news',
          'GET https://hashtagweb3.com/api/sandbox/events',
          'POST https://hashtagweb3.com/api/sandbox/echo',
        ],
      },

      rate_limits: {
        public_limit: '120 requests/minute',
        headers: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'API-Version'],
      },

      links: {
        homepage: 'https://hashtagweb3.com',
        github: 'https://github.com/vedangvatsa/Web3-Jobs',
        api_policy: 'https://hashtagweb3.com/api-policy',
        sitemap: 'https://hashtagweb3.com/sitemap.xml',
      },
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=300',
        'X-AI-Usage': 'indexing=yes, search=yes, inference=yes, citation=yes',
      },
    }
  );
}
