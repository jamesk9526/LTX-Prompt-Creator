/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Ensure trailing slash for proper static export routing
  trailingSlash: true,
  // Use default .next build dir so the exported static site lands in ./out
  images: {
    unoptimized: true,
  },
  // Skip ESLint during production builds to avoid warning-only failures
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
