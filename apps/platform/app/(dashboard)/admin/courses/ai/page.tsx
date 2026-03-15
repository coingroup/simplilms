import { requireRole } from "@simplilms/auth/server";
import { formatDate } from "@simplilms/core";
import {
  getAiInterviews,
  type AiCourseInterviewRow,
} from "@simplilms/core/actions/ai-course";
import { InterviewStatusBadge } from "@simplilms/core/components/ai-course/interview-status-badge";
import { Badge } from "@simplilms/ui";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "AI Course Creator -- Admin",
};

const MODE_LABELS: Record<string, string> = {
  interview: "Interview",
  document: "Document",
  topic: "Topic",
};

export default async function AiCourseCreatorPage() {
  await requireRole([
    "super_admin",
    "school_rep",
    "teacher_paid",
    "teacher_unpaid",
  ]);

  const interviews = await getAiInterviews();

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
        <span className="text-sm text-gray-500">AI Course Creator</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">
              AI Course Creator
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Create courses with AI-powered interviews and document analysis.
          </p>
        </div>
        <Link
          href="/admin/courses/ai/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create with AI
        </Link>
      </div>

      {/* Interviews Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {interviews.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900">
              No AI-generated courses yet
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Get started by creating your first course with AI. You can
              interview with an AI assistant or upload existing documents to
              generate a full course structure.
            </p>
            <Link
              href="/admin/courses/ai/new"
              className="inline-flex items-center gap-2 mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Create Your First AI Course
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Topic
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Mode
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Created
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {interviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/courses/ai/${interview.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                      >
                        {interview.topic}
                      </Link>
                      {interview.target_audience && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          For: {interview.target_audience}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <InterviewStatusBadge status={interview.status} />
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {MODE_LABELS[interview.generation_mode] ||
                          interview.generation_mode}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(interview.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/courses/ai/${interview.id}`}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {interview.status === "interviewing"
                          ? "Continue"
                          : interview.status === "review"
                            ? "Review"
                            : interview.status === "completed"
                              ? "View Course"
                              : "View"}
                      </Link>
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
