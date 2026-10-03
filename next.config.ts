import type { NextConfig } from "next";

const isNetlify = process.env.NETLIFY === 'true';
const isStaticExport = process.env.STATIC_EXPORT === 'true';
const basePath = isNetlify ? '' : (process.env.NODE_ENV === 'production' && isStaticExport ? '/transport' : '');

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  basePath: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  }
};

export default nextConfig;
