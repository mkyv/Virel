import { getTranslations } from "next-intl/server";
import ButtonSignin from "@/components/ButtonSignin";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default async function Page() {
  const t = await getTranslations("landing.page");

  return (
    <>
      <header className="p-4 flex justify-end items-center gap-3 max-w-7xl mx-auto">
        <LocaleSwitcher />
        <ButtonSignin text={t("loginCta")} />
      </header>

      <main>
        <section className="flex flex-col items-center justify-center text-center gap-12 px-8 py-24">
          <h1 className="text-3xl font-extrabold">{t("title")}</h1>

          <p className="text-lg opacity-80">{t("subtitle")}</p>

          <a className="btn btn-primary" href="#">
            {t("docsCta")}{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </section>
      </main>
    </>
  );
}
