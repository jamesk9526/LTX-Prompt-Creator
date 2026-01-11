/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Use default .next build dir so the exported static site lands in ./out
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
