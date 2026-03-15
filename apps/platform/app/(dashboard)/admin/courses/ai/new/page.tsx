import { requireRole } from "@simplilms/auth/server";
import { InterviewStartForm } from "@simplilms/core/components/ai-course/interview-start-form";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "New AI Course -- Admin",
};

export default async function NewAiCoursePage() {
  await requireRole([
    "super_admin",
    "school_rep",
    "teacher_paid",
    "teacher_unpaid",
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Courses
        </Link>
        <span className="text-sm text-gray-300">/</span>
        <Link
          href="/admin/courses/ai"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          AI Course Creator
        </Link>
        <span className="text-sm text-gray-300">/</span>
        <span className="text-sm text-gray-500">New</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">
            Create Course with AI
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Describe your course topic and let AI help you build a complete course
          structure with modules, lessons, and quizzes.
        </p>
      </div>

      {/* Form */}
      <InterviewStartForm />
    </div>
  );
}
