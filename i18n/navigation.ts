import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Drop-in replacements for next/link, useRouter, redirect, etc.
// that automatically include the current locale in URLs.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
