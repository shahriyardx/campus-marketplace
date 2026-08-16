import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  serverExternalPackages: ["mongoose", "firebase-admin"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Demo seed data only (scripts/seed-demo.mts). Real uploads go to imgbb.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
}

export default nextConfig
