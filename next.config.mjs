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
    ]
  },
}

export default nextConfig
