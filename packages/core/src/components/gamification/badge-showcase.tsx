"use client";

import { Card } from "@simplilms/ui";
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Crown,
  Flame,
  Footprints,
  GraduationCap,
  MessageSquare,
  MessagesSquare,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type { StudentBadge } from "../../actions/gamification";
import { BADGE_DEFINITIONS } from "../../lib/gamification-constants";

const ICON_MAP: Record<string, React.ElementType> = {
  footprints: Footprints,
  zap: Zap,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  "check-circle": CheckCircle,
  star: Star,
  award: Award,
  trophy: Trophy,
  flame: Flame,
  "calendar-check": CalendarCheck,
  "message-square": MessageSquare,
  "messages-square": MessagesSquare,
  target: Target,
  sparkles: Sparkles,
  crown: Crown,
};

interface BadgeShowcaseProps {
  badges: StudentBadge[];
  showLocked?: boolean;
}

export function BadgeShowcase({ badges, showLocked = false }: BadgeShowcaseProps) {
  const earnedKeys = new Set(badges.map((b) => b.badge_key));

  const allBadges = showLocked
    ? Object.entries(BADGE_DEFINITIONS).map(([key, def]) => ({
        key,
        ...def,
        earned: earnedKeys.has(key),
        earnedAt: badges.find((b) => b.badge_key === key)?.earned_at,
      }))
    : badges.map((b) => ({
        key: b.badge_key,
        name: b.badge_name,
        description: b.badge_description || "",
        icon: b.badge_icon,
        earned: true,
        earnedAt: b.earned_at,
      }));

  if (allBadges.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Award className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No badges earned yet. Complete lessons and quizzes to earn badges!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {allBadges.map((badge) => {
        const IconComponent = ICON_MAP[badge.icon] || Award;
        return (
          <Card
            key={badge.key}
            className={`p-3 text-center ${
              badge.earned ? "" : "opacity-40 grayscale"
            }`}
          >
            <div
              className={`h-10 w-10 rounded-full mx-auto flex items-center justify-center ${
                badge.earned
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium mt-2">{badge.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
              {badge.description}
            </p>
            {badge.earned && badge.earnedAt && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
