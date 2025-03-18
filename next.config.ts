import type { NextConfig } from "next";
import path from "node:path"; 

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true, 
  swcMinify: true,

  images: {
    domains: ["res.cloudinary.com"], 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
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
      "@": path.resolve(__dirname, "src"), // ✅ Fix for Vercel builds
    };
    return config;
  },
};

export default nextConfig;
