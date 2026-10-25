import type { NextConfig } from "next";

const isNetlify = process.env.NETLIFY === 'true';
const isStaticExport = process.env.STATIC_EXPORT === 'true';
const basePath = isNetlify ? '' : (process.env.NODE_ENV === 'production' && isStaticExport ? '/transport' : '');

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  // Static export (GitHub Pages) has no image optimizer. On Vercel, let Next.js
  // resize and compress images (hero.png goes from ~764 KB to ~46 KB).
  images: {
    unoptimized: isStaticExport,
  },
  basePath: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  }
};

export default nextConfig;
