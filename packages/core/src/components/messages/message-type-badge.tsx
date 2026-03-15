import { Badge } from "@simplilms/ui";

const MESSAGE_TYPE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  general: { label: "General", variant: "secondary" },
  payment_update: { label: "Payment", variant: "default" },
  emergency: { label: "Emergency", variant: "destructive" },
  class_reminder: { label: "Class", variant: "outline" },
};

export function MessageTypeBadge({ type }: { type: string }) {
  const config = MESSAGE_TYPE_CONFIG[type] || {
    label: type,
    variant: "secondary" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
