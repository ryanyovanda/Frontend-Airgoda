import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = nextConfig;


export default nextConfig;
