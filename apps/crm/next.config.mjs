/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/supabase"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
