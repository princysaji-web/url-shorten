import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/dashboard";

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Link Shortener</CardTitle>
          <CardDescription>
            Sign in with your internal account to manage short links and QR
            codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm nextPath={nextPath} />
        </CardContent>
      </Card>
    </div>
  );
}
