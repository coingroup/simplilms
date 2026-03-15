import { requireRole } from "@simplilms/auth/server";
import { notFound, redirect } from "next/navigation";
import { getStudentCourseEnrollments } from "@simplilms/core/actions/progress";
import { getStudentLessonProgress } from "@simplilms/core/actions/progress";
import { getCourseWithContent } from "@simplilms/core/actions/courses";
import { CoursePlayerClient } from "./player";

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

  return (
    <div className="space-y-6">
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
      />
    </div>
  );
}
