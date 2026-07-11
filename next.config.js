/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  serverExternalPackages: ['potrace', 'jimp', 'sharp'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zpseniwasxlvjbffymuq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'srjhrhiesienkofisvnv.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'blis-corp.com',
      },
      {
        protocol: 'https',
        hostname: 'campus.blis-corp.com',
      },
    ],
  },
}

module.exports = nextConfig