"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { updateName } from "./actions";

export default function NameForm({ currentName }: { currentName: string }) {
  const t = useTranslations("app.settings");
  const [value, setValue] = useState(currentName);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        await updateName(value);
        toast.success(t("success"));
      } catch {
        toast.error(t("error"));
      }
    });
  };

  const dirty = value.trim() !== currentName.trim();

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("namePlaceholder")}
        maxLength={100}
        className="input input-bordered flex-1"
        aria-label={t("nameLabel")}
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={isPending || !dirty || value.trim().length === 0}
      >
        {isPending && (
          <span className="loading loading-spinner loading-xs"></span>
        )}
        {t("nameSave")}
      </button>
    </form>
  );
}
