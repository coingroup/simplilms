import { requireRole } from "@simplilms/auth/server";
import { formatDate } from "@simplilms/core";
import {
  getCourseById,
  getCourseWithContent,
  createModule,
  createLesson,
  deleteModule,
  deleteLesson,
  toggleCoursePublished,
} from "@simplilms/core/actions/courses";
import { getCourseEnrollmentCount } from "@simplilms/core/actions/progress";
import { Badge, Button } from "@simplilms/ui";
import { ArrowLeft, Pencil, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseBuilderClient } from "./builder";

export const metadata = {
  title: "Course Details -- Admin",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const DIFFICULTY_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  beginner: "secondary",
  intermediate: "default",
  advanced: "destructive",
};

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  await requireRole(["super_admin"]);

  const { courseId } = await params;
  const result = await getCourseWithContent(courseId);

  if (!result) {
    notFound();
  }

  const { course, modules } = result;
  const enrollmentCount = await getCourseEnrollmentCount(courseId);

  // Bind server actions with courseId
  const boundCreateModule = createModule.bind(null, courseId);
  const boundDeleteModule = async (moduleId: string) => {
    "use server";
    return deleteModule(moduleId, courseId);
  };
  const boundCreateLesson = async (
    moduleId: string,
    data: { title: string; content_type?: string; description?: string }
  ) => {
    "use server";
    return createLesson(moduleId, courseId, data);
  };
  const boundDeleteLesson = async (lessonId: string) => {
    "use server";
    return deleteLesson(lessonId, courseId);
  };
  const boundTogglePublished = async () => {
    "use server";
    return toggleCoursePublished(courseId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
      </div>

      {/* Course Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <Badge variant={course.is_published ? "default" : "secondary"}>
              {course.is_published ? "Published" : "Draft"}
            </Badge>
          </div>
          {course.description && (
            <p className="text-sm text-gray-500 mt-1">{course.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/courses/${courseId}/students`}>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Manage Students ({enrollmentCount})
            </Button>
          </Link>
          <Link
            href={`/admin/courses/${courseId}/edit`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit Course
          </Link>
        </div>
      </div>

      {/* Course Metadata */}
      <div className="flex flex-wrap gap-6 text-sm text-gray-500">
        {course.category && (
          <div>
            <span className="font-medium text-gray-700">Category:</span>{" "}
            {course.category}
          </div>
        )}
        {course.difficulty && (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-700">Difficulty:</span>{" "}
            <Badge
              variant={DIFFICULTY_COLORS[course.difficulty] || "secondary"}
            >
              {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
            </Badge>
          </div>
        )}
        {course.estimated_hours !== null && (
          <div>
            <span className="font-medium text-gray-700">Est. Hours:</span>{" "}
            {course.estimated_hours}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span className="font-medium text-gray-700">Students:</span>{" "}
          {enrollmentCount}
        </div>
        <div>
          <span className="font-medium text-gray-700">Created:</span>{" "}
          {formatDate(course.created_at)}
        </div>
      </div>

      {/* Course Builder */}
      <CourseBuilderClient
        courseId={courseId}
        modules={modules}
        isPublished={course.is_published}
        createModuleAction={boundCreateModule}
        createLessonAction={boundCreateLesson}
        deleteModuleAction={boundDeleteModule}
        deleteLessonAction={boundDeleteLesson}
        togglePublishedAction={boundTogglePublished}
      />
    </div>
  );
}
