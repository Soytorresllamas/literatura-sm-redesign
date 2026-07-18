import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { FAVORITES_UI_ENABLED } from "./app/lib/features";

const nextConfig: NextConfig = {
  // Pin the tracing root to this project so a stray lockfile elsewhere on the
  // machine can't make Next infer the wrong workspace root.
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "literatura.grupo-sm.com.mx", pathname: "/wp-content/uploads/**" }],
  },
  async redirects() {
    if (FAVORITES_UI_ENABLED) return [];

    return [{ source: "/lista", destination: "/seccion", permanent: false }];
  },
};

export default nextConfig;
