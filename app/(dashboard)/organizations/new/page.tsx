import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateOrganizationForm } from "@/components/organizations/create-organization-form";

export default function NewOrganizationPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create organization
        </h1>
        <p className="text-muted-foreground">
          Create CareStack, VoiceStack, OSDental, or any team workspace. You
          become the admin and can invite members.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Organization details</CardTitle>
          <CardDescription>
            Members of an organization share the same links dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm />
        </CardContent>
      </Card>
    </div>
  );
}
