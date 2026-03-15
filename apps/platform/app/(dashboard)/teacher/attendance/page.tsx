import { requireRole } from "@simplilms/auth/server";
import { getInstructorClasses, getClassStudents, getClassAttendance } from "@simplilms/core";
import { AttendanceForm } from "@simplilms/core/components/teacher/attendance-form";
import { AttendancePageClient } from "./client";
import { ClipboardList } from "lucide-react";

export const metadata = {
  title: "Attendance",
};

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const user = await requireRole(["super_admin", "teacher_paid", "teacher_unpaid"]);
  const params = await searchParams;
  const classes = await getInstructorClasses(user.user.id);

  // Only active classes for attendance
  const activeClasses = classes.filter((c) => c.is_active);

  const selectedClassId = params.classId || "";
  const selectedDate = params.date || new Date().toISOString().split("T")[0];

  // If a class is selected, load students and existing attendance
  let students: Awaited<ReturnType<typeof getClassStudents>> = [];
  let existingAttendance: Awaited<ReturnType<typeof getClassAttendance>> = [];
  let selectedClassName = "";

  if (selectedClassId) {
    const selectedClass = activeClasses.find((c) => c.id === selectedClassId);
    if (selectedClass) {
      selectedClassName = selectedClass.name;
      [students, existingAttendance] = await Promise.all([
        getClassStudents(selectedClassId),
        getClassAttendance(selectedClassId, selectedDate),
      ]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Mark attendance for your class sessions.
        </p>
      </div>

      {activeClasses.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">
            No active classes
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You don&apos;t have any active classes to mark attendance for.
          </p>
        </div>
      ) : (
        <>
          <AttendancePageClient
            classes={activeClasses.map((c) => ({ id: c.id, name: c.name }))}
            selectedClassId={selectedClassId}
            selectedDate={selectedDate}
          />

          {selectedClassId && selectedClassName && (
            <AttendanceForm
              classId={selectedClassId}
              className={selectedClassName}
              students={students}
              existingAttendance={existingAttendance}
              sessionDate={selectedDate}
            />
          )}
        </>
      )}
    </div>
  );
}
