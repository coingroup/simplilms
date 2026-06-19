import { requireRole } from "@simplilms/auth/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getStudentCourseEnrollments } from "@simplilms/core/actions/progress";
import { getStudentLessonProgress } from "@simplilms/core/actions/progress";
import { getCourseWithContent } from "@simplilms/core/actions/courses";
import { getDiscussionThreads } from "@simplilms/core/actions/discussions";
import { MessageSquare } from "lucide-react";
import { CoursePlayerClient } from "./player";

export const metadata = {
  title: "Course -- Student Portal",
};

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

  // Fetch course content, lesson progress, and discussion thread count
  const [courseData, progress, threads] = await Promise.all([
    getCourseWithContent(courseId),
    getStudentLessonProgress(user.user.id, courseId),
    getDiscussionThreads(courseId),
  ]);

  if (!courseData) {
    notFound();
  }

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

        {/* Discussions tab/link */}
        <Link
          href={`/student/courses/${courseId}/discuss`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <MessageSquare className="h-4 w-4 text-gray-500" />
          Discussions
          {threads.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-white text-xs font-semibold">
              {threads.length}
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
