import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'localhost',
      'randomuser.me',
      'images.unsplash.com',
      'cdnjs.cloudflare.com'
    ],
  }
};

export default nextConfig;
