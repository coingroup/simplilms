import {
  Trophy,
  Flame,
  Star,
  Award,
  BarChart3,
  Zap,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import type { StudentBadgeRow } from "../../actions/gamification";

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> =
  {
    first_steps: Star,
    quiz_whiz: Zap,
    perfect_score: Award,
    week_warrior: Flame,
    month_master: Trophy,
    course_champion: GraduationCap,
    discussion_starter: MessageSquare,
    top_10: BarChart3,
  };

const BADGE_COLORS: Record<string, { bg: string; icon: string }> = {
  first_steps: { bg: "bg-yellow-100", icon: "text-yellow-600" },
  quiz_whiz: { bg: "bg-purple-100", icon: "text-purple-600" },
  perfect_score: { bg: "bg-blue-100", icon: "text-blue-600" },
  week_warrior: { bg: "bg-orange-100", icon: "text-orange-500" },
  month_master: { bg: "bg-red-100", icon: "text-red-600" },
  course_champion: { bg: "bg-green-100", icon: "text-green-600" },
  discussion_starter: { bg: "bg-indigo-100", icon: "text-indigo-600" },
  top_10: { bg: "bg-teal-100", icon: "text-teal-600" },
};

interface BadgeCardProps {
  badge: StudentBadgeRow;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const Icon = BADGE_ICONS[badge.badge_key] ?? Trophy;
  const colors = BADGE_COLORS[badge.badge_key] ?? {
    bg: "bg-gray-100",
    icon: "text-gray-600",
  };

  const earnedDate = new Date(badge.earned_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center shadow-sm">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full ${colors.bg}`}
      >
        <Icon className={`h-7 w-7 ${colors.icon}`} />
      </div>
      <div>
        <p className="font-semibold text-sm">{badge.badge_name}</p>
        {badge.badge_description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {badge.badge_description}
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Earned {earnedDate}</p>
    </div>
  );
}
