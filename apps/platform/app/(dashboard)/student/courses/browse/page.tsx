import { requireRole } from "@simplilms/auth/server";
import {
  getPublishedCourses,
  type CourseRow,
} from "@simplilms/core/actions/courses";
import {
  getStudentCourseEnrollments,
  enrollStudentInCourse,
} from "@simplilms/core/actions/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@simplilms/ui";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Search,
  Users,
} from "lucide-react";
import { CourseCatalogClient } from "./catalog";

export const metadata = {
  title: "Browse Courses",
};

export default async function BrowseCoursesPage() {
  const user = await requireRole(["super_admin", "student"]);

  const [courses, enrollments] = await Promise.all([
    getPublishedCourses(),
    getStudentCourseEnrollments(user.user.id),
  ]);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  const boundEnroll = async (courseId: string) => {
    "use server";
    return enrollStudentInCourse(courseId, user.user.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Browse Courses</h1>
        <p className="text-sm text-muted-foreground">
          Discover available courses and start learning.
        </p>
      </div>

      <CourseCatalogClient
        courses={courses}
        enrolledCourseIds={Array.from(enrolledCourseIds)}
        enrollAction={boundEnroll}
      />
    </div>
  );
}
