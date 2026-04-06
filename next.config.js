/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'blis-corp.com', '*.supabase.co'],
    unoptimized: true,
  },
}

module.exports = nextConfig