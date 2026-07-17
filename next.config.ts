import type { NextConfig } from "next";
import { FAVORITES_UI_ENABLED } from "./app/lib/features";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "literatura.grupo-sm.com.mx", pathname: "/wp-content/uploads/**" }],
  },
  async redirects() {
    if (FAVORITES_UI_ENABLED) return [];

    return [{ source: "/lista", destination: "/seccion", permanent: false }];
  },
};

export default nextConfig;
