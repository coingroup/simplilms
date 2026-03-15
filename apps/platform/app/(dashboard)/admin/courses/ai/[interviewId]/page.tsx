import { requireRole } from "@simplilms/auth/server";
import {
  getAiInterview,
  type AiCourseInterviewRow,
} from "@simplilms/core/actions/ai-course";
import { InterviewChat } from "@simplilms/core/components/ai-course/interview-chat";
import { OutlineReview } from "@simplilms/core/components/ai-course/outline-review";
import { Card, CardContent } from "@simplilms/ui";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "AI Interview -- Admin",
};

interface InterviewPageProps {
  params: Promise<{ interviewId: string }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  await requireRole([
    "super_admin",
    "school_rep",
    "teacher_paid",
    "teacher_unpaid",
  ]);

  const { interviewId } = await params;
  const interview = await getAiInterview(interviewId);

  if (!interview) {
    redirect("/admin/courses/ai");
  }

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
        <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
          {interview.topic}
        </span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">
            {interview.topic}
          </h1>
        </div>
        {interview.target_audience && (
          <p className="text-sm text-gray-500 mt-1">
            Target audience: {interview.target_audience}
          </p>
        )}
      </div>

      {/* Content based on status */}
      <InterviewContent interview={interview} />
    </div>
  );
}

function InterviewContent({
  interview,
}: {
  interview: AiCourseInterviewRow;
}) {
  switch (interview.status) {
    case "interviewing":
      return <InterviewChat interview={interview} />;

    case "generating":
      return (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Generating your course...
              </h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                AI is analyzing your interview responses and building a complete
                course structure with modules, lessons, and quizzes. This may
                take a moment.
              </p>
            </div>
          </CardContent>
        </Card>
      );

    case "review":
      return <OutlineReview interview={interview} />;

    case "completed":
      return (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Course created successfully
              </h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                Your AI-generated course has been created and is ready for
                review. You can edit the content, add more materials, and publish
                it when ready.
              </p>
              {interview.generated_course_id && (
                <Link
                  href={`/admin/courses/${interview.generated_course_id}`}
                  className="inline-flex items-center gap-2 mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Course
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      );

    case "failed":
      return (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <XCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Generation failed
              </h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                {interview.error_message ||
                  "An error occurred while generating the course. Please try again."}
              </p>
              <div className="flex items-center gap-3 mt-6">
                <Link
                  href="/admin/courses/ai/new"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Link>
                <Link
                  href="/admin/courses/ai"
                  className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Back to AI Courses
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}
