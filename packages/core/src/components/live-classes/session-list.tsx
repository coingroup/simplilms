import { SessionCard } from "./session-card";
import type { LiveSessionRow } from "../../actions/live-classes";

interface SessionListProps {
  sessions: LiveSessionRow[];
  emptyMessage?: string;
  showStartUrl?: boolean;
}

/**
 * Groups sessions by date and renders SessionCard for each.
 */
export function SessionList({
  sessions,
  emptyMessage = "No sessions found.",
  showStartUrl = false,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {emptyMessage}
      </p>
    );
  }

  // Group by calendar date (YYYY-MM-DD in local time)
  const groups = new Map<string, LiveSessionRow[]>();

  for (const session of sessions) {
    const dateKey = new Date(session.scheduled_at).toLocaleDateString("en-CA"); // YYYY-MM-DD
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(session);
    } else {
      groups.set(dateKey, [session]);
    }
  }

  const sortedKeys = Array.from(groups.keys()).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div className="space-y-8">
      {sortedKeys.map((dateKey) => {
        const daySessions = groups.get(dateKey)!;
        const label = new Date(dateKey + "T00:00:00").toLocaleDateString(
          "en-US",
          { weekday: "long", month: "long", day: "numeric", year: "numeric" }
        );

        return (
          <section key={dateKey}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {label}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {daySessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  showStartUrl={showStartUrl}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
