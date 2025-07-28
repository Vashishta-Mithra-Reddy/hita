import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'cnbronoezgwgolbyywqr.supabase.co',
      },
    ],
  },
};

export default nextConfig;
