import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
      minify: false,
      pure: false,
    },
  },
};

export default nextConfig;
