import { NextResponse, NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { rateLimit } from "@/libs/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Captura emails para la lista de espera (waitlist) desde <ButtonLead />.
// - Rate-limit: 5 requests/min por IP.
// - Insert con onConflict: ignoreDuplicates para no romper si el mismo email
//   se registra dos veces. Devolvemos 200 en ambos casos para no filtrar
//   quién ya está registrado.
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const limit = rateLimit(`lead:${ip}`, 5, 60_000);
  if (!limit.success) {
    const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  let body: { email?: unknown } | null = null;
  try {
    body = await req.json();
  } catch {
    // body queda null; cae al guard de abajo.
  }
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = new SupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("leads")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

    if (error) throw error;

    // (Opcional) Enviar email de bienvenida con Resend (libs/resend.ts).
    // Se omite por defecto: requiere dominio verificado y plantilla del proyecto.

    return NextResponse.json({});
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Could not save lead";
    console.error("Lead capture error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
