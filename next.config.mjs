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
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://52.77.138.41:8025'
    return [
      {
        source: '/api/user/:path*',
        destination: 'http://52.77.138.41:8051/api/user/:path*',
      },
      // 모든 API 경로를 백엔드로 프록시 (클라이언트는 /api-proxy/* 경로로 요청)
      {
        source: '/api-proxy/analytics/:path*',
        destination: `${API_BASE_URL}/api/analytics/:path*`,
      },
      {
        source: '/api-proxy/report/:path*',
        destination: `${API_BASE_URL}/api/report/:path*`,
      },
      {
        source: '/api-proxy/ranking/:path*',
        destination: `${API_BASE_URL}/api/ranking/:path*`,
      },
      {
        source: '/api-proxy/status/:path*',
        destination: `${API_BASE_URL}/api/status/:path*`,
      },
    ]
  },
}

export default nextConfig
