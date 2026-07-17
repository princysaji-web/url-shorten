"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseLinkFormData } from "@/lib/links/validation";
import { createClient } from "@/lib/supabase/server";

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

  const { supabase } = await requireUser();
  const values = parsed.data;

  const { data, error } = await supabase.rpc("create_link", {
    p_destination_url: values.destinationUrl,
    p_utm_source: values.utmSource,
    p_utm_medium: values.utmMedium,
    p_utm_campaign: values.utmCampaign,
    p_utm_term: values.utmTerm,
    p_utm_content: values.utmContent,
  });

  if (error) {
    return { error: error.message ?? "Failed to create link." };
  }

  if (!data?.id) {
    return { error: "Failed to create link." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/links");
  redirect(`/links/${data.id}`);
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

  const { error } = await supabase
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
    .eq("id", linkId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/links");
  revalidatePath(`/links/${linkId}`);
  redirect(`/links/${linkId}`);
}

export async function setLinkActive(linkId: string, isActive: boolean) {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("links")
    .update({ is_active: isActive })
    .eq("id", linkId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/links");
  revalidatePath(`/links/${linkId}`);
  return { error: null };
}
