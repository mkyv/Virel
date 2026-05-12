import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

// Resuelve locale y carga mensajes.
//   - Landing (/[locale]/...): locale viene de la URL (requestLocale).
//   - App ((app)/...): sin segmento [locale] en la URL → fallback a cookies:
//       1. APP_LOCALE  → post-login, sincronizada desde profiles.locale.
//       2. NEXT_LOCALE → pre-login, heredada de landing.
//       3. defaultLocale.
//
// La razón por la que leemos cookies acá (y no solo via setRequestLocale en el
// layout) es que en Next.js las pages server-side se evalúan en paralelo con
// los layouts. Si un page llama getTranslations antes de que el layout corra
// setRequestLocale, el locale queda undefined y cae al default. Resolver desde
// request.ts garantiza que cualquier server component encuentre el locale
// correcto independientemente del orden de evaluación.
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale) {
    const cookieStore = await cookies();
    locale =
      cookieStore.get("APP_LOCALE")?.value ??
      cookieStore.get("NEXT_LOCALE")?.value;
  }

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  const [common, landing, app] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/landing.json`),
    import(`../messages/${locale}/app.json`),
  ]);

  return {
    locale,
    messages: {
      common: common.default,
      landing: landing.default,
      app: app.default,
    },
  };
});
