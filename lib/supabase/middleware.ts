import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isValidShortCode } from "@/lib/links/generate-short-code";
import type { Database } from "@/lib/supabase/database.types";

function redirectDashboardShortCode(request: NextRequest): NextResponse | null {
  const match = request.nextUrl.pathname.match(/^\/dashboard\/([^/]+)\/?$/);
  if (!match) {
    return null;
  }

  const shortCode = match[1];
  if (!isValidShortCode(shortCode)) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${shortCode}`;
  return NextResponse.redirect(url, 302);
}

export async function updateSession(request: NextRequest) {
  const shortCodeRedirect = redirectDashboardShortCode(request);
  if (shortCodeRedirect) {
    return shortCodeRedirect;
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === "/login";
  const isAuthFlowRoute = pathname.startsWith("/auth/");
  const isProtectedRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/links") ||
    pathname.startsWith("/organization") ||
    pathname === "/organizations/new";

  if (!user && (isProtectedRoute || pathname === "/auth/set-password")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Logged-in users hitting `/` always land on the dashboard
  if (user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Allow /auth/callback without forcing login redirect
  if (!user && isAuthFlowRoute && pathname !== "/auth/set-password") {
    return supabaseResponse;
  }

  return supabaseResponse;
}
