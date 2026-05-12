import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";

function getBaseUrl(): string {
  const url = process.env.SITE_URL;
  if (!url) {
    throw new Error("SITE_URL is required to generate the sitemap.");
  }
  return url.replace(/\/$/, "");
}

function localized(baseUrl: string, locale: Locale, path: string): string {
  const cleanPath = path === "/" ? "" : path;
  return locale === routing.defaultLocale
    ? `${baseUrl}${cleanPath || "/"}`
    : `${baseUrl}/${locale}${cleanPath}`;
}

function withAlternates(baseUrl: string, path: string) {
  return {
    languages: Object.fromEntries(
      routing.locales.map((locale) => [locale, localized(baseUrl, locale, path)])
    ),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  // Static landing routes — one entry per (path × locale), with hreflang alternates.
  // Cuando se active el blog (ver SETUP.md), agregar acá las URLs:
  //   - /blog (index)
  //   - /blog/[articleId] (iterar `articles` de content.tsx)
  //   - /blog/category/[categoryId] (iterar `categories`)
  //   - /blog/author/[authorId] (iterar `authors`)
  const landingPaths = ["/", "/privacy-policy", "/tos"];

  return landingPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: localized(baseUrl, locale, path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      alternates: withAlternates(baseUrl, path),
    }))
  );
}
