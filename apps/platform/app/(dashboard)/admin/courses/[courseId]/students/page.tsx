import { requireRole } from "@simplilms/auth/server";
import { getCourseById } from "@simplilms/core/actions/courses";
import {
  getCourseEnrollments,
  getAvailableStudents,
  enrollStudentInCourse,
  updateCourseEnrollmentStatus,
  issueCertificate,
} from "@simplilms/core/actions/progress";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EnrollmentManagerClient } from "./enrollment-manager";

export const metadata = {
  title: "Course Students -- Admin",
};

interface CourseStudentsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseStudentsPage({
  params,
}: CourseStudentsPageProps) {
  await requireRole(["super_admin"]);
  const { courseId } = await params;

  const course = await getCourseById(courseId);
  if (!course) notFound();

  const [enrollments, students] = await Promise.all([
    getCourseEnrollments(courseId),
    getAvailableStudents(),
  ]);

  // Filter out already-enrolled students
  const enrolledStudentIds = new Set(enrollments.map((e) => e.student_id));
  const availableStudents = students.filter((s) => !enrolledStudentIds.has(s.id));

  const boundEnroll = async (studentId: string) => {
    "use server";
    return enrollStudentInCourse(courseId, studentId);
  };

  const boundUpdateStatus = async (
    enrollmentId: string,
    status: "active" | "dropped" | "expired"
  ) => {
    "use server";
    return updateCourseEnrollmentStatus(enrollmentId, status);
  };

  const boundIssueCert = async (studentId: string) => {
    "use server";
    return issueCertificate(courseId, studentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/courses/${courseId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Students — {course.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage student enrollments for this course.
        </p>
      </div>

      <EnrollmentManagerClient
        enrollments={enrollments}
        availableStudents={availableStudents}
        enrollAction={boundEnroll}
        updateStatusAction={boundUpdateStatus}
        issueCertAction={boundIssueCert}
      />
    </div>
  );
}
