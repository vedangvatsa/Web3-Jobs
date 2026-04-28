
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
 /* config options here */
 trailingSlash: false,
 output: 'standalone',
 experimental: {
  workerThreads: true,
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
   script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://vercel.ai https://us.i.posthog.com;
   style-src 'self' 'unsafe-inline';
   img-src 'self' blob: data: https://images.unsplash.com https://picsum.photos;
   font-src 'self';
   object-src 'none';
   base-uri 'self';
   form-action 'self';
   frame-ancestors 'none';
   connect-src 'self' https://vitals.vercel-insights.com https://us.i.posthog.com;
  `.replace(/\s{2,}/g, ' ').trim();

  return [
   {
    // Apply these headers to all routes in your application.
    source: '/:path*',
    headers: [
     {
      key: 'X-Frame-Options',
      value: 'DENY',
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
    hostname: 'hackathon.superprotocol.com',
   },
   {
     protocol: 'https',
     hostname: 's.w.org',
   },
   {
    protocol: 'https',
    hostname: 'picsum.photos',
   },
  ],
 },
};

export default nextConfig;
