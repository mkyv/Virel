import { getTranslations } from "next-intl/server";
import ButtonAccount from "@/components/ButtonAccount";

export const dynamic = "force-dynamic";

// Página privada. El auth gate vive en el layout padre (app/(app)/dashboard/layout.tsx).
export default async function Dashboard() {
  const t = await getTranslations("app.dashboard");

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <ButtonAccount />
        <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
      </section>
    </main>
  );
}
