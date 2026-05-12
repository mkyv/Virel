# Skills disponibles

Workflows reusables para tareas recurrentes en este boilerplate. Claude los carga **on-demand** cuando se invocan, no consumen contexto si no se usan.

## Cómo invocar

Desde Claude Code, simplemente describí la tarea en lenguaje natural ("agregá una página /pricing a la landing", "querés inicializar el proyecto") — Claude detecta el skill que corresponde y lo invoca. También se puede invocar explícitamente: "usá el skill add-landing-page".

## Skills

| Skill | Cuándo usar |
|---|---|
| `setup-project` | **Primera vez** que clonás el boilerplate. Reemplaza valores de ShipFast, configura servicios externos (Supabase, LemonSqueezy, Resend, R2), reemplaza assets. Punto de partida obligatorio para cada proyecto nuevo. |
| `add-landing-page` | Para sumar páginas públicas con SEO multilenguaje (`/pricing`, `/about`, `/features/X`, etc.). Crea la estructura bajo `app/[locale]/(landing)/` y los namespaces de mensajes. |
| `add-app-section` | Para sumar secciones de la app autenticada (`/billing`, `/settings`, etc.). Crea la estructura bajo `app/(app)/` y **actualiza `APP_ROUTES` en el middleware** (omitir este paso es el bug más común). |
| `add-locale` | Para agregar un idioma nuevo (ej. `fr`, `pt`). Cambios en `i18n/routing.ts` + crear `messages/<nuevo>/`. |

## Orden típico al arrancar un proyecto

1. **`setup-project`** — siempre primero.
2. (Iterar) **`add-landing-page`** — para cada sección pública del producto.
3. (Iterar) **`add-app-section`** — para cada feature de la app.
4. **`add-locale`** — solo si el proyecto necesita más de los 2 idiomas por defecto (`es`, `en`).

## Cuándo NO usar un skill

- **Cambios chicos** dentro de archivos existentes (modificar copy, ajustar estilos, refactorizar un componente) — no necesitan skill.
- **Lógica de negocio** específica (integraciones puntuales, features únicas del proyecto) — no calzan en un skill genérico.
- **Debugging** — los skills son para "scaffold + setup", no para investigación.

Si dudás si corresponde un skill: probablemente no. Los skills son para tareas que se repiten _con el mismo patrón_ entre proyectos.
