import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "literatura.grupo-sm.com.mx", pathname: "/wp-content/uploads/**" }],
  },
};

export default nextConfig;
