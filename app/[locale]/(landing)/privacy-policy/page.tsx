import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getSEOTags } from "@/libs/seo";
import { getMdxSource } from "@/libs/mdx";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

export default async function PrivacyPolicy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const source = await getMdxSource(locale, "legal", "privacy-policy");

  return (
    <main className="max-w-2xl mx-auto">
      <div className="p-5 space-y-6">
        <Link href="/" className="btn btn-ghost">
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
          Back
        </Link>
        <h1 className="text-3xl font-extrabold">
          Privacy Policy for {config.appName}
        </h1>
        <article className="prose max-w-none">
          <MDXRemote source={source} />
        </article>
      </div>
    </main>
  );
}
