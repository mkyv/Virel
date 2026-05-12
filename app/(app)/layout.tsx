import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "../globals.css";

const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

// La app autenticada no se indexa.
export const metadata = {
  ...getSEOTags(),
  robots: { index: false, follow: false },
};

// Layout para la sección app. URL sin prefix de locale.
// El locale lo resuelve `i18n/request.ts` desde cookies (APP_LOCALE > NEXT_LOCALE >
// defaultLocale). Acá solo lo consumimos via getLocale() / getMessages() para
// renderizar el shell. Los cambios de locale (login, /settings) escriben las
// cookies directamente.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-theme={config.colors.theme}
      className={font.className}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
