import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Note: If you deploy to https://<username>.github.io/b2-transport/
  // you must uncomment the line below:
  // basePath: '/b2-transport',
};

export default nextConfig;
