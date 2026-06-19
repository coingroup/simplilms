"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@simplilms/ui";
import { Video, Calendar, Clock, ExternalLink, User } from "lucide-react";
import type { LiveSessionRow, LiveSessionStatus } from "../../actions/live-classes";

// ============================================================
// Status badge
// ============================================================

function StatusBadge({ status }: { status: LiveSessionStatus }) {
  const map: Record<
    LiveSessionStatus,
    { label: string; className: string }
  > = {
    scheduled: {
      label: "Scheduled",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    live: {
      label: "Live Now",
      className: "bg-green-100 text-green-700 border-green-200 animate-pulse",
    },
    completed: {
      label: "Completed",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-700 border-red-200",
    },
  };

  const cfg = map[status] ?? map.scheduled;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {status === "live" && (
        <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-ping inline-block" />
      )}
      {cfg.label}
    </span>
  );
}

// ============================================================
// Countdown
// ============================================================

function useCountdown(targetIso: string) {
  const [diff, setDiff] = useState<number>(() =>
    new Date(targetIso).getTime() - Date.now()
  );

  useEffect(() => {
    if (diff <= 0) return;
    const id = setInterval(() => {
      setDiff(new Date(targetIso).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [targetIso, diff]);

  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0)
    return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0)
    return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

// ============================================================
// Main card
// ============================================================

interface SessionCardProps {
  session: LiveSessionRow;
  /** Show instructor start URL (teacher view) */
  showStartUrl?: boolean;
  href?: string;
}

export function SessionCard({ session, showStartUrl = false }: SessionCardProps) {
  const countdown = useCountdown(session.scheduled_at);
  const isUpcoming = session.status === "scheduled" || session.status === "live";

  const scheduledDate = new Date(session.scheduled_at);
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "short",
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

  return (
    <Card className="flex flex-col gap-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{session.title}</CardTitle>
          <StatusBadge status={session.status} />
        </div>
        {session.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {session.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Meta */}
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

          {(session.class_name || session.course_title) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Video className="h-4 w-4 shrink-0" />
              <span>{session.class_name ?? session.course_title}</span>
            </div>
          )}
        </div>

        {/* Countdown for upcoming */}
        {isUpcoming && countdown && (
          <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700 font-medium">
            Starts in {countdown}
          </div>
        )}

        {/* Join / Start buttons */}
        {isUpcoming && session.zoom_join_url && (
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={session.zoom_join_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Video className="h-4 w-4" />
              Join Session
              <ExternalLink className="h-3 w-3" />
            </a>

            {showStartUrl && session.zoom_start_url && (
              <a
                href={session.zoom_start_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Start as Host
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Passcode */}
        {isUpcoming && session.zoom_passcode && (
          <p className="text-xs text-muted-foreground">
            Passcode: <span className="font-mono font-medium">{session.zoom_passcode}</span>
          </p>
        )}

        {/* Recording */}
        {session.recording_url && (
          <a
            href={session.recording_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Video className="h-4 w-4" />
            Watch Recording
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
