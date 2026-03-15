"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@simplilms/ui";
import { Check, X, Loader2 } from "lucide-react";
import type { SectorModuleRow } from "../../actions/sector-modules";
import {
  activateSectorModule,
  deactivateSectorModule,
} from "../../actions/sector-modules";

interface SectorSubscriptionCardProps {
  module: SectorModuleRow;
  isSubscribed: boolean;
  subscriptionStatus?: string;
}

const STATUS_BADGE: Record<string, { label: string; variant: string }> = {
  active: { label: "Active", variant: "default" },
  trial: { label: "Trial", variant: "secondary" },
  expired: { label: "Expired", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

export function SectorSubscriptionCard({
  module,
  isSubscribed,
  subscriptionStatus,
}: SectorSubscriptionCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = isSubscribed
        ? await deactivateSectorModule(module.id)
        : await activateSectorModule(module.id);

      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const frameworks = Array.isArray(module.compliance_frameworks)
    ? module.compliance_frameworks
    : [];

  const badge = subscriptionStatus
    ? STATUS_BADGE[subscriptionStatus] || STATUS_BADGE.active
    : null;

  return (
    <Card
      className={`transition-all ${
        isSubscribed
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:border-muted-foreground/30"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">
              {module.display_name}
            </CardTitle>
            {module.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {module.description}
              </p>
            )}
          </div>
          {badge && (
            <Badge
              variant={badge.variant as any}
              className="text-[10px] shrink-0"
            >
              {badge.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Compliance frameworks */}
        {frameworks.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {frameworks.slice(0, 4).map((fw: string, i: number) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[10px] px-1.5 py-0"
              >
                {fw}
              </Badge>
            ))}
            {frameworks.length > 4 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{frameworks.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Price */}
        <div className="text-xs text-muted-foreground">
          ${(module.monthly_price_cents / 100).toFixed(0)}/month add-on
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
            {error}
          </div>
        )}

        {/* Toggle button */}
        <Button
          variant={isSubscribed ? "outline" : "default"}
          size="sm"
          className="w-full"
          onClick={handleToggle}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : isSubscribed ? (
            <>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Deactivate
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Activate
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
