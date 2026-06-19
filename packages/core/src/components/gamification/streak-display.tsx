import { Flame } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  compact?: boolean;
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  compact = false,
  className = "",
}: StreakDisplayProps) {
  const flameColor =
    currentStreak >= 30
      ? "text-red-500"
      : currentStreak >= 7
      ? "text-orange-500"
      : currentStreak >= 3
      ? "text-yellow-500"
      : "text-gray-400";

  const flameFill =
    currentStreak > 0
      ? currentStreak >= 30
        ? "fill-red-500"
        : currentStreak >= 7
        ? "fill-orange-500"
        : "fill-yellow-400"
      : "";

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 text-sm font-semibold ${className}`}
        title={`${currentStreak}-day streak`}
      >
        <Flame className={`h-4 w-4 ${flameColor} ${flameFill}`} />
        <span>{currentStreak}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
        <Flame className={`h-5 w-5 ${flameColor} ${flameFill}`} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{currentStreak}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Day Streak
          {longestStreak > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              (Best: {longestStreak})
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
