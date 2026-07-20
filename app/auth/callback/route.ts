import { NextResponse } from "next/server";

import { getShortLinkDomain } from "@/lib/links/short-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") ? nextParam : "/dashboard";
  const appOrigin = getShortLinkDomain();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, appOrigin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", appOrigin));
}
