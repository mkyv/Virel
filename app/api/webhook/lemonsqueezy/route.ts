import config from "@/config";
import { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const text = await req.text();

  const hmac = crypto.createHmac(
    "sha256",
    process.env.LEMONSQUEEZY_SIGNING_SECRET
  );
  const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8");
  const headersList = await headers();
  const signature = Buffer.from(headersList.get("x-signature") ?? "", "utf8");

  if (!crypto.timingSafeEqual(digest, signature)) {
    return new Response("Invalid signature.", { status: 400 });
  }

  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const payload = JSON.parse(text);
  const eventName = payload.meta.event_name;
  const customerId = payload.data.attributes.customer_id.toString();

  try {
    switch (eventName) {
      case "order_created": {
        const userId = payload.meta?.custom_data?.userId;
        const email = payload.data.attributes.user_email;
        const variantId =
          payload.data.attributes.first_order_item.variant_id.toString();
        const plan = config.lemonsqueezy.plans.find(
          (p) => p.variantId === variantId
        );

        if (!plan) break;

        let user;
        if (!userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", email)
            .single();

          if (profile) {
            user = profile;
          } else {
            const { data } = await supabase.auth.admin.createUser({ email });
            user = data?.user;
          }
        } else {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          user = profile;
        }

        await supabase
          .from("profiles")
          .update({
            customer_id: customerId,
            variant_id: variantId,
            has_access: true,
          })
          .eq("id", user?.id);

        break;
      }

      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed": {
        // Subscription activa: sincronizar la próxima fecha de renovación
        // y marcar status='active'. `renews_at` viene como ISO string.
        const renewsAt = payload.data.attributes.renews_at ?? null;

        await supabase
          .from("profiles")
          .update({
            subscription_status: "active",
            subscription_renews_at: renewsAt,
            has_access: true,
          })
          .eq("customer_id", customerId);

        break;
      }

      case "subscription_cancelled": {
        // El user pidió cancelar pero MANTIENE acceso hasta el fin del período pago.
        // Solo marcamos status='cancelled'. has_access y renews_at quedan intactos;
        // se limpian en `subscription_expired` cuando LemonSqueezy lo dispara.
        await supabase
          .from("profiles")
          .update({ subscription_status: "cancelled" })
          .eq("customer_id", customerId);

        break;
      }

      case "subscription_expired": {
        // Llegó la fecha de fin: revocar acceso y limpiar metadata de subscription.
        await supabase
          .from("profiles")
          .update({
            has_access: false,
            subscription_status: null,
            subscription_renews_at: null,
          })
          .eq("customer_id", customerId);

        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("lemonsqueezy webhook error:", e.message);
  }

  return NextResponse.json({});
}
