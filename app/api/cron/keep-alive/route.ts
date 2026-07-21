import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Lightweight DB ping so Supabase free-tier projects stay active.
 * Invoked by Vercel Cron (see vercel.json).
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("organizations")
      .select("id")
      .limit(1);

    if (error) {
      console.error("[keep-alive] Supabase ping failed:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Keep-alive failed";
    console.error("[keep-alive]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
