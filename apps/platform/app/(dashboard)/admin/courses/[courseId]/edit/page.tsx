import { requireRole } from "@simplilms/auth/server";
import {
  getCourseById,
  updateCourse,
} from "@simplilms/core/actions/courses";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CourseEditForm } from "./form";

export const metadata = {
  title: "Edit Course -- Admin",
};

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  await requireRole(["super_admin"]);
  const { courseId } = await params;

  const course = await getCourseById(courseId);
  if (!course) notFound();

  const boundUpdate = async (formData: FormData) => {
    "use server";
    return updateCourse(courseId, formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/courses/${courseId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update the course settings and metadata.
        </p>
      </div>
      <CourseEditForm course={course} updateAction={boundUpdate} />
    </div>
  );
}
