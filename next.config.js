/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'blis-corp.com', '*.supabase.co'],
    unoptimized: true,
  },
}

module.exports = nextConfig