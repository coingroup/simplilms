import { requireRole } from "@simplilms/auth/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Film, User } from "lucide-react";
import { getLiveSession } from "@simplilms/core/actions/live-classes";
import { ZoomEmbed } from "@simplilms/core/components/live-classes/zoom-embed";

export const metadata = {
  title: "Live Session",
};

export default async function StudentLiveSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requireRole(["student", "super_admin"]);
  const { sessionId } = await params;

  const session = await getLiveSession(sessionId);
  if (!session || session.status === "cancelled") notFound();

  const scheduledDate = new Date(session.scheduled_at);
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const instructorName = session.instructor_first_name
    ? `${session.instructor_first_name} ${session.instructor_last_name ?? ""}`.trim()
    : "Instructor";

  const isUpcoming =
    session.status === "scheduled" || session.status === "live";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back nav */}
      <Link
        href="/student/live"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Live Classes
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">{session.title}</h1>
        {session.description && (
          <p className="text-muted-foreground mt-2">{session.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          {instructorName}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {formattedDate} at {formattedTime}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {session.duration_minutes} minutes
        </span>
      </div>

      <hr />

      {/* Zoom embed for live/upcoming sessions */}
      {isUpcoming && session.zoom_join_url ? (
        <section>
          <h2 className="text-base font-semibold mb-3">Join the Session</h2>
          <ZoomEmbed
            joinUrl={session.zoom_join_url}
            title={session.title}
            passcode={session.zoom_passcode}
          />
        </section>
      ) : isUpcoming && !session.zoom_join_url ? (
        <p className="text-sm text-muted-foreground">
          The Zoom link has not been added yet. Check back closer to the session
          time.
        </p>
      ) : null}

      {/* Recording for completed sessions */}
      {session.status === "completed" && (
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Film className="h-4 w-4" />
            Recording
          </h2>
          {session.recording_url ? (
            <a
              href={session.recording_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              <Film className="h-4 w-4" />
              Watch Recording
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              The recording is not yet available. Check back soon.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
