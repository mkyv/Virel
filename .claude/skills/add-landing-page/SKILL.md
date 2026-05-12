---
name: add-landing-page
description: Crea una página nueva en la sección de landing (con i18n, locale en URL y SEO). Invocar cuando el usuario pida "agregar página de [X] a la landing", "nueva página pública", "página de marketing", o cualquier ruta nueva que deba indexarse y tener traducciones por URL.
---

# Agregar página nueva a la landing

Las páginas de landing viven bajo `app/[locale]/(landing)/` y heredan automáticamente:
- `<html lang>` correcto
- `NextIntlClientProvider` configurado
- Locale en URL (`/es/...`, `/en/...`)

## Pasos

### 1. Preguntar al usuario
- Slug de la URL (ej. `pricing`, `about`, `features/comparison`).
- ¿Necesita layout propio o usa el de landing por defecto?
- Lista de strings iniciales (títulos, CTA, etc.) o si los va a llenar después.

### 2. Crear la página
Carpeta y archivo:
```
app/[locale]/(landing)/<slug>/page.tsx
```

Template base:
```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSEOTags } from "@/libs/seo";
import { type Locale, routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.<slug>" });
  return getSEOTags({
    title: t("meta.title"),
    description: t("meta.description"),
    canonicalUrlRelative: `/${locale}/<slug>`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing.<slug>");

  return (
    <main className="...">
      <h1>{t("hero.title")}</h1>
      {/* ... */}
    </main>
  );
}
```

### 3. Agregar las traducciones
Editar `messages/es/landing.json` y `messages/en/landing.json` agregando un nodo nuevo:
```json
{
  "<slug>": {
    "meta": {
      "title": "...",
      "description": "..."
    },
    "hero": {
      "title": "..."
    }
  }
}
```

Actualizar **ambos** locales — si solo se conoce el copy en uno, dejar el otro idéntico al primero con un comentario en la respuesta indicando que falta traducir.

### 4. Linking desde otras páginas
Si otras páginas linkean a esta nueva:
```ts
import { Link } from "@/i18n/navigation";
<Link href="/<slug>">...</Link>
```
**No usar** `next/link` para links internos a la landing — perdés el locale.

### 5. (Si tiene sub-rutas) Layout propio
Si la página tiene varias sub-rutas con UI común, crear:
```
app/[locale]/(landing)/<slug>/layout.tsx
```

## Verificación
- Cargar `/es/<slug>` y `/en/<slug>` en el browser.
- Verificar que `lang="es"` o `lang="en"` esté en `<html>`.
- Verificar que el title/description del SEO sale traducido.

## NO hacer
- No crear la página fuera de `[locale]/(landing)/` — perdés el SEO multilenguaje.
- No agregar la ruta a `APP_ROUTES` del middleware (eso es solo para `(app)/`).
- No hardcodear strings — todo va en `messages/`.
