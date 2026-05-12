import { ReactNode } from "react";

// The root layout is intentionally a passthrough.
// The real <html>/<body> shell lives in app/[locale]/layout.tsx so it can
// set lang={locale} dynamically and wrap children with NextIntlClientProvider.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
