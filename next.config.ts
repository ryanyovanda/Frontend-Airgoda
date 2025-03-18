import type { NextConfig } from "next";
import path from "node:path"; 

const nextConfig: NextConfig = {
  reactStrictMode: true, 

  images: {
    domains: ["res.cloudinary.com"], 
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL, 
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(process.cwd(), "src"), // ✅ Fix for Vercel builds
    };
    return config;
  },
};

export default nextConfig;
