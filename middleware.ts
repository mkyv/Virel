import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const handleI18n = createIntlMiddleware(routing);

// Routes that belong to the application (NOT the landing).
// These do NOT carry the locale in their URL — they read it from the
// NEXT_LOCALE cookie inside their layout. Keep this list in sync with the
// folders under app/(app)/.
const APP_ROUTES = ["/dashboard", "/signin", "/signup", "/settings"];

function isAppRoute(pathname: string): boolean {
  return APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  await supabase.auth.getUser();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Application routes: skip next-intl entirely. Just refresh Supabase
  // session on a clean response so cookies are preserved.
  if (isAppRoute(pathname)) {
    const response = NextResponse.next({ request });
    await refreshSupabaseSession(request, response);
    return response;
  }

  // Landing routes: next-intl handles locale detection / redirect (and
  // setting NEXT_LOCALE cookie because localeDetection: true), then Supabase
  // writes session cookies on top of the same response.
  const response = handleI18n(request);
  await refreshSupabaseSession(request, response);
  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, API routes, and SEO files (sitemap/robots).
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
