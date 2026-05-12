# Virel

Boilerplate base para SaaS sobre Next.js 15. Fork de [ShipFast](https://shipfa.st) adaptado al stack que sigue.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS v4 + DaisyUI v5 |
| i18n | next-intl v3 (híbrido: locale en URL para landing, `profiles.locale` + cookie para app) |
| Auth + DB | Supabase (`@supabase/ssr`) |
| Pagos | LemonSqueezy |
| Email | Resend |
| Storage | Cloudflare R2 |
| Soporte | Crisp (opcional) |
| Contenido largo | MDX (`next-mdx-remote/rsc`) |
| SEO | `app/sitemap.ts` + `app/robots.ts` con hreflang multi-locale |
| Tests E2E | Playwright (smoke tests) |

## Quick start

1. Clonar este repo, renombrar la carpeta al nombre del proyecto.
2. Completar `project.yaml` con valores reales (nombre, dominio, credenciales).
3. `npm run setup` → crea `.env` desde `.env.example`, reemplaza valores en el repo, instala deps y (si tenés el Supabase CLI configurado) aplica `supabase/migrations/0001_initial.sql`.
4. `npm run dev`.

Pasos manuales que el script no puede automatizar (Supabase Dashboard, LemonSqueezy products, R2 bucket, assets binarios): seguir **[`SETUP.md`](./SETUP.md)** end-to-end.

## Estructura

```
app/
├── [locale]/(landing)/   landing pública con locale en URL (/, /es), indexable
├── (app)/                app autenticada (sin locale en URL, noindex)
│   ├── dashboard/
│   ├── signin/
│   └── settings/         cambio de idioma del perfil
├── api/                  API routes
├── sitemap.ts            sitemap con hreflang EN↔ES
└── robots.ts             disallow /dashboard, /signin, /settings, /api

content/{en,es}/legal/    MDX para privacy / TOS
messages/{en,es}/         JSON para UI copy (common, landing, app)
supabase/migrations/      esquema SQL versionado
e2e/                      smoke tests Playwright
i18n/                     routing, request, navigation
libs/                     wrappers (supabase, lemonsqueezy, resend, mdx, rate-limit)
```

**Dos layouts, dos modelos de locale:** landing lee locale de la URL; app lee `profiles.locale` (DB) cacheado en la cookie `APP_LOCALE`. Son independientes. Ver `ARCHITECTURE.md` para el detalle.

## Tareas comunes (skills)

Para flujos recurrentes hay skills en `.claude/skills/` invocables desde Claude Code:

| Skill | Cuándo |
|---|---|
| `setup-project` | Primer setup de un proyecto nuevo desde el boilerplate. |
| `add-landing-page` | Agregar una página pública con i18n + SEO (`/pricing`, `/about`, etc.). |
| `add-app-section` | Agregar una sección autenticada (`/billing`, etc.). Actualiza `APP_ROUTES` en el middleware. |
| `add-locale` | Sumar un idioma nuevo (ej. `fr`, `pt`). |

## CI

El workflow de GitHub Actions vive en `.github/workflows-template/ci.yml` (fuera del path que GitHub escanea) para que **no corra en el repo del boilerplate**. Para activarlo en un proyecto derivado:

```bash
mkdir -p .github/workflows && mv .github/workflows-template/ci.yml .github/workflows/
```

Corre typecheck + lint + build + Playwright en cada PR. Si usás otra plataforma (Bitbucket Pipelines, GitLab CI), copiá los mismos `npm run ci` / `npm run build` / `npm run test:e2e` a su sintaxis.

## Scripts

| Comando | Hace |
|---|---|
| `npm run dev` | Dev server en `:3000` |
| `npm run build` | Build de producción (requiere `SITE_URL` en `.env`) |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run ci` | typecheck + lint |
| `npm run test:e2e` | Smoke tests Playwright |
| `npm run setup` | Aplica `project.yaml` + `npm install` + (opcional) `supabase db push` |

## Variables de entorno

Ver `.env.example`. Críticas:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_SIGNING_SECRET`
- `RESEND_API_KEY`
- `CLOUDFLARE_R2_*`, `NEXT_PUBLIC_R2_CDN_URL`
- `SITE_URL` — required para `sitemap.ts` / `robots.ts`; el build falla si falta.

## Docs

- **[`SETUP.md`](./SETUP.md)** — checklist completo para inicializar un proyecto nuevo.
- **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** — decisiones de stack, flujos de auth y locale, convenciones.
- **[`CLAUDE.md`](./CLAUDE.md)** — guías de trabajo para humanos y asistentes IA.
- **[`.claude/skills/`](./.claude/skills/)** — workflows por tarea.

## Estado del boilerplate

Pensado como base limpia: el copy de la landing es placeholder genérico (`Title goes here`, `Jane Doe`, etc.), la tabla `profiles` y `leads` están versionadas como migration, los componentes biblioteca (`Hero`, `Pricing`, `FAQ`, `Testimonials*`, `Features*`, etc.) están listos para que cada proyecto los personalice. Ver `.claude/skills/setup-project/SKILL.md` para el orden recomendado de personalización.
