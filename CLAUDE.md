# CLAUDE.md

Guías de trabajo y contexto del proyecto. Autocontenido — toda la info para no romper nada vive acá.

**Tradeoff:** Las guías priorizan cautela sobre velocidad. Para tareas triviales, usar criterio.

---

## 1. Pensar antes de codear

**No asumir. No esconder dudas. Mostrar trade-offs.**

Antes de implementar:
- Explicitar las assumptions. Si hay duda, preguntar.
- Si hay múltiples interpretaciones, presentarlas — no elegir en silencio.
- Si existe una alternativa más simple, decirlo. Push back cuando corresponda.
- Si algo no está claro, parar. Nombrar qué confunde. Preguntar.

## 2. Simplicidad primero

**El mínimo código que resuelve el problema. Nada especulativo.**

- No features más allá de lo pedido.
- No abstracciones para código de un solo uso.
- No "flexibilidad" o "configurabilidad" no solicitada.
- No error handling para escenarios imposibles.
- Si escribís 200 líneas y podía ser 50, reescribilo.

Pregunta de control: "¿Un senior diría que esto está sobrecomplicado?" Si sí, simplificar.

## 3. Cambios quirúrgicos

**Tocar solo lo necesario. Limpiar solo el propio desorden.**

Al editar código existente:
- No "mejorar" código adyacente, comentarios o formato.
- No refactorizar lo que no está roto.
- Respetar el estilo existente, aunque vos lo harías distinto.
- Si encontrás dead code no relacionado, mencionarlo — no borrarlo.

Cuando tus cambios crean huérfanos:
- Quitar imports/variables/funciones que TUS cambios dejaron sin uso.
- No quitar dead code preexistente sin pedirlo.

Test: cada línea cambiada debe trazarse directo al pedido del usuario.

---

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + DaisyUI v5 + `@tailwindcss/typography`
- next-intl v3 (i18n híbrido)
- Supabase (auth + Postgres) — `@supabase/ssr`
- LemonSqueezy (pagos), Resend (email), Crisp (soporte, opcional)
- Cloudflare R2 (storage)
- MDX (`next-mdx-remote/rsc`) para contenido largo
- Playwright (smoke tests E2E)

## Estructura

```
app/
├── [locale]/(landing)/   LANDING — locale en URL (/, /es, /es/...)
├── (app)/                APP — sin locale (/dashboard, /signin, /signup, /settings)
│   ├── dashboard/        auth gate en layout.tsx
│   ├── settings/         auth gate en layout.tsx
│   ├── signin/           pre-login (OTP code + Google OAuth)
│   └── signup/           pre-login (shouldCreateUser=true)
├── api/                  API routes (sin locale)
├── sitemap.ts            sitemap multi-locale con hreflang
├── robots.ts             disallow /dashboard, /signin, /settings, /api
└── layout.tsx            root passthrough

content/{en,es}/legal/    MDX para privacy / TOS
messages/{en,es}/         JSON para UI copy (common, landing, app)
supabase/migrations/      esquema SQL versionado
i18n/                     routing, request, navigation
libs/                     wrappers (supabase, lemonsqueezy, resend, mdx, rate-limit, seo)
components/               UI biblioteca (Hero, Pricing, Testimonials*, Features*, etc.)
e2e/                      smoke tests Playwright
.github/workflows-template/  workflow CI de ejemplo (no se ejecuta en el boilerplate)
```

> Carpetas con `[ ]` = dynamic segments. Carpetas con `( )` = route groups (no afectan URL).

## i18n híbrido

| Sección | URL | Locale resuelto desde |
|---|---|---|
| Landing | `/` o `/es/...` | `params.locale` (URL) |
| App pre-login (`/signin`, `/signup`) | sin prefix | cookie `NEXT_LOCALE` (heredada de landing) |
| App post-login (`/dashboard`, `/settings`) | sin prefix | cookie `APP_LOCALE` (sync desde `profiles.locale` por `/api/auth/callback`) |

Config en `i18n/routing.ts`: `defaultLocale: "en"`, `localePrefix: "as-needed"`, `localeDetection: true`.

`i18n/request.ts` resuelve locale en este orden: `requestLocale` (URL) → `APP_LOCALE` → `NEXT_LOCALE` → `defaultLocale`. Garantiza que cualquier server component encuentre el locale correcto sin depender de `setRequestLocale`.

## Regla: toda página/route debe ser i18n

Cualquier `page.tsx`, `layout.tsx` o componente con copy visible al usuario:

- **Strings cortos** (UI labels, botones, mensajes): `messages/{locale}/{common,landing,app}.json` + `getTranslations` (server) o `useTranslations` (client).
- **Contenido largo** (legal, blog, about, docs): MDX en `content/{locale}/{group}/{slug}.mdx`, leído con `getMdxSource()` de `libs/mdx.ts` y renderizado con `<MDXRemote source={...} />`.
- **Linking entre páginas**:
  - Destino con locale en URL (landing) → `import { Link, useRouter, redirect } from "@/i18n/navigation"`.
  - Destino sin locale (app, API) → `import Link from "next/link"`.

Nunca hardcodear copy visible al usuario.

## Auth (Supabase + OTP code)

- `/signin` y `/signup`: comparten `<AuthForm mode="..." />`. OTP code de 6 dígitos (`signInWithOtp` → email con `{{ .Token }}` → `verifyOtp`) + Google OAuth opcional. `shouldCreateUser: false` en signin (rechaza emails desconocidos), `true` en signup.
- `/api/auth/callback`: maneja OAuth (`?code=`) y OTP (redirect post-`verifyOtp`). Sincroniza cookie `APP_LOCALE` desde `profiles.locale`. En primer signup hereda el locale del cache (NEXT_LOCALE/APP_LOCALE) al `profiles.locale`.
- Auth gates: `redirect(config.auth.loginUrl)` plain de `next/navigation` en `app/(app)/{dashboard,settings}/layout.tsx`.
- Clientes Supabase:
  - `libs/supabase/server.ts` — Server Components y Route Handlers. **Async**, siempre `await createClient()`.
  - `libs/supabase/client.ts` — Client Components. Sin `await`.

## Base de datos

Schema en `supabase/migrations/0001_initial.sql`. Aplicar con `supabase db push` (CLI) o copiar al SQL Editor.

- `profiles` — info del user. Columnas: `id` (ref `auth.users`), `email`, `customer_id`, `variant_id`, `has_access`, `subscription_status`, `subscription_renews_at`, `locale`, `created_at`.
- Trigger `on_auth_user_created` — inserta una fila en `profiles` cada vez que se crea un user en `auth.users` (con `locale='en'` default).
- `leads` — emails de waitlist desde `/api/lead` (`<ButtonLead />`). Unique en `email`, insert con `ignoreDuplicates`.

## Pagos (LemonSqueezy)

Webhook `/api/webhook/lemonsqueezy` valida firma HMAC y maneja:

- `order_created` → upsert `profiles` con `customer_id`, `variant_id`, `has_access=true`.
- `subscription_created` / `subscription_updated` / `subscription_resumed` → `status='active'`, `renews_at` del payload, `has_access=true`.
- `subscription_cancelled` → solo marca `status='cancelled'`. **No revoca acceso** (estándar SaaS: el user mantiene acceso hasta `subscription_expired`).
- `subscription_expired` → `has_access=false`, `subscription_renews_at=null`, `status=null`.

Customer Portal de LemonSqueezy se abre desde `/settings` via `/api/lemonsqueezy/create-portal`. Toda la gestión (cancelar, cambiar plan, ver facturas) ocurre allá.

## Agregar features

**Nueva página en landing** (`/pricing`, `/about`, etc.):
- Crear `app/[locale]/(landing)/<path>/page.tsx`. Resolver locale de `params`, usar `getTranslations`.
- No requiere cambios de middleware.

**Nueva sección de app autenticada** (`/billing`, etc.):
- Crear `app/(app)/<path>/page.tsx` + `layout.tsx` con auth gate.
- Sumar `"/<path>"` al array `APP_ROUTES` en `middleware.ts`.

**Nuevo locale** (ej. `fr`):
- Agregar a `routing.locales` en `i18n/routing.ts`.
- Crear `messages/fr/{common,landing,app}.json`.
- Si hay MDX legal: crear `content/fr/legal/*.mdx`.

Skills disponibles para automatizar: `add-landing-page`, `add-app-section`, `add-locale`, `setup-project`. Ver `.claude/skills/README.md`.

## Patterns Next.js 15

- `cookies()`, `headers()`, `params` son **Promises** → siempre `await`.
- Tipado de dynamic routes: `params: Promise<{ id: string }>`.
- `createClient()` server: **async**. `createClient()` client: sync.
- `generateMetadata` también recibe `params` como Promise.

## Tailwind CSS v4

- Toda la config vive en `app/globals.css` (no hay `tailwind.config.js`).
- Custom theme tokens con `@theme { --color-brand-500: #...; }`.
- DaisyUI v5 y `@tailwindcss/typography` se cargan con `@plugin "..."` en `globals.css`.

## Configuración del proyecto

- `config.ts` — appName, dominio, colores, planes LemonSqueezy, emails. Source of truth en runtime.
- `project.yaml` — input estructurado del `scripts/setup.js`. Rellena `.env`, `config.ts`, `libs/seo.tsx`, `next.config.js`.
- `.env.example` — variables requeridas. `SITE_URL` es obligatoria; build falla sin ella (la usan `app/sitemap.ts` y `app/robots.ts`).

## Tests y CI

- `npm run ci` → typecheck + lint.
- `npm run test:e2e` → smoke tests en `e2e/` (requiere `npx playwright install chromium` la primera vez).
- Workflow CI vive en `.github/workflows-template/ci.yml`. No se ejecuta en el boilerplate; cada proyecto lo mueve a `.github/workflows/` para activarlo.
