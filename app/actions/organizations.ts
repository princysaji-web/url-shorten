"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ACTIVE_ORG_COOKIE,
  slugifyOrgName,
} from "@/lib/organizations/context";
import { getAuthCallbackUrl, getShortLinkDomain, withAppAuthRedirect } from "@/lib/links/short-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { OrgRole } from "@/lib/supabase/database.types";

export type OrgActionState = {
  error: string | null;
  success?: string | null;
  /** One-time link for new users to set their own password (not emailed). */
  setupLink?: string | null;
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

async function requireOrgAdmin(organizationId: string) {
  const { supabase, user } = await requireUser();
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || membership.role !== "admin") {
    return { supabase, user, error: "Only organization admins can do that." };
  }

  return { supabase, user, error: null as string | null };
}

export async function setActiveOrganization(organizationId: string) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return { error: "You are not a member of that organization." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function createOrganization(
  _prevState: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) {
    return { error: "Organization name must be at least 2 characters." };
  }

  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugifyOrgName(slugInput || name);
  if (!slug) {
    return { error: "Enter a valid organization slug." };
  }

  const { supabase, user } = await requireUser();

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      slug,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (orgError || !org) {
    if (orgError?.code === "23505") {
      return { error: "That organization slug is already taken." };
    }
    return { error: orgError?.message ?? "Failed to create organization." };
  }

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: "admin",
    });

  if (memberError) {
    return { error: memberError.message };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, org.id, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function addOrganizationMember(
  organizationId: string,
  _prevState: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "member") as OrgRole;

  if (!email) {
    return { error: "Email is required." };
  }
  if (role !== "admin" && role !== "member") {
    return { error: "Invalid role." };
  }

  const gate = await requireOrgAdmin(organizationId);
  if (gate.error) {
    return { error: gate.error };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Service unavailable." };
  }

  const redirectTo = getAuthCallbackUrl();
  let userId = await findAuthUserIdByEmail(admin, email);
  let setupLink: string | null = null;

  if (!userId) {
    // Creates the auth user and returns a setup link — does not send email.
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "invite",
        email,
        options: {
          data: {
            organization_id: organizationId,
            invited_role: role,
          },
          redirectTo,
        },
      });

    if (linkError || !linkData.user) {
      return {
        error: linkError?.message ?? "Failed to create member account.",
      };
    }

    userId = linkData.user.id;
    const rawLink = linkData.properties?.action_link ?? null;

    if (!rawLink) {
      return {
        error:
          "Member was prepared but no setup link was returned. Check Supabase Auth settings.",
      };
    }

    // generateLink often embeds Site URL (localhost); force our public domain.
    setupLink = withAppAuthRedirect(rawLink);
  }

  const { data: existingMember } = await admin
    .from("organization_members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingMember) {
    return { error: "That user is already a member of this organization." };
  }

  const { error: memberError } = await admin
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role,
    });

  if (memberError) {
    return { error: memberError.message };
  }

  revalidatePath("/organization");

  if (setupLink) {
    return {
      error: null,
      success: `Added ${email}. Share this setup link so they can set their own password (no email was sent).`,
      setupLink,
    };
  }

  return {
    error: null,
    success: `Added ${email}. They can sign in with their existing password at ${getShortLinkDomain()}/login.`,
    setupLink: null,
  };
}

async function findAuthUserIdByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) {
      break;
    }
    const match = data.users.find(
      (authUser) => authUser.email?.toLowerCase() === email,
    );
    if (match) {
      return match.id;
    }
    if (data.users.length < 200) {
      break;
    }
  }
  return null;
}

export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  role: OrgRole,
) {
  const gate = await requireOrgAdmin(organizationId);
  if (gate.error) {
    return { error: gate.error };
  }

  if (role !== "admin" && role !== "member") {
    return { error: "Invalid role." };
  }

  const { error } = await gate.supabase
    .from("organization_members")
    .update({ role })
    .eq("id", memberId)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/organization");
  return { error: null };
}

export async function removeOrganizationMember(
  organizationId: string,
  memberId: string,
) {
  const gate = await requireOrgAdmin(organizationId);
  if (gate.error) {
    return { error: gate.error };
  }

  const { data: target } = await gate.supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("id", memberId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!target) {
    return { error: "Member not found." };
  }

  if (target.user_id === gate.user.id) {
    return { error: "You cannot remove yourself." };
  }

  if (target.role === "admin") {
    const { count } = await gate.supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("role", "admin");

    if ((count ?? 0) <= 1) {
      return { error: "Cannot remove the last admin." };
    }
  }

  const { error } = await gate.supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/organization");
  return { error: null };
}
