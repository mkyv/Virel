import type { JSX } from "react";
import type { StaticImageData } from "next/image";
import mirkoImg from "@/app/[locale]/(landing)/blog/_assets/images/authors/mirko.png";

// ==================================================================================================================================================================
// BLOG CATEGORIES 🏷️
// ==================================================================================================================================================================

export type categoryType = {
  slug: string;
  title: string;
  titleShort?: string;
  description: string;
  descriptionShort?: string;
};

// Slugs used to generate /blog/category/[categoryId] pages.
const categorySlugs: { [key: string]: string } = {
  feature: "feature",
  tutorial: "tutorial",
};

export const categories: categoryType[] = [
  {
    slug: categorySlugs.feature,
    title: "New Features",
    titleShort: "Features",
    description:
      "Updates and new features added to the product.",
    descriptionShort: "Latest features.",
  },
  {
    slug: categorySlugs.tutorial,
    title: "How Tos & Tutorials",
    titleShort: "Tutorials",
    description: "Step-by-step guides to get the most out of the product.",
    descriptionShort: "Step-by-step tutorials.",
  },
];

// ==================================================================================================================================================================
// BLOG AUTHORS 📝
// ==================================================================================================================================================================

export type authorType = {
  slug: string;
  name: string;
  job: string;
  description: string;
  avatar: StaticImageData | string;
  socials?: {
    name: string;
    icon: JSX.Element;
    url: string;
  }[];
};

// Social icons (LinkedIn, GitHub, etc.) iban acá como helper. Quitados porque
// el autor placeholder no tiene socials. Para agregarlos: definir un map de
// `{name, svg}` y referenciarlo desde `authors[].socials[]`.

// Slugs used to generate /blog/author/[authorId] pages.
const authorSlugs: {
  [key: string]: string;
} = {
  mirko: "mirko",
};

export const authors: authorType[] = [
  {
    slug: authorSlugs.mirko,
    name: "Mirko",
    job: "Maker of Virel",
    description:
      "Builder. Working on the next thing. Replace this bio with the author's real description.",
    avatar: mirkoImg,
    // Social links: add the ones the author actually uses. Empty array if none.
    socials: [],
  },
];

// ==================================================================================================================================================================
// BLOG ARTICLES 📚
// ==================================================================================================================================================================

export type articleType = {
  slug: string;
  title: string;
  description: string;
  categories: categoryType[];
  author: authorType;
  publishedAt: string;
  image: {
    src?: StaticImageData;
    urlRelative: string;
    alt: string;
  };
  content: JSX.Element;
};

// Shared styles for article body content. Updating them updates every article.
const styles: {
  [key: string]: string;
} = {
  h2: "text-2xl lg:text-4xl font-bold tracking-tight mb-4 text-base-content",
  h3: "text-xl lg:text-2xl font-bold tracking-tight mb-2 text-base-content",
  p: "text-base-content/90 leading-relaxed",
  ul: "list-inside list-disc text-base-content/90 leading-relaxed",
  li: "list-item",
  code: "text-sm font-mono bg-neutral text-neutral-content p-6 rounded-box my-4 overflow-x-scroll select-all",
  codeInline:
    "text-sm font-mono bg-base-300 px-1 py-0.5 rounded-box select-all",
};

export const articles: articleType[] = [
  {
    slug: "welcome-to-virel",
    title: "Welcome to Virel",
    description:
      "Virel is a Next.js 15 boilerplate to ship SaaS faster: Supabase auth, LemonSqueezy payments, i18n híbrido, MDX para contenido y más.",
    categories: [
      categories.find((category) => category.slug === categorySlugs.feature),
    ],
    author: authors.find((author) => author.slug === authorSlugs.mirko),
    publishedAt: "2026-01-01",
    image: {
      urlRelative: "/blog/welcome-to-virel/header.jpg",
      alt: "Welcome to Virel",
    },
    content: (
      <>
        <section>
          <h2 className={styles.h2}>What is Virel?</h2>
          <p className={styles.p}>
            Virel is a Next.js 15 boilerplate to ship SaaS faster. It bundles
            Supabase auth, LemonSqueezy payments, hybrid i18n (URL-prefixed
            landing + profile-driven app), MDX for long-form content, Tailwind v4
            with DaisyUI v5, and the SEO essentials.
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>Replace this article</h3>
          <p className={styles.p}>
            This is a placeholder article. Edit{" "}
            <span className={styles.codeInline}>
              app/[locale]/(landing)/blog/_assets/content.tsx
            </span>{" "}
            to add your own posts, categories and authors.
          </p>
        </section>
      </>
    ),
  },
];
