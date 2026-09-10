import { requireRole } from "@simplilms/auth/server";
import {
  getStudentBadges,
  getStudentTotalPoints,
  getStudentStreak,
} from "@simplilms/core/actions/gamification";
import { BADGE_DEFINITIONS } from "@simplilms/core/lib/gamification-constants";
import { StudentStatsBar } from "@simplilms/core/components/gamification/student-stats-bar";
import { BadgeShowcase } from "@simplilms/core/components/gamification/badge-showcase";

export const metadata = { title: "My Badges" };

export default async function BadgesPage() {
  const user = await requireRole(["super_admin", "student"]);

  const [badges, totalPoints, streak] = await Promise.all([
    getStudentBadges(user.user.id),
    getStudentTotalPoints(user.user.id),
    getStudentStreak(user.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Badges</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your achievements and progress
        </p>
      </div>

      <StudentStatsBar
        totalPoints={totalPoints}
        currentStreak={streak?.current_streak || 0}
        badgeCount={badges.length}
        totalBadges={Object.keys(BADGE_DEFINITIONS).length}
      />

      <div>
        <h2 className="text-lg font-semibold mb-3">All Badges</h2>
        <BadgeShowcase badges={badges} showLocked={true} />
      </div>
    </div>
  );
}
