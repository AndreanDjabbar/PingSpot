import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: 'randomuser.me', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdnjs.cloudflare.com', pathname: '/**' },
    ],
    localPatterns: [
      {
        pathname: '/api/image-proxy',
        search: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://pingspot-server.thankfulwater-3d2d743b.southeastasia.azurecontainerapps.io/pingspot/api/:path*',
      },
    ];
  },
};

export default nextConfig;