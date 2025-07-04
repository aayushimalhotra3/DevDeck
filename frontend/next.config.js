/** @type {import('next').NextConfig} */
// Force fresh build to clear Vercel cache
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['pages', 'components', 'lib', 'app'],
  },
  experimental: {
    // Add experimental features here if needed
  },
};

module.exports = nextConfig;
