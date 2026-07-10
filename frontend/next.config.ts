import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = (
      process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL
    )?.replace(/\/$/, "");

    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
    }

    return [
      {
        source: "/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
