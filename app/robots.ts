import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // The journal is its own app under /blog with its own sitemap; robots.txt is only read at the root.
    sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/blog/sitemap.xml`],
  };
}
