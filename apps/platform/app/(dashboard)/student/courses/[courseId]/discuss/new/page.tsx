import { requireRole } from "@simplilms/auth/server";
import { redirect } from "next/navigation";
import { getStudentCourseEnrollments } from "@simplilms/core/actions/progress";
import { getCourseById } from "@simplilms/core/actions/courses";
import { ThreadComposer } from "@simplilms/core/components/discussions/thread-composer";

interface Props {
  params: Promise<{ courseId: string }>;
}

export const metadata = {
  title: "New Discussion",
};

export default async function NewDiscussionPage({ params }: Props) {
  const user = await requireRole(["super_admin", "student", "teacher_paid", "teacher_unpaid"]);
  const { courseId } = await params;

  // Verify enrollment for students
  if (user.role === "student") {
    const enrollments = await getStudentCourseEnrollments(user.user.id);
    const enrollment = enrollments.find((e) => e.course_id === courseId);
    if (!enrollment) {
      redirect("/student/courses");
    }
  }

  const course = await getCourseById(courseId);
  if (!course) {
    redirect("/student/courses");
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Discussion</h1>
        <p className="text-sm text-gray-500 mt-1">{course.title}</p>
      </div>
      <ThreadComposer courseId={courseId} />
    </div>
  );
}
