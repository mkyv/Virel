import { defineRouting } from "next-intl/routing";

// Locale config para la landing.
// - "as-needed": el defaultLocale (en) NO lleva prefix → "/", "/blog". El resto sí → "/es", "/es/blog".
// - localeDetection: true → next-intl decide locale leyendo en este orden:
//     URL > cookie NEXT_LOCALE > Accept-Language header > defaultLocale.
//   Esto persiste la última selección del usuario y, en su primera visita, intenta
//   el idioma del browser.
// La sección app NO depende de esta config a nivel de URL; lee profiles.locale.
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
