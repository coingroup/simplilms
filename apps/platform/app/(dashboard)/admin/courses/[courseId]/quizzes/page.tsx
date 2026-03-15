import { requireRole } from "@simplilms/auth/server";
import {
  getCourseById,
} from "@simplilms/core/actions/courses";
import {
  getCourseQuizzes,
  createQuiz,
} from "@simplilms/core/actions/progress";
import { Badge, Button } from "@simplilms/ui";
import { ArrowLeft, HelpCircle, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizListClient } from "./quiz-list";

export const metadata = {
  title: "Quizzes -- Admin",
};

interface QuizListPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function QuizListPage({ params }: QuizListPageProps) {
  await requireRole(["super_admin"]);

  const { courseId } = await params;
  const [course, quizzes] = await Promise.all([
    getCourseById(courseId),
    getCourseQuizzes(courseId),
  ]);

  if (!course) {
    notFound();
  }

  const boundCreateQuiz = async (data: {
    title: string;
    description?: string;
    quiz_type?: string;
    passing_score?: number;
  }) => {
    "use server";
    return createQuiz(courseId, data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/courses/${courseId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {course.title}
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} in this
            course
          </p>
        </div>
      </div>

      <QuizListClient
        courseId={courseId}
        quizzes={quizzes}
        createQuizAction={boundCreateQuiz}
      />
    </div>
  );
}
