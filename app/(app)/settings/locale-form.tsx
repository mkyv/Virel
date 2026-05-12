"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { routing, type Locale } from "@/i18n/routing";
import { updateLocale } from "./actions";

export default function LocaleForm({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const t = useTranslations("app.settings");
  const [value, setValue] = useState(currentLocale);
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as Locale;
    setValue(next);
    startTransition(async () => {
      try {
        await updateLocale(next);
        toast.success(t("success"));
      } catch {
        toast.error(t("error"));
        // Revertir el select al valor previo si el update falla.
        setValue(currentLocale);
      }
    });
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={isPending}
      className="select select-bordered w-full max-w-xs"
      aria-label={t("languageLabel")}
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
