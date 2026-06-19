import Link from "next/link";
import { Trophy, Flame, Star, Award, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@simplilms/ui";
import type { GamificationSummary } from "../../actions/gamification";

interface GamificationSummaryCardProps {
  summary: GamificationSummary;
}

export function GamificationSummaryCard({
  summary,
}: GamificationSummaryCardProps) {
  const { total_points, current_streak, badge_count, rank } = summary;

  const stats = [
    {
      label: "Points",
      value: total_points.toLocaleString(),
      icon: Star,
      iconClass: "text-yellow-500",
      iconBg: "bg-yellow-100",
    },
    {
      label: "Day Streak",
      value: String(current_streak),
      icon: Flame,
      iconClass: "text-orange-500",
      iconBg: "bg-orange-100",
    },
    {
      label: "Badges",
      value: String(badge_count),
      icon: Award,
      iconClass: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      label: "Rank",
      value: rank ? `#${rank}` : "—",
      icon: BarChart3,
      iconClass: "text-teal-600",
      iconBg: "bg-teal-100",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Your Progress
        </CardTitle>
        <div className="flex gap-3">
          <Link
            href="/student/achievements"
            className="text-xs text-primary hover:underline"
          >
            Achievements
          </Link>
          <Link
            href="/student/leaderboard"
            className="text-xs text-primary hover:underline"
          >
            Leaderboard
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${stat.iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${stat.iconClass}`} />
                </div>
                <p className="text-lg font-bold leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
