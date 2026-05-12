#!/usr/bin/env node
/**
 * Lee project.yaml y aplica todos los valores en los archivos del proyecto.
 *
 * Uso:
 *   npm run setup
 *   — o —
 *   node scripts/setup.js
 *
 * Pasos (en orden):
 *   1. Copia .env.example → .env (si .env no existe).
 *   2. Reemplaza valores en .env, config.ts, libs/seo.tsx, next.config.js.
 *   3. Ejecuta `npm install` para sincronizar dependencias.
 *   4. (Opcional) Ejecuta `supabase db push` si el CLI de Supabase está
 *      disponible y el proyecto está linkeado. Si no, log warning y sigue.
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const { execSync }  = require('child_process');
const yaml          = require('js-yaml');

const ROOT  = path.resolve(__dirname, '..');
const read  = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const write = (rel, src) => {
  fs.writeFileSync(path.join(ROOT, rel), src, 'utf8');
  console.log(`  ✓  ${rel}`);
};

function run(cmd, opts = {}) {
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
    return true;
  } catch {
    return false;
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Reemplaza KEY=<valor> en un archivo .env */
function setEnv(src, key, val) {
  if (val === undefined || val === null || val === '') return src;
  return src.replace(new RegExp(`^(${key}=).*$`, 'm'), `$1${val}`);
}

/** Reemplaza key: "viejo" → key: "nuevo" */
function setStr(src, key, val) {
  if (!val) return src;
  return src.replace(
    new RegExp(`(\\b${key}:\\s*)(\`[^\`]*\`|"[^"]*")`),
    `$1"${val}"`
  );
}

/** Reemplaza key: `viejo` → key: `nuevo` (template literal) */
function setTpl(src, key, val) {
  if (!val) return src;
  return src.replace(
    new RegExp(`(\\b${key}:\\s*)(\`[^\`]*\`|"[^"]*")`),
    `$1\`${val}\``
  );
}

/**
 * Reemplaza un bloque completo `blockName: { ... },` en src.
 * Usa conteo de llaves para encontrar el cierre correcto.
 */
function replaceBlock(src, blockName, replacement) {
  const start = src.indexOf(`${blockName}:`);
  if (start === -1) return src;

  const braceStart = src.indexOf('{', start);
  if (braceStart === -1) return src;

  let depth = 0, end = braceStart;
  for (let i = braceStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }

  let tail = end + 1;
  if (src[tail] === ',') tail++;

  return src.slice(0, start) + replacement + src.slice(tail);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. .env: copiar de .env.example si no existe
// ─────────────────────────────────────────────────────────────────────────────

if (!exists('.env')) {
  if (!exists('.env.example')) {
    console.error('❌  Falta .env.example. Abortando.');
    process.exit(1);
  }
  fs.copyFileSync(path.join(ROOT, '.env.example'), path.join(ROOT, '.env'));
  console.log('  +  .env (creado desde .env.example)');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Aplicar project.yaml a los archivos del repo
// ─────────────────────────────────────────────────────────────────────────────

const data = yaml.load(read('project.yaml'));
console.log('\nAplicando project.yaml…\n');

// .env
let env = read('.env');
const e = data.env || {};

const envMap = {
  NEXT_PUBLIC_SUPABASE_URL:        e.supabase?.url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:   e.supabase?.anon_key,
  SUPABASE_SERVICE_ROLE_KEY:       e.supabase?.service_role_key,
  LEMONSQUEEZY_API_KEY:            e.lemonsqueezy?.api_key,
  LEMONSQUEEZY_STORE_ID:           e.lemonsqueezy?.store_id,
  LEMONSQUEEZY_SIGNING_SECRET:     e.lemonsqueezy?.signing_secret,
  RESEND_API_KEY:                  e.resend?.api_key,
  CLOUDFLARE_R2_ACCESS_KEY_ID:     e.cloudflare_r2?.access_key_id,
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: e.cloudflare_r2?.secret_access_key,
  CLOUDFLARE_R2_BUCKET_NAME:       e.cloudflare_r2?.bucket_name,
  CLOUDFLARE_R2_ENDPOINT:          e.cloudflare_r2?.endpoint,
  NEXT_PUBLIC_R2_CDN_URL:          e.cloudflare_r2?.cdn_url,
  SITE_URL:                        e.site?.url,
};

for (const [key, val] of Object.entries(envMap)) {
  env = setEnv(env, key, val);
}
write('.env', env);

// config.ts
let cfg     = read('config.ts');
const app   = data.app      || {};
const br    = data.branding || {};
const res   = data.resend   || {};
const crisp = data.crisp    || {};

if (app.name)        cfg = setStr(cfg, 'appName',        app.name);
if (app.description) cfg = setStr(cfg, 'appDescription', app.description);
if (app.domain)      cfg = setStr(cfg, 'domainName',     app.domain);
if (br.primary_color) cfg = setStr(cfg, 'main',          br.primary_color);

// colors.theme vive dentro del bloque colors — requiere contexto
if (br.theme) {
  cfg = cfg.replace(
    /(colors:\s*\{[^}]*theme:\s*)"[^"]*"/,
    `$1"${br.theme}"`
  );
}

// crisp.id — dentro del bloque crisp
if (crisp.id !== undefined) {
  cfg = cfg.replace(
    /(crisp:\s*\{[^}]*id:\s*)"[^"]*"/,
    `$1"${crisp.id}"`
  );
}

// resend — template literals
if (res.from_noreply)  cfg = setTpl(cfg, 'fromNoReply',  res.from_noreply);
if (res.from_admin)    cfg = setTpl(cfg, 'fromAdmin',    res.from_admin);
if (res.support_email) cfg = setStr(cfg, 'supportEmail', res.support_email);

// lemonsqueezy.plans — regenera el bloque completo
const lsPlans = data.lemonsqueezy?.plans || [];
if (lsPlans.length > 0) {
  const plansCode = lsPlans.map((plan) => {
    const devId  = plan.variant_id_dev || plan.variant_id || '123456';
    const prodId = plan.variant_id || '456789';

    const features = (plan.features || [])
      .map(f => {
        const name = typeof f === 'string' ? f : (f.name || '');
        return `          { name: "${name}" }`;
      })
      .join(',\n');

    const featuresBlock = features.length > 0
      ? `[\n${features}\n        ]`
      : '[]';

    return [
      '      {',
      `        variantId:`,
      `          process.env.NODE_ENV === "development"`,
      `            ? "${devId}"`,
      `            : "${prodId}",`,
      plan.featured ? '        isFeatured: true,' : null,
      `        name: "${plan.name || ''}",`,
      `        description: "${plan.description || ''}",`,
      `        price: ${plan.price || 0},`,
      plan.price_anchor ? `        priceAnchor: ${plan.price_anchor},` : null,
      `        features: ${featuresBlock},`,
      '      }',
    ].filter(line => line !== null).join('\n');
  }).join(',\n');

  const lsBlock =
    `lemonsqueezy: {\n` +
    `    plans: [\n${plansCode},\n    ],\n` +
    `  },`;

  cfg = replaceBlock(cfg, 'lemonsqueezy', lsBlock);
}

write('config.ts', cfg);

// libs/seo.tsx
let seo = read('libs/seo.tsx');
const s = data.seo || {};

if (s.author_name) {
  seo = seo.replace(
    /(author:\s*\{[^}]*name:\s*)"[^"]*"/,
    `$1"${s.author_name}"`
  );
}
if (s.date_published) {
  seo = seo.replace(/(datePublished:\s*)"[^"]*"/, `$1"${s.date_published}"`);
}
if (s.application_category) {
  seo = seo.replace(/(applicationCategory:\s*)"[^"]*"/, `$1"${s.application_category}"`);
}

write('libs/seo.tsx', seo);

// next.config.js  — hostname R2 (solo si cdn_url es dominio custom)
const cdnUrl = e.cloudflare_r2?.cdn_url;
if (cdnUrl) {
  try {
    const hostname = new URL(cdnUrl).hostname;
    if (!hostname.endsWith('.r2.dev')) {
      let nc = read('next.config.js');
      nc = nc.replace(/hostname:\s*'\*\.r2\.dev'/, `hostname: '${hostname}'`);
      write('next.config.js', nc);
    }
  } catch {
    // URL inválida — se omite
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. npm install
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nInstalando dependencias…\n');
if (!run('npm install')) {
  console.warn('⚠️   npm install falló. Correr manualmente cuando sea posible.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Supabase migrations (opcional)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nAplicando migrations de Supabase (opcional)…');
const hasSupabaseCli = run('supabase --version', { stdio: 'ignore' });
if (hasSupabaseCli) {
  if (!run('supabase db push')) {
    console.warn(
      '⚠️   `supabase db push` falló. Aplicar supabase/migrations/0001_initial.sql ' +
      'manualmente desde el SQL Editor de Supabase Dashboard.'
    );
  }
} else {
  console.warn(
    '⚠️   Supabase CLI no encontrado. Aplicar supabase/migrations/0001_initial.sql ' +
    'manualmente desde el SQL Editor de Supabase Dashboard.'
  );
}

console.log('\nListo. Revisá los archivos y los pasos manuales en SETUP.md / skill setup-project.\n');
