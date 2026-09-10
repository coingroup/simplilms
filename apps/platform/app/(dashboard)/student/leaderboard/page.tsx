import { requireRole } from "@simplilms/auth/server";
import { getLeaderboard } from "@simplilms/core/actions/gamification";
import { LeaderboardTable } from "@simplilms/core/components/gamification/leaderboard-table";

export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const user = await requireRole(["super_admin", "student"]);

  const entries = await getLeaderboard(undefined, 50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          See how you rank among your peers
        </p>
      </div>

      <LeaderboardTable entries={entries} currentUserId={user.user.id} />
    </div>
  );
}
