import type { NextConfig } from "next";

const isNetlify = process.env.NETLIFY === 'true';
const basePath = isNetlify ? '' : '/transport';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  }
};

export default nextConfig;
