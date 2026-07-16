import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://literatura-sm-redesign.vercel.app/sitemap.xml" };
}
