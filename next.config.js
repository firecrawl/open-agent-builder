/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  // Mark server-only packages for Next.js 16+
  serverExternalPackages: [
    '@langchain/langgraph',
    '@langchain/langgraph-checkpoint-redis',
    'redis',
    '@redis/client',
    '@e2b/code-interpreter',
    'e2b',
  ],
  // Enable standalone output for Docker production builds
  output: 'standalone',
}

module.exports = nextConfig