import { NextResponse, type NextRequest } from "next/server";

import { buildDestinationUrl } from "@/lib/links/build-destination-url";
import { isValidShortCode } from "@/lib/links/generate-short-code";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await context.params;

  if (!isValidShortCode(shortCode)) {
    return new NextResponse("Not found", { status: 404 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return new NextResponse("Service unavailable", { status: 503 });
  }

  const { data: link, error } = await admin
    .from("links")
    .select(
      "id, destination_url, utm_source, utm_medium, utm_campaign, utm_term, utm_content, is_active",
    )
    .eq("short_code", shortCode)
    .maybeSingle();

  if (error) {
    console.error("Short link lookup failed:", error.message);
    return new NextResponse("Not found", { status: 404 });
  }

  if (!link) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!link.is_active) {
    return new NextResponse("This link is no longer active.", { status: 410 });
  }

  const { error: clickError } = await admin.from("link_clicks").insert({
    link_id: link.id,
    user_agent: request.headers.get("user-agent"),
    referer: request.headers.get("referer"),
  });

  if (clickError) {
    console.error("Click tracking failed:", clickError.message);
  }

  const destination = buildDestinationUrl({
    destinationUrl: link.destination_url,
    utmSource: link.utm_source,
    utmMedium: link.utm_medium,
    utmCampaign: link.utm_campaign,
    utmTerm: link.utm_term,
    utmContent: link.utm_content,
  });

  return NextResponse.redirect(destination, 302);
}
