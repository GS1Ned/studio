import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // This is a placeholder. Further configuration will be added based on audit findings.
  // For now, we'll keep it minimal.
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. This is temporary for initial setup.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;