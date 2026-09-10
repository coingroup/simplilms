"use client";

import { Card } from "@simplilms/ui";
import { Award, Flame, Star, Target } from "lucide-react";

interface StudentStatsBarProps {
  totalPoints: number;
  currentStreak: number;
  badgeCount: number;
  totalBadges: number;
}

export function StudentStatsBar({
  totalPoints,
  currentStreak,
  badgeCount,
  totalBadges,
}: StudentStatsBarProps) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
      <Card className="p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
          <Star className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <p className="text-lg font-bold leading-none">{totalPoints}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">XP Earned</p>
        </div>
      </Card>

      <Card className="p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
          <Flame className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <p className="text-lg font-bold leading-none">{currentStreak}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Day Streak</p>
        </div>
      </Card>

      <Card className="p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
          <Award className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="text-lg font-bold leading-none">
            {badgeCount}
            <span className="text-xs font-normal text-muted-foreground">
              /{totalBadges}
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Badges</p>
        </div>
      </Card>

      <Card className="p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Target className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-lg font-bold leading-none">
            {getLevel(totalPoints)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Level</p>
        </div>
      </Card>
    </div>
  );
}

function getLevel(points: number): number {
  // Level formula: every 100 XP = 1 level
  return Math.floor(points / 100) + 1;
}
