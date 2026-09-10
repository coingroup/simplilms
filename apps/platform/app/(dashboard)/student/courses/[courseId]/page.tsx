import { requireRole } from "@simplilms/auth/server";
import { notFound, redirect } from "next/navigation";
import { getStudentCourseEnrollments } from "@simplilms/core/actions/progress";
import { getStudentLessonProgress } from "@simplilms/core/actions/progress";
import { getCourseWithContent } from "@simplilms/core/actions/courses";
import { getCourseThreadCount } from "@simplilms/core/actions/forums";
import { CoursePlayerClient } from "./player";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function StudentCoursePlayerPage({
  params,
}: CoursePageProps) {
  const user = await requireRole(["super_admin", "student"]);
  const { courseId } = await params;

  // Verify the student is enrolled in this course
  const enrollments = await getStudentCourseEnrollments(user.user.id);
  const enrollment = enrollments.find((e) => e.course_id === courseId);

  if (!enrollment) {
    redirect("/student/courses");
  }

  // Fetch course content and lesson progress
  const courseData = await getCourseWithContent(courseId);
  if (!courseData) {
    notFound();
  }

  const progress = await getStudentLessonProgress(user.user.id, courseId);
  const threadCount = await getCourseThreadCount(courseId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            {courseData.course.title}
          </h1>
          {courseData.course.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {courseData.course.description}
            </p>
          )}
        </div>
        <Link
          href={`/student/courses/${courseId}/discussions`}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors shrink-0"
        >
          <MessageSquare className="h-4 w-4" />
          Discussions
          {threadCount > 0 && (
            <span className="ml-1 bg-primary/10 text-primary text-xs font-semibold px-1.5 py-0.5 rounded-full">
              {threadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Overall Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1.5">
          <span>Course Progress</span>
          <span className="font-medium">{enrollment.progress_pct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${enrollment.progress_pct}%` }}
          />
        </div>
      </div>

      <CoursePlayerClient
        course={courseData.course}
        modules={courseData.modules}
        progress={progress}
        courseId={courseId}
        studentId={user.user.id}
      />
    </div>
  );
}
