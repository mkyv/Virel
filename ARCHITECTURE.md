# Virel — Arquitectura del Boilerplate

Fork de [ShipFast](https://shipfa.st) adaptado con las decisiones de stack que se documentan acá. Es la referencia canónica para futuros proyectos que partan de esta base.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 + DaisyUI v5 |
| i18n | `next-intl` v3 |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Base de datos | Supabase (Postgres) |
| Storage | Cloudflare R2 |
| Pagos | LemonSqueezy |
| Email | Resend |
| Soporte | Crisp (opcional) |
| AI | OpenAI via `libs/gpt.ts` (opcional) |
| SEO | `next-sitemap` + schema tags propios |

---

## Internacionalización (i18n)

Todo proyecto que parta de este boilerplate es **multilenguaje desde el día 1**. Locales soportados por defecto: `es` (default) y `en`.

### Enfoque híbrido

| Sección | URL | Cómo se determina el idioma |
|---|---|---|
| Landing (`/`, `/blog`, `/pricing`, `/tos`, `/privacy-policy`) | `/es/...` y `/en/...` con locale en la URL | Del segmento `[locale]` en la URL. SEO: Google indexa cada idioma por separado. |
| App (`/dashboard`, `/signin`, `/settings`) | URL limpia, sin prefijo de idioma | De la cookie `NEXT_LOCALE` (que next-intl setea cuando el usuario visita la landing). En el futuro: `profiles.locale` en Supabase. |

> En el filesystem, **landing y app están en carpetas separadas**: `app/[locale]/(landing)/` y `app/(app)/`. La landing usa el routing dinámico de next-intl; la app es URL-agnóstica respecto al idioma.

### Configuración

- `i18n/routing.ts` — define locales (`es`, `en`), default (`es`) y prefijo de URL (`always`).
- `i18n/request.ts` — server-side: carga los mensajes del locale activo.
- `i18n/navigation.ts` — wrappers de `<Link>`, `useRouter`, `redirect`, etc. **Usar siempre estos en código nuevo** en lugar de `next/link` o `next/navigation` para que las URLs incluyan el locale automáticamente.

### Mensajes

```
messages/
  es/
    common.json    # strings compartidos (botones, footer, errores)
    landing.json   # strings de la landing
    app.json       # strings de la app
  en/
    common.json
    landing.json
    app.json
```

En el server, los mensajes se exponen namespaced:
```ts
const t = useTranslations("landing"); // o "common", "app"
t("hero.title")
```

---

## Estructura de carpetas

```
Virel/
├── app/
│   ├── [locale]/                      ← LANDING — carpeta dinámica (literal con corchetes)
│   │   ├── layout.tsx                 ← <html lang={locale}>, NextIntlClientProvider (locale URL)
│   │   └── (landing)/                 ← route group, no aparece en URL
│   │       ├── layout.tsx
│   │       ├── page.tsx               → /es | /en
│   │       ├── blog/
│   │       │   ├── [articleId]/
│   │       │   ├── author/[authorId]/
│   │       │   ├── category/[categoryId]/
│   │       │   ├── _assets/
│   │       │   ├── layout.tsx
│   │       │   └── page.tsx
│   │       ├── privacy-policy/
│   │       └── tos/
│   ├── (app)/                         ← APP — fuera de [locale], URL sin prefijo
│   │   ├── layout.tsx                 ← <html lang={cookieLocale}>, NextIntlClientProvider (cookie)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx             ← auth gate (redirect a /signin si no hay user)
│   │   │   └── page.tsx               → /dashboard
│   │   └── signin/
│   │       ├── layout.tsx
│   │       └── page.tsx               → /signin
│   ├── api/                           ← API routes (sin locale)
│   │   ├── auth/callback/             ← exchange de código + redirect locale-aware
│   │   ├── lead/
│   │   ├── lemonsqueezy/
│   │   │   ├── create-checkout/
│   │   │   └── create-portal/
│   │   └── webhook/lemonsqueezy/
│   ├── layout.tsx                     ← root passthrough (la <html> está en [locale]/layout)
│   ├── globals.css
│   ├── error.tsx, not-found.tsx
│   └── icons/imágenes
│
├── i18n/
│   ├── routing.ts                     ← locales y default
│   ├── request.ts                     ← carga server-side de mensajes
│   └── navigation.ts                  ← Link/redirect/router locale-aware
│
├── messages/
│   ├── es/{common,landing,app}.json
│   └── en/{common,landing,app}.json
│
├── components/                        ← UI reutilizable
├── libs/
│   ├── supabase/{client,server}.ts
│   ├── api.ts                         ← apiClient (axios) para llamadas desde frontend
│   ├── gpt.ts
│   ├── lemonsqueezy.ts
│   ├── resend.ts
│   └── seo.tsx
├── types/
├── config.ts                          ← config central (appName, dominio, planes, etc.)
├── project.yaml                       ← checklist de setup inicial
└── middleware.ts                      ← next-intl + Supabase session refresh
```

> Las carpetas con `[ ]` son **dynamic segments** de Next.js (capturan cualquier valor de URL). Las carpetas con `( )` son **route groups** (organizan código sin afectar la URL). Ambos nombres son literales en el filesystem.

---

## Configuración central

### `config.ts`
Fuente de verdad en runtime. Nombre, dominio, colores, planes, URLs de auth, Resend, Crisp.

### `project.yaml`
Checklist de setup inicial. Mapea cada campo a su destino en el código.

### Variables de entorno (`.env`)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_STORE_ID
LEMONSQUEEZY_SIGNING_SECRET

RESEND_API_KEY

CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET_NAME
CLOUDFLARE_R2_ENDPOINT
NEXT_PUBLIC_R2_CDN_URL

SITE_URL
```

---

## Middleware

`middleware.ts` corre **una sola vez por request** y combina dos responsabilidades, con bifurcación según el tipo de ruta:

**Rutas de landing** (`/`, `/es/...`, `/en/...`, `/blog`, `/pricing`, etc.):
1. **next-intl** — detecta el locale (URL > cookie `NEXT_LOCALE` > Accept-Language > default) y redirige `/` → `/es/` o `/en/`. También setea la cookie `NEXT_LOCALE`.
2. **Supabase** — refresca el token de sesión sobre la misma `Response` para no pisar la cookie de locale ni el redirect.

**Rutas de app** (`/dashboard`, `/signin`, `/settings`, etc., enumeradas en `APP_ROUTES`):
1. **next-intl se omite por completo** — estas rutas no tienen locale en URL.
2. **Supabase** — solo refresca la sesión.

> Si agregás una nueva sección de app (ej. `/billing`), agregala al array `APP_ROUTES` en `middleware.ts` para que next-intl no intente prefijarle locale.

El matcher excluye `/api/`, archivos estáticos, e imágenes.

---

## Autenticación

Supabase Auth con `@supabase/ssr`.

**Flujo:**
1. Usuario va a `/signin` (sin locale en URL)
2. Elige Google OAuth o magic link
3. Supabase redirige a `/api/auth/callback`
4. El callback hace `exchangeCodeForSession` y redirige a `/dashboard`

**Protección de rutas:**
- `app/(app)/dashboard/layout.tsx`: server component que verifica sesión con `supabase.auth.getUser()` y, si no hay user, hace `redirect("/signin")` con el helper estándar de `next/navigation`.

**Clientes Supabase:**
- `libs/supabase/server.ts` — Server Components y Route Handlers
- `libs/supabase/client.ts` — Client Components

---

## Base de datos

Supabase (Postgres). Tabla principal: `profiles`.

```sql
id          uuid  -- referencia a auth.users
email       text
customer_id text  -- ID de cliente en LemonSqueezy
variant_id  text  -- plan activo
has_access  bool  -- acceso pagado
locale      text  -- preferencia de idioma del user para la sección app (default 'en')
```

El webhook de LemonSqueezy escribe usando `SUPABASE_SERVICE_ROLE_KEY`.

---

## Pagos (LemonSqueezy)

**Checkout:**
1. `ButtonCheckout` → `POST /api/lemonsqueezy/create-checkout` con `userId` en `custom_data`.
2. LemonSqueezy → checkout hospedado → webhook.

**Webhook (`/api/webhook/lemonsqueezy`):**
- Valida firma HMAC-SHA256.
- `order_created` → upsert en `profiles`, `has_access: true`.
- `subscription_cancelled` → `has_access: false`.

**Portal:** `POST /api/lemonsqueezy/create-portal` → URL del Customer Portal.

**Planes:** `config.lemonsqueezy.plans[]` con `variantId` separado para dev/prod.

---

## Email (Resend)

`libs/resend.ts`. Configuración en `config.ts > resend`:
- `fromNoReply` — magic links y transaccionales
- `fromAdmin` — updates manuales
- `supportEmail` — fallback de soporte si Crisp no está activo

---

## Soporte (Crisp)

Opcional. Se activa con `config.crisp.id`.

- `components/LayoutClient.tsx > CrispChat`: inicializa Crisp y le pasa el `userId` de Supabase.
- `components/ButtonSupport.tsx`: abre el chat de Crisp; si no está configurado, abre `mailto:` al `supportEmail`.

---

## Storage (Cloudflare R2)

AWS SDK con keys de R2. `config.cloudflare.r2CdnUrl` — URL pública del bucket. Agregar el dominio en `next.config.js > remotePatterns` para `next/image`.

---

## SEO

- `libs/seo.tsx` — meta tags + JSON-LD (`SoftwareApplication`).
- `next-sitemap` — genera `sitemap.xml` y `robots.txt` en build (`postbuild`).
- Config en `next-sitemap.config.js` usando `SITE_URL`.

> **Pendiente por proyecto**: el sitemap debería generar entradas por locale (`/es/...` y `/en/...`) y declarar `hreflang` cruzado.

---

## Convenciones de desarrollo

### Linking entre páginas

Depende del destino:

**Para links a la landing** (`/`, `/blog`, `/pricing`, `/tos`, `/privacy-policy`):
```ts
import { Link, useRouter, redirect } from "@/i18n/navigation";
```
Estos wrappers prefijan el locale activo automáticamente, generando `/es/blog` o `/en/blog` según corresponda.

**Para links a la app** (`/dashboard`, `/signin`, `/settings`):
```ts
import Link from "next/link";
import { redirect } from "next/navigation";
```
La app no tiene locale en la URL, así que se usa el routing estándar de Next.js.

> Regla rápida: si la URL destino tiene `/es/` o `/en/` → `i18n/navigation`. Si no → `next/link`.

### Strings traducibles
Cualquier string visible al usuario debe estar en `messages/{locale}/*.json`, no hardcodeado. Usar `useTranslations("namespace")` en componentes y `getTranslations` en server components.

### Server vs client
- Auth gating, fetch de datos sensibles, SEO → server components.
- Interactividad (formularios, toasts, popovers) → client components.

---

## Inicializar un nuevo proyecto

Ver **[`SETUP.md`](./SETUP.md)** — checklist paso a paso (variables, base de datos, dashboards externos, assets, etc.). Para flujos recurrentes (agregar página, sección de app, locale nuevo) usar los skills en `.claude/skills/`.
