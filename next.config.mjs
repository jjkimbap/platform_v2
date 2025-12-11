/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 개발 서버 최적화
  experimental: {
    // 메모리 사용량 감소
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  // Cross origin 요청 허용
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
  // 웹팩 최적화
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 개발 모드에서 메모리 사용량 감소
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
    }
    return config
  },
  async rewrites() {
    return [
      {
        source: '/api/user/:path*',
        destination: 'http://52.77.138.41:8051/api/user/:path*',
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://52.77.138.41:8025/api/analytics/:path*',
      },
      {
        source: '/api/status/:path*',
        destination: 'http://52.77.138.41:8025/api/status/:path*',
      },
      {
        source: '/api/report/:path*',
        destination: 'http://52.77.138.41:8025/api/report/:path*',
      },
      {
        source: '/api/ranking/:path*',
        destination: 'http://52.77.138.41:8025/api/ranking/:path*',
      },
    ]
  },
}

export default nextConfig
