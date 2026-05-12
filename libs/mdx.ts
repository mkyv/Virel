import fs from "node:fs/promises";
import path from "node:path";
import { routing, type Locale } from "@/i18n/routing";

// Carga el body de un archivo MDX bajo content/{locale}/{group}/{slug}.mdx.
// Si el locale no existe, cae al defaultLocale (no romper la página por falta de traducción).
export async function getMdxSource(
  locale: string,
  group: string,
  slug: string
): Promise<string> {
  const effectiveLocale = routing.locales.includes(locale as Locale)
    ? locale
    : routing.defaultLocale;

  const filePath = path.join(
    process.cwd(),
    "content",
    effectiveLocale,
    group,
    `${slug}.mdx`
  );

  return fs.readFile(filePath, "utf8");
}
