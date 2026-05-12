import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AuthForm from "@/components/AuthForm";
import config from "@/config";

export default async function SignUp() {
  const t = await getTranslations("app.signup");
  const tCommon = await getTranslations("common");

  return (
    <main className="p-8 md:p-24" data-theme={config.colors.theme}>
      <div className="text-center mb-4">
        <Link href="/" className="btn btn-ghost btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          {tCommon("home")}
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
        {t("title", { appName: config.appName })}
      </h1>

      <div className="max-w-xl mx-auto">
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
