import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";

// Auth gate for the /dashboard subtree (server component).
// /dashboard and /signin live outside the [locale] segment, so we use the
// plain Next.js redirect — no locale prefix needed.
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  return <>{children}</>;
}
