"use client";

import { useRouter } from "next/navigation";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@simplilms/ui";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="font-heading text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this page. If you believe
            this is an error, please contact your administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push("/")}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
