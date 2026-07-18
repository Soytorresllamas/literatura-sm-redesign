import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { FAVORITES_UI_ENABLED } from "./app/lib/features";

const nextConfig: NextConfig = {
  // Pin the tracing root to this project so a stray lockfile elsewhere on the
  // machine can't make Next infer the wrong workspace root.
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  // Las tarjetas OG leen las TTF con fs en runtime; el trazado no las ve solo.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./app/og/fonts/*.ttf"],
    "/og/libro/[slug]": ["./app/og/fonts/*.ttf"],
    "/booktrailers/opengraph-image": ["./app/og/fonts/*.ttf"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "literatura.grupo-sm.com.mx", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
  async redirects() {
    const redirects = [
      // La ficha vivía en /libro?slug=X; las URLs compartidas siguen llegando.
      {
        source: "/libro",
        has: [{ type: "query" as const, key: "slug", value: "(?<slug>.+)" }],
        destination: "/libro/:slug",
        permanent: true,
      },
      { source: "/libro", destination: "/seccion", permanent: false },
    ];
    if (!FAVORITES_UI_ENABLED) {
      redirects.push({ source: "/lista", destination: "/seccion", permanent: false });
    }
    return redirects;
  },
};

export default nextConfig;
