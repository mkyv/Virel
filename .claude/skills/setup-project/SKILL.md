---
name: setup-project
description: Inicializa un nuevo proyecto a partir del boilerplate Virel. Reemplaza valores por los del nuevo proyecto, configura servicios externos y deja el repo listo para desarrollar. Invocar cuando el usuario clone el boilerplate por primera vez o pida "setup", "inicializar proyecto", "configurar el boilerplate".
---

# Setup de un proyecto nuevo desde el boilerplate

Workflow para transformar este boilerplate en un proyecto concreto. Trabajar **secuencialmente** y confirmar con el usuario en cada bloque antes de avanzar.

La mayoría del trabajo de reemplazo de valores en el repo está automatizado en `scripts/setup.js` (invocable con `npm run setup`). Este skill cubre lo que **no** se puede automatizar: confirmar credenciales, configurar dashboards externos y reemplazar assets binarios.

## 0. Prerequisitos
Confirmar con el usuario:
- Nombre del proyecto y dominio.
- Cuentas activas en: Supabase, LemonSqueezy, Resend, Cloudflare R2.
- Si va a usar Crisp para soporte (opcional).
- Si tiene el [Supabase CLI](https://supabase.com/docs/guides/cli) instalado y el proyecto linkeado (`supabase login` + `supabase link`). Si sí, el script aplica las migrations automáticamente; si no, hay que correr el SQL a mano.

## 1. Llenar `project.yaml`
Completar todos los campos con los valores reales del proyecto. Las credenciales de servicios externos deben tenerse antes de avanzar — sin ellas, `npm run setup` deja los campos vacíos en `.env` y el dev/build falla.

## 2. Correr `npm run setup`
Esto:
- Crea `.env` desde `.env.example` si no existe.
- Reemplaza valores en `.env`, `config.ts`, `libs/seo.tsx`, `next.config.js > remotePatterns` según `project.yaml`.
- Ejecuta `npm install`.
- Intenta `supabase db push` (si el CLI está disponible). Si falla, hay que aplicar `supabase/migrations/0001_initial.sql` manualmente en el SQL Editor.

## 3. Assets (paso manual)
Reemplazar los archivos binarios listados en **`SETUP.md > Assets`**. El script no los toca.

## 4. Supabase Dashboard (paso manual)
- Activar Google OAuth (u otros providers requeridos) en Auth → Providers.
- Configurar Site URL y Redirect URLs: `https://<dominio>/api/auth/callback`.
- Si la migration no corrió con el CLI: pegar el contenido de `supabase/migrations/0001_initial.sql` en SQL Editor.

## 5. LemonSqueezy Dashboard (paso manual)
- Crear los productos/variantes en LemonSqueezy.
- Anotar los `variantId` de prod y dev y volcarlos en `project.yaml > lemonsqueezy.plans[]`, luego re-correr `npm run setup` para que se reflejen en `config.ts`.
- Configurar webhook → URL: `https://<dominio>/api/webhook/lemonsqueezy`. Eventos a suscribir: `order_created`, `subscription_created`, `subscription_updated`, `subscription_resumed`, `subscription_cancelled`, `subscription_expired`. Copiar el signing secret a `project.yaml > env.lemonsqueezy.signing_secret`.

## 6. Cloudflare R2 (paso manual)
- Crear bucket.
- Conectar dominio custom (ej. `cdn.<dominio>`) o usar el `*.r2.dev`.
- Volcar credenciales en `project.yaml > env.cloudflare_r2`. El script actualiza `next.config.js > remotePatterns` con el hostname real.

## 7. i18n
- Editar los strings del proyecto en `messages/es/*.json` y `messages/en/*.json` (`common`, `landing`, `app`).
- Las páginas legales viven en `content/{en,es}/legal/{privacy-policy,tos}.mdx` — reemplazar el contenido placeholder por el real.
- Si el proyecto necesita más idiomas, invocar el skill `add-locale`.

## 8. Copy del proyecto (paso manual)
Revisar y reemplazar copy/data placeholder en:
- `components/Hero.tsx`, `Pricing.tsx`, `FAQ.tsx`, `CTA.tsx`
- `components/Features*.tsx` (3 variantes — usar la que aplique)
- `components/Testimonials*.tsx` (5 variantes)
- `components/Problem.tsx`, `WithWithout.tsx`
- `app/[locale]/(landing)/blog/_assets/content.tsx` (autor, categorías, artículos)
- `app/[locale]/(landing)/page.tsx` (home placeholder)

## 9. Verificación
- `npm run ci` → typecheck + lint pasan.
- `npm run build` → build completo (necesita `SITE_URL` en `.env`).
- `npm run dev` → verificar manualmente que `/`, `/es`, `/blog`, `/dashboard`, `/signin`, `/settings` cargan.
- (Opcional) `npm run test:e2e` → smoke tests Playwright.

## 10. CI (opcional)
Si vas a usar GitHub Actions, activar el workflow de ejemplo:
```bash
mkdir -p .github/workflows && mv .github/workflows-template/ci.yml .github/workflows/
```
Si usás otra plataforma (Bitbucket, GitLab), copiar los mismos scripts (`npm run ci`, `npm run build`, `npm run test:e2e`) a su sintaxis.

## Notas
- Si el usuario no tiene credenciales de algún servicio listo, parar y dejar el resto pendiente — no inventar valores placeholder nuevos.
