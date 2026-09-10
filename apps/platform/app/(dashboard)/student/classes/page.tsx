import { requireRole } from "@simplilms/auth/server";
import { BookOpen } from "lucide-react";
import { getStudentClasses, getAttendanceByStudent } from "@simplilms/core";
import { getUpcomingSessions } from "@simplilms/core/actions/classes";
import { ClassCard } from "@simplilms/core/components/classes/class-card";
import { UpcomingSessions } from "@simplilms/core/components/classes/upcoming-sessions";

export const metadata = {
  title: "My Classes",
};

export default async function StudentClassesPage() {
  const user = await requireRole(["super_admin", "student"]);

  const [classes, attendance, upcomingSessions] = await Promise.all([
    getStudentClasses(user.user.id),
    getAttendanceByStudent(user.user.id),
    getUpcomingSessions(user.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">My Classes</h1>
        <p className="text-sm text-muted-foreground">
          View your enrolled classes and attendance.
        </p>
      </div>

      {/* Upcoming Live Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Upcoming Live Sessions</h2>
          <UpcomingSessions sessions={upcomingSessions} role="student" />
        </div>
      )}

      {classes.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">No classes yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your enrolled classes will appear here once your program begins.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((enrollment) => (
            <ClassCard
              key={enrollment.id}
              enrollment={enrollment}
              attendance={attendance}
            />
          ))}
        </div>
      )}
    </div>
  );
}
