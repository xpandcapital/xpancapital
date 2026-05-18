/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
  serverExternalPackages: ['potrace', 'jimp'],
  images: {
    remotePatterns: [
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
      {
        protocol: 'https',
        hostname: 'srjhrhiesienkofisvnv.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig