"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/libs/supabase/server";
import { routing, type Locale } from "@/i18n/routing";

// Actualiza la preferencia de idioma del usuario logueado:
// 1. UPDATE profiles.locale (source of truth).
// 2. Sincroniza cookie APP_LOCALE (cache que lee (app)/layout.tsx).
// 3. revalidatePath("/", "layout") para que el shell de la app re-renderice en el nuevo idioma.
export async function updateLocale(locale: string): Promise<void> {
  if (!routing.locales.includes(locale as Locale)) {
    throw new Error("Invalid locale");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ locale })
    .eq("id", user.id);

  if (error) throw error;

  const cookieStore = await cookies();
  cookieStore.set("APP_LOCALE", locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
}

// Actualiza el nombre del usuario en Supabase Auth (user_metadata.name).
// Para que se refleje en ButtonAccount / ButtonSignin (que leen user_metadata.name)
// hay que recargar la sesión cliente — se hace con revalidatePath.
export async function updateName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 100) {
    throw new Error("Invalid name");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.auth.updateUser({
    data: { name: trimmed },
  });

  if (error) throw error;

  revalidatePath("/", "layout");
}
