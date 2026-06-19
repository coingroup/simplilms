import { requireRole } from "@simplilms/auth/server";
import { Video, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@simplilms/ui";
import { getUpcomingLiveSessions, getPastLiveSessions } from "@simplilms/core/actions/live-classes";
import { SessionList } from "@simplilms/core/components/live-classes/session-list";
import { RecordingCard } from "@simplilms/core/components/live-classes/recording-card";

export const metadata = {
  title: "Live Classes",
};

export default async function TeacherLivePage() {
  await requireRole(["teacher_paid", "teacher_unpaid", "super_admin"]);

  const [upcoming, past] = await Promise.all([
    getUpcomingLiveSessions(),
    getPastLiveSessions(),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Live Classes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and manage your live sessions.
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/live/new">
            <Plus className="h-4 w-4 mr-1.5" />
            Schedule Session
          </Link>
        </Button>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-600" />
          Upcoming Sessions
          {upcoming.length > 0 && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              ({upcoming.length})
            </span>
          )}
        </h2>

        {upcoming.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Video className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">No upcoming sessions</p>
            <p className="text-xs text-gray-400 mt-1">
              Schedule your first live session using the button above.
            </p>
          </div>
        ) : (
          <SessionList sessions={upcoming} showStartUrl />
        )}
      </section>

      {/* Past sessions */}
      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Past Sessions
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({past.length})
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((session) => (
              <RecordingCard key={session.id} session={session} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
