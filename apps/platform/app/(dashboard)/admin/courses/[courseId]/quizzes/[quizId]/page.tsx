import { requireRole } from "@simplilms/auth/server";
import { getCourseById } from "@simplilms/core/actions/courses";
import {
  getQuizById,
  getQuizQuestions,
  updateQuiz,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "@simplilms/core/actions/progress";
import { notFound } from "next/navigation";
import { QuizBuilderClient } from "./quiz-builder";

export const metadata = {
  title: "Quiz Builder -- Admin",
};

interface QuizBuilderPageProps {
  params: Promise<{ courseId: string; quizId: string }>;
}

export default async function QuizBuilderPage({
  params,
}: QuizBuilderPageProps) {
  await requireRole(["super_admin"]);

  const { courseId, quizId } = await params;
  const [course, quiz, questions] = await Promise.all([
    getCourseById(courseId),
    getQuizById(quizId),
    getQuizQuestions(quizId),
  ]);

  if (!course || !quiz) {
    notFound();
  }

  // Bind server actions
  const boundUpdateQuiz = async (data: {
    title?: string;
    description?: string;
    passing_score?: number;
    max_attempts?: number | null;
    time_limit_minutes?: number | null;
    shuffle_questions?: boolean;
    show_answers_after?: string;
    is_published?: boolean;
  }) => {
    "use server";
    return updateQuiz(quizId, courseId, data);
  };

  const boundCreateQuestion = async (data: {
    question_type: string;
    question_text: string;
    explanation?: string;
    options?: Array<{ id: string; text: string; is_correct?: boolean }>;
    points?: number;
  }) => {
    "use server";
    return createQuizQuestion(quizId, courseId, data);
  };

  const boundUpdateQuestion = async (
    questionId: string,
    data: {
      question_text?: string;
      explanation?: string;
      options?: Array<{ id: string; text: string; is_correct?: boolean }>;
      points?: number;
    }
  ) => {
    "use server";
    return updateQuizQuestion(questionId, courseId, data);
  };

  const boundDeleteQuestion = async (questionId: string) => {
    "use server";
    return deleteQuizQuestion(questionId, courseId);
  };

  return (
    <div className="space-y-6">
      <QuizBuilderClient
        courseId={courseId}
        quiz={quiz}
        questions={questions}
        courseName={course.title}
        updateQuizAction={boundUpdateQuiz}
        createQuestionAction={boundCreateQuestion}
        updateQuestionAction={boundUpdateQuestion}
        deleteQuestionAction={boundDeleteQuestion}
      />
    </div>
  );
}
