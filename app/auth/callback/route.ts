import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { getShortLinkDomain } from "@/lib/links/short-url";
import type { Database } from "@/lib/supabase/database.types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") ? nextParam : "/dashboard";
  const appOrigin = getShortLinkDomain();

  const redirectWithCookies = (path: string) => {
    const response = NextResponse.redirect(new URL(path, appOrigin));

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    return { response, supabase };
  };

  // App-owned invite/setup links (bypass supabase.co/auth/v1/verify + Site URL)
  if (tokenHash && type) {
    const { response, supabase } = redirectWithCookies(next);
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (error) {
      console.error("Auth verifyOtp failed:", error.message);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, appOrigin),
      );
    }

    return response;
  }

  if (code) {
    const { response, supabase } = redirectWithCookies(next);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth code exchange failed:", error.message);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, appOrigin),
      );
    }

    return response;
  }

  return NextResponse.redirect(new URL("/login?error=auth", appOrigin));
}
