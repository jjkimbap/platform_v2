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
