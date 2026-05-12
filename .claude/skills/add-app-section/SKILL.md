---
name: add-app-section
description: Crea una sección nueva dentro de la app (sin locale en URL) y actualiza el middleware para que next-intl la omita. Invocar cuando el usuario pida agregar "/billing", "/settings", "/dashboard/X" o cualquier ruta de la app autenticada.
---

# Agregar sección nueva a la app

Las rutas de app viven bajo `app/(app)/` y NO tienen locale en URL. El idioma se lee de la cookie `NEXT_LOCALE` en el layout `(app)`.

## Pasos

### 1. Preguntar al usuario
- Slug de la URL (ej. `billing`, `settings`, `team`).
- ¿Es ruta privada (requiere login) o pública dentro de la app (como `/signin`)?
- Si es privada y no cuelga de `/dashboard`, ¿hereda su auth gate o necesita uno propio?

### 2. Crear la sección
Carpeta y archivo:
```
app/(app)/<slug>/page.tsx
```

Template base (página privada simple):
```tsx
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("app.<slug>");

  return (
    <main className="...">
      <h1>{t("title")}</h1>
    </main>
  );
}
```

Si necesita auth gate propio (porque está fuera de `/dashboard`):
```tsx
// app/(app)/<slug>/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(config.auth.loginUrl);
  return <>{children}</>;
}
```

### 3. Actualizar el middleware (CRÍTICO)
En `middleware.ts`, agregar la nueva ruta al array `APP_ROUTES`:
```ts
const APP_ROUTES = ["/dashboard", "/signin", "/settings", "/<slug>"];
```

**Si se omite este paso**, next-intl interceptará la ruta y la redirigirá a `/es/<slug>` → 404.

### 4. Agregar las traducciones
Editar `messages/es/app.json` y `messages/en/app.json`:
```json
{
  "<slug>": {
    "title": "..."
  }
}
```

### 5. Linking desde otras páginas
```ts
import Link from "next/link";
<Link href="/<slug>">...</Link>
```
**Usar `next/link`**, NO `i18n/navigation` — las rutas de app no llevan locale.

## Verificación
- Cargar `/<slug>` en el browser, sin prefijo de locale.
- Verificar que el title/copy sale en el idioma de la cookie `NEXT_LOCALE`.
- Si es privada: verificar que sin sesión redirige a `/signin`.
- Verificar que `/es/<slug>` y `/en/<slug>` tiran 404 (no deberían existir).

## NO hacer
- No crear la sección bajo `app/[locale]/(app)/` — esa carpeta no existe en este proyecto.
- No usar `i18n/navigation` para links a esta ruta — perdés la URL limpia.
- No olvidar `APP_ROUTES` — es el bug más común al agregar una sección.
