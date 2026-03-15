import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@simplilms/ui";
import { BookOpen, Clock, Search } from "lucide-react";
import Link from "next/link";
import {
  getStudentCourseEnrollments,
  type CourseEnrollmentRow,
} from "@simplilms/core/actions/progress";
import { getCourseById, type CourseRow } from "@simplilms/core/actions/courses";

export const metadata = {
  title: "My Courses",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  dropped: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  dropped: "Dropped",
  expired: "Expired",
};

export default async function StudentCoursesPage() {
  const user = await requireRole(["super_admin", "student"]);

  const enrollments = await getStudentCourseEnrollments(user.user.id);

  const enrollmentsWithCourses: Array<{
    enrollment: CourseEnrollmentRow;
    course: CourseRow | null;
  }> = await Promise.all(
    enrollments.map(async (enrollment) => {
      const course = await getCourseById(enrollment.course_id);
      return { enrollment, course };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">My Courses</h1>
          <p className="text-sm text-muted-foreground">
            Track your course progress and continue learning.
          </p>
        </div>
        <Link
          href="/student/courses/browse"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Search className="h-4 w-4" />
          Browse Courses
        </Link>
      </div>

      {enrollmentsWithCourses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">No courses yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Browse available courses to start learning.
          </p>
          <Link
            href="/student/courses/browse"
            className="inline-flex items-center gap-2 mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollmentsWithCourses.map(({ enrollment, course }) => (
            <Link
              key={enrollment.id}
              href={`/student/courses/${enrollment.course_id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">
                      {course?.title || "Untitled Course"}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 ${STATUS_COLORS[enrollment.status] || ""}`}
                    >
                      {STATUS_LABELS[enrollment.status] || enrollment.status}
                    </Badge>
                  </div>
                  {course?.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {course.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{enrollment.progress_pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${enrollment.progress_pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Enrolled date */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Enrolled{" "}
                      {new Date(enrollment.enrolled_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
