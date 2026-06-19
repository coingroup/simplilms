import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { Film, Calendar, Clock, ExternalLink, User } from "lucide-react";
import type { LiveSessionRow } from "../../actions/live-classes";

interface RecordingCardProps {
  session: LiveSessionRow;
}

/**
 * Displays a past session that has a recording available.
 */
export function RecordingCard({ session }: RecordingCardProps) {
  const scheduledDate = new Date(session.scheduled_at);
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    month: "short",
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

  const availableAt = session.recording_available_at
    ? new Date(session.recording_available_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{session.title}</CardTitle>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 border border-gray-200">
            <Film className="h-3 w-3" />
            Recording
          </span>
        </div>
        {session.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {session.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            <span>{instructorName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {formattedDate} at {formattedTime}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{session.duration_minutes} minutes</span>
          </div>
          {availableAt && (
            <p className="text-xs text-muted-foreground">
              Recording added {availableAt}
            </p>
          )}
        </div>

        {session.recording_url ? (
          <a
            href={session.recording_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            <Film className="h-4 w-4" />
            Watch Recording
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Recording not yet available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
