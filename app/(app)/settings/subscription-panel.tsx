"use client";

import { useState } from "react";
import { useTranslations, useFormatter, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import apiClient from "@/libs/api";

interface Props {
  hasAccess: boolean;
  status: string | null;
  planName: string | null;
  renewsAt: string | null;
}

export default function SubscriptionPanel({
  hasAccess,
  status,
  planName,
  renewsAt,
}: Props) {
  const t = useTranslations("app.settings");
  const format = useFormatter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const openPortal = async () => {
    setIsLoading(true);
    try {
      const { url }: { url: string } = await apiClient.post(
        "/lemonsqueezy/create-portal",
        {}
      );
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  // Sin acceso → invitar a comprar.
  if (!hasAccess) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-base-content/70">
          {t("subscriptionInactive")}
        </span>
        <Link href="/#pricing" className="btn btn-primary btn-sm w-fit">
          {t("viewPlans")}
        </Link>
      </div>
    );
  }

  // Con acceso → mostrar badge + fecha según status.
  const isCancelled = status === "cancelled";
  const badgeClass = isCancelled ? "badge-warning" : "badge-success";
  const badgeLabel = isCancelled
    ? t("subscriptionCancelled")
    : t("subscriptionActive");

  const renewsDate = renewsAt ? new Date(renewsAt) : null;
  const formattedDate = renewsDate
    ? format.dateTime(renewsDate, { dateStyle: "long" })
    : null;
  const dateLine = formattedDate
    ? isCancelled
      ? t("accessUntil", { date: formattedDate })
      : t("nextBilling", { date: formattedDate })
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={`badge ${badgeClass} badge-sm`}>{badgeLabel}</span>
        {planName && <span className="font-medium">{planName}</span>}
      </div>
      {dateLine && (
        <p className="text-sm text-base-content/70" lang={locale}>
          {dateLine}
        </p>
      )}
      <button
        className="btn btn-outline btn-sm w-fit"
        onClick={openPortal}
        disabled={isLoading}
      >
        {isLoading && (
          <span className="loading loading-spinner loading-xs"></span>
        )}
        {t("managePlan")}
      </button>
    </div>
  );
}
