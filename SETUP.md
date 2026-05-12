# Setup checklist — nuevo proyecto

## config.ts
- [ ] `appName`
- [ ] `appDescription`
- [ ] `domainName`
- [ ] `colors.theme` (tema DaisyUI)
- [ ] `colors.main` (color primario en hex)
- [ ] `lemonsqueezy.plans` — reemplazar `variantId`, nombre, precio y features de cada plan
- [ ] `resend.fromNoReply` — `NombreApp <noreply@tudominio.com>`
- [ ] `resend.fromAdmin` — `Tu Nombre <tu@tudominio.com>`
- [ ] `resend.supportEmail`
- [ ] `crisp.id` — pegar ID o dejar vacío si no usás Crisp

## .env
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `LEMONSQUEEZY_API_KEY`
- [ ] `LEMONSQUEEZY_STORE_ID`
- [ ] `LEMONSQUEEZY_SIGNING_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `SITE_URL` — `https://tudominio.com`

## libs/seo.tsx
- [ ] `author.name` — tu nombre (Schema de Google)
- [ ] `datePublished` — fecha de lanzamiento
- [ ] `applicationCategory` — categoría real de tu app
- [ ] `aggregateRating` — tus números o eliminar el bloque

## Assets
- [ ] `app/icon.png` — logo de la app
- [ ] `app/favicon.ico` — favicon (16×16 / 32×32)
- [ ] `app/apple-icon.png` — touch icon iOS (180×180)
- [ ] `app/opengraph-image.png` — imagen preview para redes (1200×630)
- [ ] `app/twitter-image.png` — preview para Twitter (1200×630)
- [ ] `app/[locale]/(landing)/blog/_assets/images/authors/mirko.png` — avatar del autor del blog (reemplazar con el real o renombrar/duplicar para nuevos autores)

## Textos legales (MDX)
- [ ] `content/en/legal/privacy-policy.mdx` y `content/es/legal/privacy-policy.mdx` — reemplazar la plantilla por la política real del proyecto
- [ ] `content/en/legal/tos.mdx` y `content/es/legal/tos.mdx` — ídem

## Supabase (esquema inicial) — paso manual obligatorio
El esquema base está versionado en **`supabase/migrations/0001_initial.sql`** (tabla `profiles` + trigger `on_auth_user_created` + tabla `leads`). Aplicarlo con:

- **CLI** (recomendado, si tenés el proyecto linkeado): `supabase db push`
- **Manual**: abrir el archivo y pegar el contenido en Supabase Dashboard > SQL Editor.

Notas:
- **`profiles.locale`** es load-bearing: lo lee `/api/auth/callback` para sincronizar la cookie `APP_LOCALE` (que `app/(app)/layout.tsx` consume). Valores válidos: los `locales` definidos en `i18n/routing.ts`. Por default `'en'`; el callback lo sobreescribe al primer signup si el usuario traía preferencia desde la landing.
- **`profiles.subscription_status`** y **`profiles.subscription_renews_at`** las actualiza el webhook de LemonSqueezy:
  - `subscription_created` / `subscription_updated` / `subscription_resumed` → `status='active'`, `renews_at` del payload, `has_access=true`.
  - `subscription_cancelled` → `status='cancelled'`. **No toca `has_access` ni `renews_at`**: el user mantiene acceso hasta la fecha (comportamiento estándar SaaS).
  - `subscription_expired` → `has_access=false`, `renews_at=null`, `status=null`. Acá sí se revoca el acceso.
  - `/settings` lee las tres columnas para mostrar el estado correcto ("Próxima facturación" si activa, "Acceso hasta" si cancelada).
- **`leads`** la usa `/api/lead` (componente `<ButtonLead />`) para guardar emails de waitlist. Insert con `onConflict: ignoreDuplicates` por la unique constraint en `email`.

## Lemon Squeezy (dashboard)
- [ ] Crear producto con sus variantes
- [ ] Copiar `variantId` de cada variante a `config.ts`
- [ ] Crear webhook apuntando a `https://tudominio.com/api/webhook/lemonsqueezy`
- [ ] Copiar el signing secret del webhook a `.env`

## Supabase (dashboard)
- [ ] Configurar redirect URL: `https://tudominio.com/api/auth/callback` (Auth > URL Configuration)
- [ ] Habilitar los providers OAuth que vaya a usar el proyecto (Auth > Providers). El botón de Google está en `components/AuthForm.tsx`; para sumar otros, agregar otro `signInWithOAuth({ provider })` allí.
- [ ] **Auth > Email Templates > "Magic Link"**: cambiar `{{ .ConfirmationURL }}` por `{{ .Token }}` en el body. El boilerplate usa **OTP code de 6 dígitos**, no magic link. El body puede quedar así:
  ```
  Tu código de acceso:
  {{ .Token }}
  ```

## Resend (dashboard)
- [ ] Verificar dominio de envío
- [ ] Crear API key y copiarla a `.env`

## Cloudflare R2 (dashboard)
- [ ] Crear bucket en R2
- [ ] Crear API token con permisos de lectura/escritura → copiar `CLOUDFLARE_R2_ACCESS_KEY_ID` y `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- [ ] Copiar el endpoint S3 del bucket → `CLOUDFLARE_R2_ENDPOINT` (formato: `https://<account_id>.r2.cloudflarestorage.com`)
- [ ] Copiar nombre del bucket → `CLOUDFLARE_R2_BUCKET_NAME`
- [ ] Conectar dominio custom al bucket (R2 > bucket > Settings > Custom Domains) → `NEXT_PUBLIC_R2_CDN_URL`
- [ ] Si usás dominio custom: actualizar `*.r2.dev` por tu hostname en `next.config.js` > `remotePatterns`

## Opcional
- [ ] Tipografía: cambiar `Inter` en `app/[locale]/layout.tsx` y `app/(app)/layout.tsx` si querés otra fuente
- [ ] Componentes de landing (`components/Hero.tsx`, `Testimonials*.tsx`, `Features*.tsx`, etc.) — copy y data de placeholder, reemplazar con lo del proyecto

## Activar el blog (opcional)

Incluido en `app/[locale]/(landing)/blog/_assets/`:
- `components/Avatar.tsx`, `BadgeCategory.tsx`, `CardArticle.tsx`, `CardCategory.tsx`, `HeaderBlog.tsx` — UI lista para usar.
- `content.tsx` — tipos + un artículo de ejemplo + un autor + dos categorías.
- `images/authors/mirko.png` — avatar de ejemplo.

### Pasos para activar

1. **Crear las páginas** bajo `app/[locale]/(landing)/blog/`:
   - `page.tsx` — index del blog. Lee `articles` de `_assets/content.tsx` y renderiza `<CardArticle />`.
   - `[articleId]/page.tsx` — detalle del artículo. Buscar por slug en `articles`. Llamar `generateStaticParams` para SSG.
   - `category/[categoryId]/page.tsx` — filtra `articles` por categoría.
   - `author/[authorId]/page.tsx` — filtra `articles` por autor.
   - `layout.tsx` — header común con `<HeaderBlog />`.
2. **Migrar el contenido a i18n**: el `content.tsx` actual tiene strings hardcoded en inglés (títulos, descripciones, body). Dos opciones:
   - Mover los strings a `messages/{locale}/blog.json` (un namespace nuevo) y referenciar por key. Bien para sites de pocos artículos.
   - Cambiar a MDX por locale (`content/{locale}/blog/{slug}.mdx`) usando el mismo patrón que `content/{locale}/legal/`. Mejor para artículos largos y muchos.
3. **Registrar las URLs en el sitemap**: en `app/sitemap.ts`, iterar `articles` / `categories` / `authors` y agregar sus paths. Hay un comentario en el archivo indicando dónde.
4. **Cross-link desde landing**: agregar un link "Blog" en `Footer.tsx` (ya está) o en la home (sacado por defecto).
5. **Strings de UI del blog** (categorías, "Leer más", "Autor", etc.): agregar al namespace `landing` o crear uno nuevo `blog` en `messages/{en,es}/`.

Cada page debe resolver el `locale` desde `params` y usar `getTranslations` para todo el copy, siguiendo el patrón de `app/[locale]/(landing)/privacy-policy/page.tsx`.
