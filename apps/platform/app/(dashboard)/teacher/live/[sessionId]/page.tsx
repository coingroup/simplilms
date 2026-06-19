import { requireRole } from "@simplilms/auth/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { getLiveSession } from "@simplilms/core/actions/live-classes";
import { SessionScheduler } from "@simplilms/core/components/live-classes/session-scheduler";
import { AddRecordingForm } from "@simplilms/core/components/live-classes/add-recording-form";
import { Badge } from "@simplilms/ui";

export const metadata = {
  title: "Session Detail",
};

export default async function TeacherLiveSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requireRole(["teacher_paid", "teacher_unpaid", "super_admin"]);
  const { sessionId } = await params;

  const session = await getLiveSession(sessionId);
  if (!session) notFound();

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
    : "You";

  const STATUS_LABEL: Record<string, string> = {
    scheduled: "Scheduled",
    live: "Live",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const STATUS_VARIANT: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    scheduled: "default",
    live: "default",
    completed: "secondary",
    cancelled: "destructive",
  };

  const isCancelled = session.status === "cancelled";
  const isCompleted = session.status === "completed";

  return (
    <div className="space-y-8 max-w-3xl">
      <Link
        href="/teacher/live"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Live Classes
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{session.title}</h1>
          {session.description && (
            <p className="text-muted-foreground mt-1">{session.description}</p>
          )}
        </div>
        <Badge variant={STATUS_VARIANT[session.status] ?? "secondary"}>
          {STATUS_LABEL[session.status] ?? session.status}
        </Badge>
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

      {/* Edit form — only when not cancelled */}
      {!isCancelled && (
        <section>
          <h2 className="text-base font-semibold mb-4">
            {isCompleted ? "Session Details" : "Edit Session"}
          </h2>
          <SessionScheduler session={session} redirectTo="/teacher/live" />
        </section>
      )}

      {/* Add recording form — only when completed or scheduled (teacher may add early) */}
      {!isCancelled && (
        <section>
          <h2 className="text-base font-semibold mb-2">Recording</h2>
          {session.recording_url ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Current recording:{" "}
                <a
                  href={session.recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 hover:text-blue-700"
                >
                  {session.recording_url}
                </a>
              </p>
              <AddRecordingForm
                sessionId={session.id}
                currentUrl={session.recording_url}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                After the session ends, paste the Zoom recording link below to
                make it available to students.
              </p>
              <AddRecordingForm sessionId={session.id} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
