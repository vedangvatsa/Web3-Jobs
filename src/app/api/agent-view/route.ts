import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      _type: 'platform_overview',
      _schema: 'https://hashtagweb3.com/openapi.json',
      platform: {
        name: 'Hashtagweb3',
        url: 'https://hashtagweb3.com',
        description: 'The leading platform for Web3 professionals: jobs, news, events, and educational resources.',
        community_size: '60000+',
        founded: '2021',
        focus: 'Web3, blockchain, DeFi, NFTs, crypto, smart contracts',
      },
      capabilities: [
        {
          name: 'Web3 Jobs',
          description: 'Browse and search 10,000+ Web3 job listings',
          url: 'https://hashtagweb3.com/jobs',
          api: 'GET https://hashtagweb3.com/api/jobs',
        },
        {
          name: 'Web3 News',
          description: 'Daily curated Web3 and blockchain industry news',
          url: 'https://hashtagweb3.com/news',
          api: 'GET https://hashtagweb3.com/api/news',
        },
        {
          name: 'Web3 Events',
          description: 'Upcoming conferences, hackathons, and meetups',
          url: 'https://hashtagweb3.com/events',
          api: 'GET https://hashtagweb3.com/api/events',
        },
        {
          name: 'Web3 Glossary',
          description: '500+ term glossary of Web3, blockchain, and crypto terminology',
          url: 'https://hashtagweb3.com/learn',
          api: 'GET https://hashtagweb3.com/api/glossary',
        },
      ],
      agent_resources: {
        openapi: 'https://hashtagweb3.com/openapi.json',
        llms_txt: 'https://hashtagweb3.com/llms.txt',
        auth_guide: 'https://hashtagweb3.com/auth.md',
        nlweb_ask: 'https://hashtagweb3.com/ask',
        developer_portal: 'https://hashtagweb3.com/developers',
        agent_card: 'https://hashtagweb3.com/.well-known/agent-card.json',
        api_catalog: 'https://hashtagweb3.com/.well-known/api-catalog',
        sitemap: 'https://hashtagweb3.com/sitemap.xml',
      },
      auth: {
        required: false,
        public_endpoints: ['/api/jobs', '/api/news', '/api/events', '/api/glossary'],
        auth_guide: 'https://hashtagweb3.com/auth.md',
        register_uri: 'https://hashtagweb3.com/api/auth/register',
        claim_uri: 'https://hashtagweb3.com/api/auth/claim',
      },
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=300',
      },
    }
  );
}
