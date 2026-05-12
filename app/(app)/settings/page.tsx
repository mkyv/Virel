import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";
import ButtonAccount from "@/components/ButtonAccount";
import LocaleForm from "./locale-form";
import NameForm from "./name-form";
import SubscriptionPanel from "./subscription-panel";

export const dynamic = "force-dynamic";

// Página de configuración del usuario.
// - Email: read-only (es el login; cambios van por soporte).
// - Nombre: editable, guardado en user_metadata.
// - Idioma: editable, guardado en profiles.locale + cookie APP_LOCALE.
// - Suscripción: estado + botón al LemonSqueezy Customer Portal (que maneja
//   facturas, métodos de pago, cancelación, etc. — no replicamos eso acá).
export default async function Settings() {
  const t = await getTranslations("app.settings");
  const locale = await getLocale();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El layout actúa como auth gate; si llegamos acá, user existe.
  const email = user?.email ?? "";
  const name = (user?.user_metadata?.name as string | undefined) ?? "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("variant_id, has_access, subscription_status, subscription_renews_at")
    .eq("id", user?.id)
    .single();

  const plan = config.lemonsqueezy.plans.find(
    (p) => p.variantId === profile?.variant_id
  );

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <ButtonAccount />
        <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>

        {/* Email — read-only */}
        <div className="space-y-2">
          <label className="label">
            <span className="label-text">{t("emailLabel")}</span>
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="input input-bordered w-full max-w-md"
          />
          <p className="text-xs text-base-content/60">{t("emailHint")}</p>
        </div>

        {/* Name — editable */}
        <div className="space-y-2">
          <label className="label">
            <span className="label-text">{t("nameLabel")}</span>
          </label>
          <NameForm currentName={name} />
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="label">
            <span className="label-text">{t("languageLabel")}</span>
          </label>
          <LocaleForm currentLocale={locale} />
        </div>

        {/* Subscription */}
        <div className="space-y-2">
          <label className="label">
            <span className="label-text">{t("subscriptionLabel")}</span>
          </label>
          <SubscriptionPanel
            hasAccess={Boolean(profile?.has_access)}
            status={profile?.subscription_status ?? null}
            planName={plan?.name ?? null}
            renewsAt={profile?.subscription_renews_at ?? null}
          />
        </div>
      </section>
    </main>
  );
}
