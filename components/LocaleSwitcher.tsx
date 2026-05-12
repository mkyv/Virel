"use client";

import { useTransition, type ChangeEvent } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

// Selector de idioma para la landing. Cambia el locale en la URL manteniendo
// el pathname actual. Solo afecta la landing — la app (logueada) lee su locale
// desde profiles.locale / APP_LOCALE cookie y es independiente.
export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as Locale;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      disabled={isPending}
      aria-label="Language"
      className="select select-sm select-bordered w-auto"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
