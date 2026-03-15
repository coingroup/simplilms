import { requireRole } from "@simplilms/auth/server";
import { createCourse } from "@simplilms/core/actions/courses";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CourseCreateForm } from "./form";

export const metadata = {
  title: "New Course -- Admin",
};

export default async function NewCoursePage() {
  await requireRole(["super_admin"]);

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

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set up a new course with content modules and lessons.
        </p>
      </div>

      <CourseCreateForm action={createCourse} />
    </div>
  );
}
