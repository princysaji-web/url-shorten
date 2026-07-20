"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  removeOrganizationMember,
  updateMemberRole,
} from "@/app/actions/organizations";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { OrgRole } from "@/lib/supabase/database.types";

export function MemberActions({
  organizationId,
  memberId,
  role,
  canManage,
  isSelf,
}: {
  organizationId: string;
  memberId: string;
  role: OrgRole;
  canManage: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!canManage || isSelf) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Member role"
        disabled={pending}
        value={role}
        className="flex h-8 rounded-md border border-input bg-transparent px-2 text-sm"
        onChange={(event) => {
          const nextRole = event.target.value as OrgRole;
          startTransition(async () => {
            await updateMemberRole(organizationId, memberId, nextRole);
            router.refresh();
          });
        }}
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await removeOrganizationMember(organizationId, memberId);
            router.refresh();
          });
        }}
      >
        {pending ? <Spinner label="Removing" /> : null}
        {pending ? "Removing…" : "Remove"}
      </Button>
    </div>
  );
}
