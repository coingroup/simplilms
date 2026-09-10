"use client";

import { Card, Badge, Button } from "@simplilms/ui";
import { Calendar, Clock, ExternalLink, PlayCircle, Video } from "lucide-react";
import type { LiveSessionRow } from "../../actions/classes";

function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const sessionDate = new Date(dateStr + "T00:00:00");

  if (sessionDate.getTime() === today.getTime()) return "Today";
  if (sessionDate.getTime() === tomorrow.getTime()) return "Tomorrow";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const STATUS_STYLES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  scheduled: { variant: "secondary", label: "Scheduled" },
  live: { variant: "default", label: "Live Now" },
  completed: { variant: "outline", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
};

interface UpcomingSessionsProps {
  sessions: (LiveSessionRow & { class_name?: string; zoom_join_url?: string | null; zoom_start_url?: string | null })[];
  role: "student" | "teacher" | "admin";
}

export function UpcomingSessions({ sessions, role }: UpcomingSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No upcoming live sessions scheduled.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => {
        const statusStyle = STATUS_STYLES[session.status] || STATUS_STYLES.scheduled;
        const zoomUrl = role === "teacher" || role === "admin"
          ? session.zoom_start_url
          : session.zoom_join_url;

        return (
          <Card key={session.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium truncate">
                    {session.class_name || "Live Session"}
                  </h3>
                  <Badge variant={statusStyle.variant} className="text-[10px]">
                    {session.status === "live" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white mr-1 animate-pulse inline-block" />
                    )}
                    {statusStyle.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatSessionDate(session.session_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.start_time}
                    {session.end_time && ` - ${session.end_time}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                {session.zoom_recording_url && session.status === "completed" && (
                  <a
                    href={session.zoom_recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-1" />
                      Recording
                    </Button>
                  </a>
                )}
                {zoomUrl && session.status !== "completed" && session.status !== "cancelled" && (
                  <a
                    href={zoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      variant={session.status === "live" ? "default" : "outline"}
                    >
                      {session.status === "live" ? (
                        <>
                          <PlayCircle className="h-4 w-4 mr-1" />
                          {role === "teacher" || role === "admin" ? "Start" : "Join"}
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {role === "teacher" || role === "admin" ? "Start Meeting" : "Join Meeting"}
                        </>
                      )}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
