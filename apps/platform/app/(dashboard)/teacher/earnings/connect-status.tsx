"use client";

import { useState, useTransition } from "react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { CheckCircle, ExternalLink, LinkIcon, XCircle } from "lucide-react";
import type { ConnectAccountStatus } from "@simplilms/core/actions/stripe-connect";

interface ConnectStatusCardProps {
  status: ConnectAccountStatus;
  onOnboard: () => Promise<{ success: boolean; url?: string; error?: string }>;
  onDashboard: () => Promise<{ success: boolean; url?: string; error?: string }>;
}

export function ConnectStatusCard({
  status,
  onOnboard,
  onDashboard,
}: ConnectStatusCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleOnboard = () => {
    setError("");
    startTransition(async () => {
      const result = await onOnboard();
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error || "Failed to start onboarding");
      }
    });
  };

  const handleDashboard = () => {
    setError("");
    startTransition(async () => {
      const result = await onDashboard();
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      } else {
        setError(result.error || "Failed to open dashboard");
      }
    });
  };

  if (!status.isConnected) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-orange-600" />
            Connect Your Stripe Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To receive payouts for your commission earnings, connect your bank
            account through Stripe. This only takes a few minutes.
          </p>
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <Button onClick={handleOnboard} disabled={isPending}>
            {isPending ? "Setting up..." : "Connect with Stripe"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!status.detailsSubmitted) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <XCircle className="h-5 w-5 text-yellow-600" />
            Stripe Setup Incomplete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your Stripe account is created but setup is incomplete. Please
            finish onboarding to receive payouts.
          </p>
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <Button onClick={handleOnboard} disabled={isPending}>
            {isPending ? "Loading..." : "Complete Setup"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Stripe Connected</span>
            <Badge variant="outline" className="text-green-700 border-green-300">
              {status.payoutsEnabled ? "Payouts Active" : "Pending Verification"}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleDashboard} disabled={isPending}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Stripe Dashboard
          </Button>
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
