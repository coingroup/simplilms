import { Trophy } from "lucide-react";
import { BadgeCard } from "./badge-card";
import type { StudentBadgeRow } from "../../actions/gamification";

interface BadgeGridProps {
  badges: StudentBadgeRow[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
        <Trophy className="h-12 w-12 text-gray-200" />
        <p className="text-sm font-medium">No badges earned yet</p>
        <p className="text-xs text-gray-400">
          Complete lessons, quizzes, and courses to unlock badges.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
      {badges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  );
}
