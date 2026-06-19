import { requireRole } from "@simplilms/auth/server";
import { Video } from "lucide-react";
import { getUpcomingLiveSessions, getPastLiveSessions } from "@simplilms/core/actions/live-classes";
import { SessionList } from "@simplilms/core/components/live-classes/session-list";
import { RecordingCard } from "@simplilms/core/components/live-classes/recording-card";

export const metadata = {
  title: "Live Classes",
};

export default async function StudentLivePage() {
  await requireRole(["student", "super_admin"]);

  const [upcoming, past] = await Promise.all([
    getUpcomingLiveSessions(),
    getPastLiveSessions(),
  ]);

  const pastWithRecording = past.filter((s) => s.recording_url);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold">Live Classes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Join upcoming live sessions or watch past recordings.
        </p>
      </div>

      {/* Upcoming sessions */}
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
            <p className="text-sm font-medium">No upcoming live sessions</p>
            <p className="text-xs text-gray-400 mt-1">
              Check back soon — your instructor will schedule sessions here.
            </p>
          </div>
        ) : (
          <SessionList sessions={upcoming} />
        )}
      </section>

      {/* Past recordings */}
      {pastWithRecording.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Recordings
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              ({pastWithRecording.length})
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastWithRecording.map((session) => (
              <RecordingCard key={session.id} session={session} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
