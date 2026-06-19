import { requireRole } from "@simplilms/auth/server";
import { Video, Calendar, Clock, User } from "lucide-react";
import { Badge } from "@simplilms/ui";
import { getAllLiveSessions } from "@simplilms/core/actions/live-classes";
import type { LiveSessionStatus } from "@simplilms/core/actions/live-classes";

export const metadata = {
  title: "Live Classes — Admin",
};

const STATUS_LABEL: Record<LiveSessionStatus, string> = {
  scheduled: "Scheduled",
  live: "Live",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_VARIANT: Record<
  LiveSessionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  scheduled: "default",
  live: "default",
  completed: "secondary",
  cancelled: "destructive",
};

export default async function AdminLivePage() {
  await requireRole(["super_admin"]);

  const sessions = await getAllLiveSessions();

  const upcoming = sessions.filter((s) =>
    ["scheduled", "live"].includes(s.status)
  );
  const past = sessions.filter((s) =>
    ["completed", "cancelled"].includes(s.status)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-600" />
          Upcoming ({upcoming.length})
        </h2>

        <SessionTable sessions={upcoming} emptyText="No upcoming sessions." />
      </section>

      {/* Past */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Past Sessions ({past.length})</h2>
        <SessionTable sessions={past} emptyText="No past sessions." />
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Sub-component: table
// ──────────────────────────────────────────────────────────

import type { LiveSessionRow } from "@simplilms/core/actions/live-classes";

function SessionTable({
  sessions,
  emptyText,
}: {
  sessions: LiveSessionRow[];
  emptyText: string;
}) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-8 text-center">
        <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                Title
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                Instructor
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Scheduled
                </span>
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Duration
                </span>
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                Status
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                Recording
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map((session) => {
              const instructorName = session.instructor_first_name
                ? `${session.instructor_first_name} ${session.instructor_last_name ?? ""}`.trim()
                : "—";

              const scheduledDate = new Date(session.scheduled_at);
              const dateStr = scheduledDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const timeStr = scheduledDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              });

              return (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {session.title}
                    </p>
                    {(session.class_name || session.course_title) && (
                      <p className="text-xs text-gray-400 truncate">
                        {session.class_name ?? session.course_title}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {instructorName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                    {dateStr}
                    <br />
                    <span className="text-xs text-gray-400">{timeStr}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                    {session.duration_minutes} min
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        STATUS_VARIANT[session.status as LiveSessionStatus] ??
                        "secondary"
                      }
                    >
                      {STATUS_LABEL[session.status as LiveSessionStatus] ??
                        session.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {session.recording_url ? (
                      <a
                        href={session.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
