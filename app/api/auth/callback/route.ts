import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/server";
import { routing, type Locale } from "@/i18n/routing";
import config from "@/config";

export const dynamic = "force-dynamic";

// Callback de auth. Dos flujos lo invocan:
//   1. OAuth (Google, etc.): viene con `?code=...` → exchangeCodeForSession.
//   2. OTP verify (signInWithOtp + verifyOtp): el cliente navega acá sin code
//      una vez ya verificado, para que sincronicemos APP_LOCALE.
//
// En ambos casos:
//   - Si es primer login y hay cache locale (APP_LOCALE o NEXT_LOCALE), se persiste
//     a profiles.locale (el trigger lo crea con 'en' por default).
//   - Logins subsiguientes: profiles.locale manda → cookie APP_LOCALE sync.
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await syncAppLocale(supabase, user);
  }

  return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
}

function pickValidLocale(value: string | undefined): Locale | null {
  return value && routing.locales.includes(value as Locale)
    ? (value as Locale)
    : null;
}

async function syncAppLocale(supabase: SupabaseClient, user: User) {
  const cookieStore = await cookies();

  const cacheLocale =
    pickValidLocale(cookieStore.get("APP_LOCALE")?.value) ??
    pickValidLocale(cookieStore.get("NEXT_LOCALE")?.value);

  // ¿Es el primer login? Supabase deja created_at === last_sign_in_at en signup.
  // Tolerancia de 10s por si Supabase introduce un microdesfase.
  const createdAt = new Date(user.created_at).getTime();
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).getTime()
    : createdAt;
  const isSignup = Math.abs(createdAt - lastSignIn) < 10_000;

  let resolvedLocale: Locale;

  if (isSignup && cacheLocale) {
    // Signup con preferencia previa: heredar al profile recién creado por trigger.
    await supabase
      .from("profiles")
      .update({ locale: cacheLocale })
      .eq("id", user.id);
    resolvedLocale = cacheLocale;
  } else {
    // Signin (o signup sin cache): profile manda.
    const { data: profile } = await supabase
      .from("profiles")
      .select("locale")
      .eq("id", user.id)
      .single();
    resolvedLocale =
      pickValidLocale(profile?.locale) ?? routing.defaultLocale;
  }

  cookieStore.set("APP_LOCALE", resolvedLocale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 año
  });
}
