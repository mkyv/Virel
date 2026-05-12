import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL;
  if (!baseUrl) {
    throw new Error("SITE_URL is required to generate robots.txt.");
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // App section + API are not for indexing.
      disallow: ["/dashboard", "/signin", "/settings", "/api/"],
    },
    sitemap: `${baseUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
