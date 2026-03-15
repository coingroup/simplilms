import { requireRole } from "@simplilms/auth/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@simplilms/ui";
import { ArrowLeft, Users, Calendar, Video, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getClassById, getClassStudents, getClassAttendance } from "@simplilms/core";
import { ClassRosterTable } from "@simplilms/core/components/teacher/class-roster-table";

export const metadata = {
  title: "Class Details",
};

function parseSchedule(schedule: Record<string, unknown> | null): string {
  if (!schedule) return "Schedule not set";
  try {
    const days = schedule.days as string[] | undefined;
    const startTime = schedule.startTime as string | undefined;
    const endTime = schedule.endTime as string | undefined;
    const timezone = schedule.timezone as string | undefined;

    if (!days || days.length === 0) return "Schedule not set";

    const dayStr = days.join(", ");
    const timeStr =
      startTime && endTime ? `${startTime} - ${endTime}` : "Time TBD";
    const tzStr = timezone ? ` (${timezone})` : "";

    return `${dayStr} | ${timeStr}${tzStr}`;
  } catch {
    return "Schedule not set";
  }
}

export default async function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const user = await requireRole(["super_admin", "teacher_paid", "teacher_unpaid"]);
  const { classId } = await params;

  const cls = await getClassById(classId);

  if (!cls) {
    redirect("/teacher/classes");
  }

  // Verify this instructor owns the class (unless super_admin)
  if (user.role !== "super_admin" && cls.instructor_id !== user.user.id) {
    redirect("/teacher/classes");
  }

  const [students, attendance] = await Promise.all([
    getClassStudents(classId),
    getClassAttendance(classId),
  ]);

  // Compute attendance summary
  const totalSessions = [...new Set(attendance.map((a) => a.session_date))].length;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/teacher/classes"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold">{cls.name}</h1>
            <Badge variant={cls.is_active ? "default" : "secondary"}>
              {cls.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {cls.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {cls.description}
            </p>
          )}
        </div>
      </div>

      {/* Class Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cls.enrolled_count}</div>
            <p className="text-xs text-muted-foreground">
              {cls.max_students ? `of ${cls.max_students} max` : "Enrolled"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {parseSchedule(cls.schedule)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">Total recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 text-sm">
              <span className="text-green-600">{presentCount}P</span>
              <span className="text-yellow-600">{lateCount}L</span>
              <span className="text-red-600">{absentCount}A</span>
            </div>
            <p className="text-xs text-muted-foreground">All sessions combined</p>
          </CardContent>
        </Card>
      </div>

      {/* Zoom Link */}
      {cls.zoom_start_url && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Start Zoom Meeting</span>
            </div>
            <a
              href={cls.zoom_start_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Start Meeting
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>
      )}

      {/* Student Roster */}
      <Card>
        <CardHeader>
          <CardTitle>
            Student Roster ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClassRosterTable students={students} />
        </CardContent>
      </Card>
    </div>
  );
}
