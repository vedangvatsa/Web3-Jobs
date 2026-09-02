/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  /* config options here */
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true,
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
      { source: '/what-is-dao', destination: '/dao', permanent: true },
      { source: '/what-is-staking', destination: '/staking', permanent: true },
      { source: '/what-is-depin', destination: '/glossary/defi', permanent: true },
      { source: '/how-to-be-a-good-community-moderator', destination: '/web3-community-manager-career', permanent: true },
      { source: '/deprecation-policy', destination: '/api-policy', permanent: true },
      { source: '/versioning-policy', destination: '/api-policy', permanent: true },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://vercel.ai https://us.i.posthog.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self' https://hashtagweb3.com https://t.me;
      frame-ancestors 'self' https://chatgpt.com https://claude.ai;
      connect-src 'self' https://hashtagweb3.com https://vitals.vercel-insights.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://us.i.posthog.com https://api.ashbyhq.com https://boards-api.greenhouse.io https://api.lever.co;
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
              '</sitemap.xml>; rel="sitemap"; type="application/xml"',
              '</.well-known/agents.json>; rel="agents"; type="application/json"',
              '</.well-known/api-catalog>; rel="api-catalog"',
              '</openapi.json>; rel="service-desc"',
            ].join(', '),
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
          { key: 'RateLimit-Limit', value: '120' },
          { key: 'RateLimit-Policy', value: '120;w=60' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Expose-Headers', value: 'RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, RateLimit-Policy, Retry-After, API-Version, Sunset, Deprecation, Link' },
          { key: 'Link', value: '<https://hashtagweb3.com/developers>; rel="deprecation"; type="text/html", <https://hashtagweb3.com/developers>; rel="sunset"; type="text/html", </openapi.json>; rel="service-desc"' },
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
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
