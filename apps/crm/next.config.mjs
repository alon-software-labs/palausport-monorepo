/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/supabase", "@repo/assets"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      include: /[\\/](packages[\\/]assets|node_modules[\\/]@repo[\\/]assets)[\\/]/,
      type: "asset/resource",
    })
    return config
  },
}

export default nextConfig
