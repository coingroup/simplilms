import { requireRole } from "@simplilms/auth/server";
import { getCourses } from "@simplilms/core/actions/courses";
import { getCourseEnrollmentCount } from "@simplilms/core/actions/progress";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { BookOpen, Users } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "My Courses",
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

export default async function TeacherCoursesPage() {
  await requireRole(["teacher_paid", "teacher_unpaid"]);

  const courses = await getCourses();

  // Fetch enrollment counts for all courses
  const enrollmentCounts = await Promise.all(
    courses.map(async (course) => {
      const count = await getCourseEnrollmentCount(course.id);
      return { courseId: course.id, count };
    })
  );

  const enrollmentMap = new Map(
    enrollmentCounts.map((e) => [e.courseId, e.count])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">My Courses</h1>
        <p className="text-sm text-muted-foreground">
          View your assigned courses and student progress.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">
            No courses assigned yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You don&apos;t have any courses assigned yet. Contact your
            administrator.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/teacher/courses/${course.id}`}
              className="block group"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <Badge
                      variant={course.is_published ? "default" : "secondary"}
                    >
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {course.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {enrollmentMap.get(course.id) || 0} student
                      {(enrollmentMap.get(course.id) || 0) !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {course.category && (
                    <p className="text-sm text-muted-foreground">
                      {course.category}
                    </p>
                  )}

                  {course.difficulty && (
                    <Badge
                      variant={
                        DIFFICULTY_COLORS[course.difficulty] || "secondary"
                      }
                    >
                      {DIFFICULTY_LABELS[course.difficulty] ||
                        course.difficulty}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
