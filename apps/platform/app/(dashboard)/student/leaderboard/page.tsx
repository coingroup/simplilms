import { requireRole } from "@simplilms/auth/server";
import { BarChart3, Trophy, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import {
  getLeaderboard,
  getStudentPoints,
  getStudentGamificationSummary,
} from "@simplilms/core/actions/gamification";
import { LeaderboardTable } from "@simplilms/core/components/gamification/leaderboard-table";

export const metadata = {
  title: "Leaderboard",
};

export default async function LeaderboardPage() {
  const user = await requireRole(["super_admin", "student"]);
  const studentId = user.user.id;

  const [entries, summary] = await Promise.all([
    getLeaderboard(20),
    getStudentGamificationSummary(),
  ]);

  const myEntry = entries.find((e) => e.student_id === studentId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-teal-600" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Top students ranked by total points earned.
        </p>
      </div>

      {/* My standing */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                <Trophy className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">
                  {summary.rank ? `#${summary.rank}` : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {summary.rank
                    ? `Out of ${entries.length} students`
                    : "Earn points to rank"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <Star className="h-5 w-5 text-yellow-600 fill-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">
                  {summary.total_points.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total earned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Points to Top 10
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                {(() => {
                  const top10Entry = entries[9];
                  const needed = top10Entry
                    ? Math.max(
                        0,
                        top10Entry.total_points - summary.total_points + 1
                      )
                    : 0;
                  const alreadyInTop10 =
                    summary.rank !== null && summary.rank <= 10;
                  return (
                    <>
                      <p className="text-2xl font-bold leading-none">
                        {alreadyInTop10
                          ? "✓"
                          : needed > 0
                          ? `${needed.toLocaleString()}`
                          : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {alreadyInTop10
                          ? "Already in top 10!"
                          : needed > 0
                          ? "pts needed for top 10"
                          : "No one in top 10 yet"}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Top 20 Students</h2>
        <LeaderboardTable entries={entries} currentStudentId={studentId} />
      </div>

      {/* Not in top 20 notice */}
      {!myEntry && entries.length > 0 && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          You are not yet in the top 20. Keep completing lessons and quizzes to
          climb the ranks!
        </div>
      )}
    </div>
  );
}
