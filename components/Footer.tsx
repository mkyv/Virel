import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import config from "@/config";
import logo from "@/app/icon.png";

const Footer = async () => {
  const t = await getTranslations("landing.footer");

  return (
    <footer className="bg-base-200 border-t border-base-content/10">
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className=" flex lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
          <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
            <Link
              href="/#"
              aria-current="page"
              className="flex gap-2 justify-center md:justify-start items-center"
            >
              <Image
                src={logo}
                alt={t("logoAlt", { appName: config.appName })}
                priority={true}
                className="w-6 h-6"
                width={24}
                height={24}
              />
              <strong className="font-extrabold tracking-tight text-base md:text-lg">
                {config.appName}
              </strong>
            </Link>

            <p className="mt-3 text-sm text-base-content/80">
              {config.appDescription}
            </p>
            <p className="mt-3 text-sm text-base-content/60">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
            <div className="mt-4 flex justify-center md:justify-start">
              <LocaleSwitcher />
            </div>
          </div>
          <div className="flex-grow flex flex-wrap justify-center -mb-10 md:mt-0 mt-10 text-center">
            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-base-content tracking-widest text-sm md:text-left mb-3">
                {t("linksTitle")}
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                {config.resend.supportEmail && (
                  <a
                    href={`mailto:${config.resend.supportEmail}`}
                    target="_blank"
                    className="link link-hover"
                    aria-label="Contact Support"
                  >
                    {t("links.support")}
                  </a>
                )}
                <Link href="/#pricing" className="link link-hover">
                  {t("links.pricing")}
                </Link>
                <Link href="/blog" className="link link-hover">
                  {t("links.blog")}
                </Link>
                <a href="/#" target="_blank" className="link link-hover">
                  {t("links.affiliates")}
                </a>
              </div>
            </div>

            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-base-content tracking-widest text-sm md:text-left mb-3">
                {t("legalTitle")}
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                <Link href="/tos" className="link link-hover">
                  {t("legal.tos")}
                </Link>
                <Link href="/privacy-policy" className="link link-hover">
                  {t("legal.privacyPolicy")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
