import { Trophy, Star, Award } from "lucide-react";
import { Badge } from "@simplilms/ui";
import type { LeaderboardEntry } from "../../actions/gamification";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentStudentId?: string;
}

const RANK_STYLES: Record<number, { bg: string; text: string; icon?: boolean }> = {
  1: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", icon: true },
  2: { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", icon: true },
  3: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", icon: true },
};

const RANK_ICONS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function LeaderboardTable({
  entries,
  currentStudentId,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
        <Trophy className="h-12 w-12 text-gray-200" />
        <p className="text-sm font-medium">No rankings yet</p>
        <p className="text-xs">
          Start completing courses and quizzes to appear on the leaderboard.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground w-14">
              Rank
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Student
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5" /> Points
              </span>
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">
              <span className="inline-flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> Badges
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isCurrentUser = entry.student_id === currentStudentId;
            const rankStyle = RANK_STYLES[entry.rank];

            return (
              <tr
                key={entry.student_id}
                className={`border-b last:border-b-0 transition-colors ${
                  isCurrentUser
                    ? "bg-primary/5 font-semibold"
                    : rankStyle
                    ? rankStyle.bg
                    : "hover:bg-muted/30"
                }`}
              >
                <td className="px-4 py-3">
                  <span
                    className={`font-bold ${
                      rankStyle ? rankStyle.text : "text-muted-foreground"
                    }`}
                  >
                    {RANK_ICONS[entry.rank] ?? `#${entry.rank}`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    {entry.name}
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {entry.total_points.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  {entry.badge_count}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
