/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  /* config options here */
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.hashtagweb3.com',
          },
        ],
        destination: 'https://hashtagweb3.com/:path*',
        permanent: true,
      },
      {
        source: '/blog/:slug((?!llms\\.txt$).*)',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/companies/:slug((?!llms\\.txt$).*)',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/jobs/:slug((?!llms\\.txt$).*)',
        destination: '/:slug',
        permanent: true,
      },
      {
        source:
          '/glossary/:slug((?!blockchain-fundamentals|cryptocurrencies|defi|nfts|smart-contracts|protocols|governance|security|trading|technical$).*)',
        destination: '/:slug',
        permanent: true,
      },
      { source: '/arbitrum-offchain-labs', destination: '/offchain-labs', permanent: true },
      { source: '/arbitrum', destination: '/offchain-labs', permanent: true },
      { source: '/certik-detailed', destination: '/certik', permanent: true },
      { source: '/aztec-labs-privacy-l2', destination: '/aztec', permanent: true },
      { source: '/aztec-labs', destination: '/aztec', permanent: true },
      { source: '/aztec-network', destination: '/aztec', permanent: true },
      // Tools and guides alias redirects
      { source: '/tools/interview-questions', destination: '/interview-questions', permanent: true },
      { source: '/tools/salary-calculator', destination: '/salary-calculator', permanent: true },
      { source: '/tools/resume-builder', destination: '/resume-builder', permanent: true },
      { source: '/tools', destination: '/', permanent: true },
      { source: '/guides/web3-salaries', destination: '/salary-calculator', permanent: true },
      { source: '/guides', destination: '/', permanent: true },
      // what-is-* redirects for glossary terms
      { source: '/what-is-bitcoin', destination: '/bitcoin', permanent: true },
      { source: '/what-is-ethereum', destination: '/ethereum', permanent: true },
      { source: '/what-is-solana', destination: '/jobs', permanent: true },
      { source: '/what-is-defi', destination: '/defi', permanent: true },
      { source: '/what-is-nft', destination: '/nft', permanent: true },
      { source: '/what-is-web3', destination: '/web3', permanent: true },
      { source: '/what-is-blockchain', destination: '/blockchain', permanent: true },
      { source: '/where-b2b-stablecoin-money-actually-flows', destination: '/b2b-stablecoin-flows', permanent: true },
      { source: '/what-is-dao', destination: '/dao', permanent: true },
      { source: '/what-is-staking', destination: '/staking', permanent: true },
      { source: '/what-is-a-token', destination: '/token', permanent: true },
      { source: '/how-to-build-a-web3-resume', destination: '/how-to-build-a-web3-resume-that-stands-out', permanent: true },
      { source: '/gas-optimization-guide-for-solidity-developers', destination: '/gas-optimization-techniques-for-solidity-developers', permanent: true },
      { source: '/how-to-be-a-good-community-moderator', destination: '/web3-community-manager-career', permanent: true },
      { source: '/deprecation-policy', destination: '/api-policy', permanent: true },
      { source: '/versioning-policy', destination: '/api-policy', permanent: true },
      // Duplicate event slug redirects to canonical premier events
      { source: '/stablecon-26', destination: '/stablecon', permanent: true },
      { source: '/stablecon-26-washington-dc', destination: '/stablecon', permanent: true },
      { source: '/buildathon-cochabamba', destination: '/buildathon', permanent: true },
      { source: '/hackindia-spark-12-jaipur', destination: '/hackindia', permanent: true },
      { source: '/ethtokyo-week', destination: '/ethtokyo', permanent: true },
      { source: '/agentic', destination: '/apo', permanent: true },
      { source: '/agentic-payments-onchain', destination: '/apo', permanent: true },
      { source: '/connect-by-cointelegraph-seoul-edition', destination: '/connect', permanent: true },
      { source: '/korea', destination: '/kbw', permanent: true },
      { source: '/korea-blockchain-week', destination: '/kbw', permanent: true },
      { source: '/korea-blockchain-week-kbw2026', destination: '/kbw', permanent: true },
      { source: '/korea-blockchain-week-networking-rooftop', destination: '/kbw', permanent: true },
      { source: '/institutional-onchain-rwas-stablecoins', destination: '/institutional', permanent: true },
      { source: '/rayls-in-seoul', destination: '/rayls', permanent: true },
      { source: '/p-s-lisbon', destination: '/ps', permanent: true },
      { source: '/vntr-investor-forum', destination: '/vntr', permanent: true },
      { source: '/ethereum-cypherpunk-congress-mumbai', destination: '/ethereum2', permanent: true },
      { source: '/the-un-banked-conference', destination: '/the', permanent: true },
      { source: '/terms-of-use', destination: '/terms-of-use.md', permanent: false },
      { source: '/terms', destination: '/terms-of-use.md', permanent: false },
      { source: '/tos', destination: '/terms-of-use.md', permanent: false },
    ]
  },
  async rewrites() {
    return [
      { source: '/logo/companies/Chainalysis.webp', destination: '/logo/companies/chainalysis.webp' },
      { source: '/logo/companies/JP_Morgan.webp', destination: '/logo/companies/jp_morgan.webp' },
      { source: '/logo/companies/KPMG.webp', destination: '/logo/companies/kpmg.webp' },
      { source: '/logo/hashtagweb3.png', destination: '/logo/HashtagWeb3.png' },
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://vercel.ai https://us.i.posthog.com https://www.clarity.ms https://c.clarity.ms;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self' https://hashtagweb3.com https://t.me;
      frame-ancestors 'self' https://chatgpt.com https://claude.ai;
      connect-src 'self' https://hashtagweb3.com https://vitals.vercel-insights.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://us.i.posthog.com https://api.ashbyhq.com https://boards-api.greenhouse.io https://api.lever.co https://*.clarity.ms https://c.clarity.ms;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Vary',
            value: 'Accept, Accept-Encoding',
          },
          {
            key: 'X-AI-Usage',
            value: 'indexing=yes, search=yes, inference=yes, citation=yes',
          },
          {
            key: 'Link',
            value: [
              '</llms.txt>; rel="ai-context"; type="text/plain"',
              '<https://hashtagweb3.com/llms.txt>; rel="ai-context"',
              '</sitemap.xml>; rel="sitemap"; type="application/xml"',
              '</.well-known/sitemap.json>; rel="sitemap"; type="application/json"',
              '</.well-known/agents.json>; rel="agents"; type="application/json"',
              '</agents.txt>; rel="agent-permissions"; type="text/plain"',
              '</.well-known/api-catalog>; rel="api-catalog"',
              '</.well-known/tdmrep.json>; rel="tdmrep"; type="application/json"',
              '</openapi.json>; rel="service-desc"',
              '</404.md>; rel="404-recovery"; type="text/markdown"',
              '</terms-of-use.md>; rel="terms-of-service"; type="text/markdown"',
            ].join(', '),
          },
          {
            key: 'RateLimit-Limit',
            value: '120',
          },
          {
            key: 'RateLimit-Remaining',
            value: '119',
          },
          {
            key: 'RateLimit-Reset',
            value: '60',
          },
          {
            key: 'RateLimit-Policy',
            value: '120;w=60',
          },
          {
            key: 'RateLimit',
            value: 'limit=120, remaining=119, reset=60',
          },
          {
            key: 'X-RateLimit-Limit',
            value: '120',
          },
          {
            key: 'X-RateLimit-Remaining',
            value: '119',
          },
          {
            key: 'X-RateLimit-Reset',
            value: '60',
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'RateLimit, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, RateLimit-Policy, Retry-After, API-Version, Sunset, Deprecation, Link, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
      {
        source: '/(.*)\\.(jpg|jpeg|png|gif|svg|webp|avif)$',
        headers: [
          {
            key: 'Cache-Control',
            // Never mark image responses (incl. transient 404s) as immutable;
            // revalidate daily and serve stale up to 30 days while revalidating.
            value: 'public, max-age=86400, stale-while-revalidate=2592000, must-revalidate',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'API-Version', value: '1.0.0' },
          { key: 'Deprecation', value: '@1767225600' },
          { key: 'Sunset', value: 'Wed, 31 Dec 2026 23:59:59 GMT' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Link', value: '<https://hashtagweb3.com/developers>; rel="deprecation"; type="text/html", <https://hashtagweb3.com/developers>; rel="sunset"; type="text/html", </openapi.json>; rel="service-desc"' },
        ],
      },
      {
        source: '/mcp',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'self'; connect-src 'self' https://hashtagweb3.com; frame-ancestors 'self' https://chatgpt.com https://claude.ai; form-action 'self' https://hashtagweb3.com; img-src 'self' https://hashtagweb3.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" },
          { key: 'Link', value: '<https://hashtagweb3.com/api/mcp-docs>; rel="mcp-docs-server"' },
        ],
      },
      {
        source: '/api/mcp',
        headers: [
          { key: 'Content-Security-Policy', value: "default-src 'self'; connect-src 'self' https://hashtagweb3.com; frame-ancestors 'self' https://chatgpt.com https://claude.ai; form-action 'self' https://hashtagweb3.com; img-src 'self' https://hashtagweb3.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" },
          { key: 'Link', value: '<https://hashtagweb3.com/api/mcp-docs>; rel="mcp-docs-server"' },
        ],
      },
      // Serve .md files with correct Content-Type for content negotiation (agents/bots)
      {
        source: '/:path*.md',
        headers: [
          { key: 'Content-Type', value: 'text/markdown; charset=UTF-8' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      // Ensure agent-view endpoint always advertises content negotiation support
      {
        source: '/api/agent-view',
        headers: [
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      // Machine-readable JSON sitemap for autonomous agents
      {
        source: '/.well-known/sitemap.json',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=UTF-8' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
          { key: 'X-AI-Usage', value: 'indexing=yes, search=yes, inference=yes, citation=yes' },
        ],
      },
      {
        source: '/sitemap.json',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=UTF-8' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
          { key: 'X-AI-Usage', value: 'indexing=yes, search=yes, inference=yes, citation=yes' },
        ],
      },
      // Agent permissions (agents.txt) per https://agents-txt.com and https://veda.ng/aistandards
      {
        source: '/agents.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=UTF-8' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
          { key: 'X-AI-Usage', value: 'indexing=yes, search=yes, inference=yes, citation=yes' },
        ],
      },
      {
        source: '/.well-known/agents.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=UTF-8' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
          { key: 'X-AI-Usage', value: 'indexing=yes, search=yes, inference=yes, citation=yes' },
        ],
      },
      // W3C TDM Reservation Protocol (tdmrep.json) per https://www.w3.org/community/reports/tdmrep/CG-FINAL-tdmrep-20240510/
      {
        source: '/.well-known/tdmrep.json',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=UTF-8' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800' },
          { key: 'X-AI-Usage', value: 'indexing=yes, search=yes, inference=yes, citation=yes' },
        ],
      },
      {
        source: '/tdmrep.json',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=UTF-8' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800' },
          { key: 'X-AI-Usage', value: 'indexing=yes, search=yes, inference=yes, citation=yes' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 's.w.org',
      },
      {
        protocol: 'https',
        hostname: 'hashtagweb3.com',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
