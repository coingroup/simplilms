import { requireRole } from "@simplilms/auth/server";
import { formatDate } from "@simplilms/core";
import { getCourses } from "@simplilms/core/actions/courses";
import { getCourseEnrollmentCount } from "@simplilms/core/actions/progress";
import { Badge } from "@simplilms/ui";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Courses -- Admin",
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

export default async function AdminCoursesPage() {
  await requireRole(["super_admin"]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">
            {courses.length} course{courses.length !== 1 ? "s" : ""} managed
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No courses found.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click &quot;Create Course&quot; to build your first course.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Title
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Category
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Difficulty
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Students
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                      >
                        {course.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {course.category || "\u2014"}
                    </td>
                    <td className="py-3 px-4">
                      {course.difficulty ? (
                        <Badge
                          variant={
                            DIFFICULTY_COLORS[course.difficulty] || "secondary"
                          }
                        >
                          {DIFFICULTY_LABELS[course.difficulty] ||
                            course.difficulty}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">{"\u2014"}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          course.is_published ? "default" : "secondary"
                        }
                      >
                        {course.is_published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {enrollmentMap.get(course.id) || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(course.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
