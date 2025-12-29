/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 타입 체크 활성화
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Docker 빌드를 위한 standalone 출력
  output: 'standalone',
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
    
    // sockjs-client의 Node.js 전용 의존성 처리
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'supports-color': false,
      }
      
      // debug 패키지의 Node.js 전용 부분 제외
      config.resolve.alias = {
        ...config.resolve.alias,
        'supports-color': false,
      }
    }
    
    return config
  },
}

export default nextConfig
