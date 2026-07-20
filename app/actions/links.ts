"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { invalidateCachedLink } from "@/lib/cache/link-cache";
import { generateShortCode, isValidShortCode } from "@/lib/links/generate-short-code";
import { parseLinkFormData } from "@/lib/links/validation";
import { getActiveOrganizationContext } from "@/lib/organizations/context";
import { createClient } from "@/lib/supabase/server";

const MAX_SHORT_CODE_ATTEMPTS = 5;

export type LinkActionState = {
  error: string | null;
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function createLink(
  _prevState: LinkActionState,
  formData: FormData,
): Promise<LinkActionState> {
  const parsed = parseLinkFormData(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid form data.",
    };
  }

  const { supabase, user } = await requireUser();
  const { active } = await getActiveOrganizationContext(user.id);
  if (!active) {
    return { error: "Join or create an organization before creating links." };
  }

  const values = parsed.data;

  for (let attempt = 0; attempt < MAX_SHORT_CODE_ATTEMPTS; attempt++) {
    const shortCode = generateShortCode();
    if (!isValidShortCode(shortCode)) {
      continue;
    }

    const { data, error } = await supabase
      .from("links")
      .insert({
        short_code: shortCode,
        destination_url: values.destinationUrl,
        utm_source: values.utmSource,
        utm_medium: values.utmMedium,
        utm_campaign: values.utmCampaign,
        utm_term: values.utmTerm,
        utm_content: values.utmContent,
        created_by: user.id,
        organization_id: active.organization.id,
      })
      .select("id")
      .single();

    if (!error && data?.id) {
      revalidatePath("/dashboard");
      revalidatePath("/links");
      redirect(`/links/${data.id}`);
    }

    if (!error) {
      continue;
    }

    if (error.code === "23505") {
      continue;
    }

    return { error: error.message ?? "Failed to create link." };
  }

  return { error: "Could not generate a unique short code. Please try again." };
}

export async function updateLink(
  linkId: string,
  _prevState: LinkActionState,
  formData: FormData,
): Promise<LinkActionState> {
  const parsed = parseLinkFormData(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid form data.",
    };
  }

  const { supabase } = await requireUser();
  const values = parsed.data;

  const { data, error } = await supabase
    .from("links")
    .update({
      destination_url: values.destinationUrl,
      utm_source: values.utmSource,
      utm_medium: values.utmMedium,
      utm_campaign: values.utmCampaign,
      utm_term: values.utmTerm,
      utm_content: values.utmContent,
      is_active: values.isActive,
    })
    .eq("id", linkId)
    .select("short_code")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (data?.short_code) {
    invalidateCachedLink(data.short_code);
  }

  revalidatePath("/dashboard");
  revalidatePath("/links");
  revalidatePath(`/links/${linkId}`);
  redirect(`/links/${linkId}`);
}

export async function setLinkActive(linkId: string, isActive: boolean) {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("links")
    .update({ is_active: isActive })
    .eq("id", linkId)
    .select("short_code")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (data?.short_code) {
    invalidateCachedLink(data.short_code);
  }

  revalidatePath("/dashboard");
  revalidatePath("/links");
  revalidatePath(`/links/${linkId}`);
  return { error: null };
}

export async function deleteLink(linkId: string) {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("links")
    .delete()
    .eq("id", linkId)
    .select("short_code")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (data?.short_code) {
    invalidateCachedLink(data.short_code);
  }

  revalidatePath("/dashboard");
  revalidatePath("/links");
  return { error: null };
}
