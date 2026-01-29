
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
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
    ]
  },
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' https://www.googletagmanager.com https://vercel.ai;
      style-src 'self' 'nonce-{nonce}';
      img-src 'self' blob: data: https://images.unsplash.com https://picsum.photos https://hackathon.superprotocol.com https://s.w.org;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      connect-src 'self' https://vitals.vercel-insights.com https://www.googletagmanager.com;
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
           {
            key: 'Content-Security-Policy',
            value: cspHeader,
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
        hostname: 'hackathon.superprotocol.com',
      },
      {
          protocol: 'https',
          hostname: 's.w.org',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
      }
    ],
  },
};

export default nextConfig;
