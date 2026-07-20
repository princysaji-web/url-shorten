import { NextResponse, type NextRequest } from "next/server";

import { getCachedLinkByShortCode } from "@/lib/cache/link-cache";
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

  let link;
  try {
    link = await getCachedLinkByShortCode(shortCode);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("SUPABASE_SERVICE_ROLE_KEY") || message.includes("NEXT_PUBLIC_SUPABASE_URL")) {
      return new NextResponse("Service unavailable", { status: 503 });
    }
    console.error("Short link lookup failed:", message);
    return new NextResponse("Not found", { status: 404 });
  }

  if (!link) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!link.is_active) {
    return new NextResponse("This link is no longer active.", { status: 410 });
  }

  try {
    const admin = createAdminClient();
    const { error: clickError } = await admin.from("link_clicks").insert({
      link_id: link.id,
      user_agent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
    });

    if (clickError) {
      console.error("Click tracking failed:", clickError.message);
    }
  } catch (error) {
    console.error(
      "Click tracking skipped:",
      error instanceof Error ? error.message : error,
    );
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
