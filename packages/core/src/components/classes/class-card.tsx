import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@simplilms/ui";
import { ExternalLink, User, Calendar, Video } from "lucide-react";
import type { ClassEnrollmentWithDetails, AttendanceRow } from "../../lib/queries";

interface ClassCardProps {
  enrollment: ClassEnrollmentWithDetails;
  attendance: AttendanceRow[];
}

/**
 * Parse the schedule jsonb into a human-readable string.
 * Expected shape: { days?: string[], startTime?: string, endTime?: string, timezone?: string }
 */
function parseSchedule(schedule: Record<string, unknown> | null): string {
  if (!schedule) return "Schedule not set";

  try {
    const days = schedule.days as string[] | undefined;
    const startTime = schedule.startTime as string | undefined;
    const endTime = schedule.endTime as string | undefined;
    const tz = schedule.timezone as string | undefined;

    const parts: string[] = [];

    if (days && Array.isArray(days) && days.length > 0) {
      parts.push(days.join(", "));
    }

    if (startTime && endTime) {
      parts.push(`${startTime} - ${endTime}`);
    } else if (startTime) {
      parts.push(startTime);
    }

    if (tz) {
      parts.push(tz);
    }

    return parts.length > 0 ? parts.join(" \u00b7 ") : "Schedule not set";
  } catch {
    return "Schedule not set";
  }
}

export function ClassCard({ enrollment, attendance }: ClassCardProps) {
  const instructorName = enrollment.instructor_first_name
    ? `${enrollment.instructor_first_name} ${enrollment.instructor_last_name ? enrollment.instructor_last_name.charAt(0) + "." : ""}`
    : "TBA";

  // Attendance stats for this class
  const classAttendance = attendance.filter(
    (a) => a.class_id === enrollment.class_id
  );
  const present = classAttendance.filter((a) => a.status === "present").length;
  const absent = classAttendance.filter((a) => a.status === "absent").length;
  const late = classAttendance.filter((a) => a.status === "late").length;
  const totalSessions = classAttendance.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{enrollment.class_name}</CardTitle>
          <Badge
            variant={enrollment.is_active ? "default" : "secondary"}
          >
            {enrollment.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        {enrollment.class_description && (
          <p className="text-sm text-muted-foreground mt-1">
            {enrollment.class_description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Instructor */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Instructor:</span>
          <span className="font-medium">{instructorName}</span>
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Schedule:</span>
          <span className="font-medium">
            {parseSchedule(enrollment.schedule)}
          </span>
        </div>

        {/* Zoom Link */}
        {enrollment.zoom_join_url && (
          <a
            href={enrollment.zoom_join_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-blue-50 text-blue-700 px-3 py-2 text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <Video className="h-4 w-4" />
            Join Class
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Attendance Summary */}
        {totalSessions > 0 && (
          <div className="border-t pt-3 mt-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Attendance ({totalSessions} session{totalSessions !== 1 ? "s" : ""})
            </p>
            <div className="flex gap-3">
              <AttendanceStat label="Present" count={present} color="text-green-600" />
              <AttendanceStat label="Late" count={late} color="text-amber-600" />
              <AttendanceStat label="Absent" count={absent} color="text-red-600" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AttendanceStat({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <span className={`text-lg font-bold ${color}`}>{count}</span>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
