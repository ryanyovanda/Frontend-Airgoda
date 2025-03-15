import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true, // ✅ Enables React Strict Mode
  swcMinify: true, // ✅ Enables SWC minification for better performance
  

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true, // ✅ Disables ESLint during builds
  },

  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL, // ✅ Allows env variable in client
  },
};

export default nextConfig;
