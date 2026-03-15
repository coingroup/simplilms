import { requireRole } from "@simplilms/auth/server";
import { redirect } from "next/navigation";
import { getCourseWithContent } from "@simplilms/core/actions/courses";
import { getCourseEnrollmentCount } from "@simplilms/core/actions/progress";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@simplilms/ui";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  Layers,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const data = await getCourseWithContent(courseId);
  return {
    title: data ? data.course.title : "Course Details",
  };
}

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

const CONTENT_TYPE_ICONS: Record<string, typeof FileText> = {
  text: FileText,
  video: Video,
  document: FileText,
  embed: FileText,
  quiz: FileText,
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  video: "Video",
  document: "Document",
  embed: "Embed",
  quiz: "Quiz",
};

export default async function TeacherCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const user = await requireRole(["teacher_paid", "teacher_unpaid"]);
  const { courseId } = await params;

  const data = await getCourseWithContent(courseId);

  if (!data) {
    redirect("/teacher/courses");
  }

  const { course, modules } = data;

  // Verify this instructor owns the course (unless super_admin)
  if (user.role !== "super_admin" && course.instructor_id !== user.user.id) {
    redirect("/teacher/courses");
  }

  const enrollmentCount = await getCourseEnrollmentCount(courseId);

  const totalLessons = modules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/teacher/courses"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold">{course.title}</h1>
            <Badge variant={course.is_published ? "default" : "secondary"}>
              {course.is_published ? "Published" : "Draft"}
            </Badge>
          </div>
          {course.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {course.description}
            </p>
          )}
        </div>
      </div>

      {/* Course Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentCount}</div>
            <p className="text-xs text-muted-foreground">
              {course.max_students
                ? `of ${course.max_students} max`
                : "Enrolled"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-xs text-muted-foreground">Course modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
            <p className="text-xs text-muted-foreground">Total lessons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            {course.difficulty ? (
              <Badge
                variant={DIFFICULTY_COLORS[course.difficulty] || "secondary"}
              >
                {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">Not set</span>
            )}
            {course.estimated_hours && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Clock className="h-3 w-3" />
                {course.estimated_hours} hour
                {course.estimated_hours !== 1 ? "s" : ""} estimated
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module/Lesson Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No modules have been added to this course yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod, modIndex) => (
                <div key={mod.id} className="border rounded-lg">
                  <div className="flex items-center gap-3 p-4 bg-muted/50">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {modIndex + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{mod.title}</h3>
                      {mod.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {mod.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={mod.is_published ? "default" : "secondary"}>
                      {mod.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  {mod.lessons.length > 0 && (
                    <div className="divide-y">
                      {mod.lessons.map((lesson, lessonIndex) => {
                        const LessonIcon =
                          CONTENT_TYPE_ICONS[lesson.content_type] || FileText;
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-4 py-3 pl-14"
                          >
                            <LessonIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{lesson.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {CONTENT_TYPE_LABELS[lesson.content_type] ||
                                    lesson.content_type}
                                </span>
                                {lesson.duration_minutes && (
                                  <span className="text-xs text-muted-foreground">
                                    {lesson.duration_minutes} min
                                  </span>
                                )}
                                {lesson.is_required && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1 py-0"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {!lesson.is_published && (
                              <Badge variant="secondary" className="text-xs">
                                Draft
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {mod.lessons.length === 0 && (
                    <div className="px-4 py-3 pl-14 text-sm text-muted-foreground">
                      No lessons in this module.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Student progress tracking coming in next update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
