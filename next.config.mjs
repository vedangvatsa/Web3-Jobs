/** @type {import('next').NextConfig} */
const nextConfig = {
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
        source: '/blog/:slug',
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
    ]
  },
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://vercel.ai https://us.i.posthog.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos https://i.picsum.photos https://s.w.org https://images.lumacdn.com https://og.luma.com https://secure.meetupstatic.com https://cdn.prod.website-files.com https://storage.googleapis.com https://token2049.nyc3.cdn.digitaloceanspaces.com https://wojgrioccmbywgtruwfl.supabase.co https://aibc.world https://api.rareevo.io https://asia.b.tc https://berachain-422fce37.mintlify.app https://blockchain-life.com https://dutchblockchainweek.com https://ethconf.com https://incryptedconference.com https://s26ber.web3privacy.info https://supervietnam.com https://ukrainianblockchainweek.com https://unchainedsummit.com https://us.money2020.com https://webx-asia.com https://www.blockcon.co;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      connect-src 'self' https://vitals.vercel-insights.com https://www.googletagmanager.com https://us.i.posthog.com;
      upgrade-insecure-requests;
      block-all-mixed-content;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Agentic Web — Link headers for discoverability
          {
            key: 'Link',
            value: [
              '</llms.txt>; rel="ai-context"; type="text/plain"',
              '</sitemap.xml>; rel="sitemap"; type="application/xml"',
              '</.well-known/agents.json>; rel="agents"; type="application/json"',
              '</.well-known/api-catalog>; rel="api-catalog"',
            ].join(', '),
          },
           {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          }
        ],
      },
      {
        source: '/(.*)\\.(jpg|jpeg|png|gif|svg)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
