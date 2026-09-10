"use client";

import { Card } from "@simplilms/ui";
import { Award, Crown, Flame, Medal, Star } from "lucide-react";
import type { LeaderboardEntry } from "../../actions/gamification";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardTable({
  entries,
  currentUserId,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Star className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No leaderboard data yet. Start earning XP!
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-12">
                #
              </th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                Student
              </th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">
                XP
              </th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">
                Badges
              </th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">
                Streak
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.student_id === currentUserId;

              return (
                <tr
                  key={entry.student_id}
                  className={isCurrentUser ? "bg-primary/5" : ""}
                >
                  <td className="px-4 py-2.5">
                    {rank === 1 ? (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    ) : rank === 2 ? (
                      <Medal className="h-5 w-5 text-gray-400" />
                    ) : rank === 3 ? (
                      <Medal className="h-5 w-5 text-amber-600" />
                    ) : (
                      <span className="text-muted-foreground font-medium">
                        {rank}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium">
                      {entry.student_name}
                      {isCurrentUser && (
                        <span className="text-xs text-primary ml-1.5">
                          (you)
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                      {entry.total_points.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Award className="h-3.5 w-3.5" />
                      {entry.badge_count}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right hidden sm:table-cell">
                    {entry.current_streak > 0 ? (
                      <span className="inline-flex items-center gap-1 text-orange-600">
                        <Flame className="h-3.5 w-3.5" />
                        {entry.current_streak}d
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
