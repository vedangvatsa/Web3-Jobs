import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['firebase-admin', '@neynar/nodejs-sdk'],
  // Keep job/event catalogs inside the standalone server image. Without this,
  // FAH cold starts miss content/*.json, fall back to HTTP shard/catalog fetches,
  // and intermittently 404 job URLs (then ISR caches the 404).
  outputFileTracingIncludes: {
    '/*': [
      './content/jobs-runtime.json',
      './content/homepage-jobs.json',
      './content/events-runtime.json',
      './content/glossary-runtime.json',
      './content/companies-runtime.json',
      './content/company-profiles-runtime.json',
      './content/articles-index.json',
      './content/news-cache.json',
      './content/slug-types.json',
      './content/legacy-slugs-archive.json',
      './content/learn-runtime.json',
      './content/pseo-resources-runtime.json',
      './content/company-logos-index.json',
      './content/latest-articles.json',
      './content/job-shards/**/*',
      './content/job-description-shards/**/*',
      './content/articles/**/*',
      './content/glossary/**/*',
      './public/data/**/*',
      './public/job-shards/**/*',
      './public/job-description-shards/**/*',
      './public/articles-data/**/*',
      './public/logo/**/*',
      './public/events/**/*',
      './public/images/**/*',
      './public/preview/**/*',
      './public/og/**/*',
      './public/favicon.ico',
      './public/icon.png',
    ],
  },
  experimental: {
    // Job description shards are served from /public/job-description-shards (CDN), not bundled in the Worker.
    // Trim compile time + client bundles: per-icon/cherry-picked imports.
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
    ],
  },
  /* config options here */
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(projectRoot, 'src'),
    };
    return config;
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
      // Same jobs RSS as /jobs/feed.xml (legacy short URL)
      { source: '/feed.xml', destination: '/jobs/feed.xml', permanent: true },
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
        source:
          '/glossary/:slug((?!blockchain-fundamentals|cryptocurrencies|defi|nfts|smart-contracts|protocols|governance|security|trading|technical$).*)',
        destination: '/:slug',
        permanent: true,
      },
      { source: '/the-shape-of-ethereum-topological-anomaly-detection', destination: '/shape-of-ethereum', permanent: true },
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
      { source: '/popups/ns', destination: '/ns', permanent: true },
      { source: '/popups/logos', destination: '/logos-society', permanent: true },
      { source: '/popups/logos-society', destination: '/logos-society', permanent: true },
      // Legacy /popups/:slug bookmarks → canonical root popup pages (content only on /[slug]).
      { source: '/popups/:slug', destination: '/:slug', permanent: true },
      // Renamed Sept 2026 news slugs
      { source: '/crypto-tax-bills', destination: '/tax-bills', permanent: true },
      { source: '/nasdaq-tokenized-stocks', destination: '/nasdaq-tokens', permanent: true },
      // Duplicate event slug redirects to canonical premier events
      { source: '/crypto', destination: '/cryptofest', permanent: true },
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
      { source: '/institutional-onchain2', destination: '/institutional-onchain', permanent: true },
      { source: '/vntr-investor-forum', destination: '/vntr', permanent: true },
      { source: '/ethereum-cypherpunk-congress-mumbai', destination: '/ethereum2', permanent: true },
      { source: '/the-un-banked-conference', destination: '/the', permanent: true },
      { source: '/paris-blockchain-week', destination: '/pbw', permanent: true },
      { source: '/paris-blockchain-week-2027', destination: '/pbw', permanent: true },
      { source: '/istanbul-blockchain-week', destination: '/ibw', permanent: true },
      { source: '/istanbul-blockchain-week-2026', destination: '/ibw', permanent: true },
      { source: '/eth-cc', destination: '/ethcc', permanent: true },
      { source: '/eth-dam', destination: '/ethdam', permanent: true },
      { source: '/eth-prague', destination: '/ethprague', permanent: true },
      { source: '/japan-blockchain-week', destination: '/jbw', permanent: true },
      { source: '/japan-blockchain-week-2027', destination: '/jbw', permanent: true },
      { source: '/australian-blockchain-week', destination: '/abw', permanent: true },
      { source: '/eth-warsaw', destination: '/ethwarsaw', permanent: true },
      { source: '/eth-belgrade', destination: '/ethbelgrade', permanent: true },
      { source: '/eth-lisbon', destination: '/ethlisbon', permanent: true },
      { source: '/eth-seoul', destination: '/ethseoul', permanent: true },
      { source: '/eth-milan', destination: '/ethmilan', permanent: true },
      { source: '/eth-bucharest', destination: '/ethbucharest', permanent: true },
      { source: '/eth-kl', destination: '/ethkl', permanent: true },
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
      { source: '/logo-bimi.svg', destination: '/logo/logo-bimi.svg' },
      { source: '/bimi.svg', destination: '/logo/bimi.svg' },
      { source: '/bimi.png', destination: '/logo/bimi.png' },
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
      frame-src 'self' https://www.linkedin.com https://linkedin.com https://www.instagram.com https://platform.twitter.com;
      connect-src 'self' https://hashtagweb3.com https://vitals.vercel-insights.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://us.i.posthog.com https://api.ashbyhq.com https://boards-api.greenhouse.io https://api.lever.co https://*.clarity.ms https://c.clarity.ms;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/.well-known/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Accept' },
        ],
      },
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
            key: 'Link',
            value: '</sitemap.xml>; rel="sitemap"; type="application/xml"',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/jobs',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/news',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/job-shards/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/job-description-shards/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/events',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
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
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'thumb.wikimedia.org',
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
        hostname: 'images.ctfassets.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'hashtagweb3.com',
      },
      {
        protocol: 'https',
        hostname: 'unavatar.io',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
