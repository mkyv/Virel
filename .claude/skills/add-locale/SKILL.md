---
name: add-locale
description: Agrega un idioma nuevo al proyecto (ej. fr, pt, de). Crea la estructura de mensajes y actualiza la config de routing. Invocar cuando el usuario pida "agregar [idioma]", "nuevo locale", "soporte para [idioma]".
---

# Agregar un locale nuevo

Locales actuales: `es` (default), `en`. Para sumar uno nuevo, los cambios son chicos pero hay que tocar tres lugares.

## Pasos

### 1. Preguntar al usuario
- Código del locale (ISO 639-1, ej. `fr`, `pt`, `de`).
- ¿Es solo para landing o también para la app?
  - Solo landing → no requiere cambios en cookies / app layout (igual va a funcionar, simplemente la app cae al default si la cookie no es válida).
  - Si quiere para todo → confirmar.
- ¿Se cambia el default? (Por defecto sigue siendo `es`.)

### 2. Actualizar `i18n/routing.ts`
```ts
export const routing = defineRouting({
  locales: ["es", "en", "<nuevo>"],
  defaultLocale: "es",
  localePrefix: "always",
});
```

### 3. Crear los archivos de traducciones
```
messages/<nuevo>/
├── common.json
├── landing.json
└── app.json
```

Estrategia recomendada: copiar los archivos de `messages/es/` (o `en/`) como base y reemplazar los valores. Mantener exactamente la misma estructura de keys — si falta una key, next-intl tira error en runtime.

```bash
cp -r messages/es messages/<nuevo>
# luego traducir los valores manteniendo las keys
```

### 4. (Si se eliminó algún locale) Limpieza
- Borrar la carpeta `messages/<viejo>/`.
- Quitar el locale de `routing.ts`.
- Verificar que ninguna URL hardcodee `/<viejo>/...`.

## Verificación
- Cargar `/<nuevo>/` (landing) → debería renderizar en el idioma nuevo.
- Cargar `/<nuevo>/blog`, `/<nuevo>/pricing`, etc. → idem.
- Si la cookie `NEXT_LOCALE=<nuevo>` está seteada, ir a `/dashboard` → debería renderizar en el idioma nuevo.
- `pnpm build` para verificar que no falten keys.

## NO hacer
- No olvidar ningún archivo de `messages/<nuevo>/` — los tres son requeridos por `i18n/request.ts`.
- No usar locales con sub-tags (ej. `es-AR`, `en-US`) salvo que el usuario lo pida explícitamente — agrega complejidad y casi nunca aporta.
- No cambiar el `defaultLocale` sin confirmar — afecta a todos los usuarios sin cookie.
