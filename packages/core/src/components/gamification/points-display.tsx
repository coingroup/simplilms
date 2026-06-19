import { Star } from "lucide-react";

interface PointsDisplayProps {
  total: number;
  compact?: boolean;
  className?: string;
}

export function PointsDisplay({
  total,
  compact = false,
  className = "",
}: PointsDisplayProps) {
  const formatted =
    total >= 1000 ? `${(total / 1000).toFixed(1)}k` : String(total);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 text-sm font-semibold ${className}`}
        title={`${total} total points`}
      >
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        <span>{formatted}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
        <Star className="h-5 w-5 text-yellow-600 fill-yellow-500" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{total.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Total Points</p>
      </div>
    </div>
  );
}
