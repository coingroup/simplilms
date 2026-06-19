import { requireRole } from "@simplilms/auth/server";
import { Trophy, Star, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import {
  getStudentPoints,
  getStudentBadges,
  getStudentStreak,
} from "@simplilms/core/actions/gamification";
import {
  BADGE_CATALOG,
  POINT_VALUES,
  type PointAction,
} from "@simplilms/core/lib/gamification-config";
import { BadgeGrid } from "@simplilms/core/components/gamification/badge-grid";
import { StreakDisplay } from "@simplilms/core/components/gamification/streak-display";
import { PointsDisplay } from "@simplilms/core/components/gamification/points-display";

export const metadata = {
  title: "Achievements",
};

const ACTION_LABELS: Record<PointAction, string> = {
  lesson_complete: "Lesson Completed",
  quiz_pass: "Quiz Passed",
  quiz_perfect: "Perfect Quiz Score",
  streak_7: "7-Day Streak Bonus",
  streak_30: "30-Day Streak Bonus",
  course_complete: "Course Completed",
  first_post: "Discussion Post Created",
  helpful_post: "Helpful Post",
};

export default async function AchievementsPage() {
  const user = await requireRole(["super_admin", "student"]);
  const studentId = user.user.id;

  const [pointsResult, badges, streak] = await Promise.all([
    getStudentPoints(studentId),
    getStudentBadges(studentId),
    getStudentStreak(studentId),
  ]);

  const earnedBadgeKeys = new Set(badges.map((b) => b.badge_key));
  const unearnedBadges = BADGE_CATALOG.filter(
    (b) => !earnedBadgeKeys.has(b.key)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Achievements
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your progress, badges, and points history.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PointsDisplay total={pointsResult.total} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Learning Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakDisplay
              currentStreak={streak?.current_streak ?? 0}
              longestStreak={streak?.longest_streak ?? 0}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">
                  {badges.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  of {BADGE_CATALOG.length} available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earned badges */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Earned Badges
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({badges.length})
          </span>
        </h2>
        <BadgeGrid badges={badges} />
      </div>

      {/* Locked badges */}
      {unearnedBadges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Locked Badges
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({unearnedBadges.length} remaining)
            </span>
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {unearnedBadges.map((badge) => (
              <div
                key={badge.key}
                className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-5 text-center opacity-60"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                  <Trophy className="h-7 w-7 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">
                    {badge.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Not yet earned</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points history */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Recent Activity
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            (last 20 events)
          </span>
        </h2>

        {pointsResult.recent.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <Zap className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">No activity yet.</p>
            <p className="text-xs mt-1">
              Complete lessons and quizzes to earn points.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Activity
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Points
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {pointsResult.recent.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                        <span>
                          {ACTION_LABELS[row.action] ?? row.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      +{row.points}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                      {new Date(row.earned_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* How to earn points */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">How to Earn Points</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(
            Object.entries(POINT_VALUES) as [PointAction, number][]
          ).map(([action, points]) => (
            <div
              key={action}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
            >
              <span className="text-sm">{ACTION_LABELS[action]}</span>
              <span className="text-sm font-semibold text-yellow-600">
                +{points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
