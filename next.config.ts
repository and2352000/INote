import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx'],
  async rewrites() {
    return [
      {
        source: '/terminal/:path*',
        destination: 'http://localhost:7681/:path*',
      },
      {
        source: '/terminal',
        destination: 'http://localhost:7681/',
      },
    ]
  },
}

export default nextConfig
