"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
  Badge,
} from "@simplilms/ui";
import type { QuizRow } from "@simplilms/core/actions/progress";
import {
  Check,
  HelpCircle,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";

interface QuizListClientProps {
  courseId: string;
  quizzes: QuizRow[];
  createQuizAction: (data: {
    title: string;
    description?: string;
    quiz_type?: string;
    passing_score?: number;
  }) => Promise<{ success: boolean; error?: string; id?: string }>;
}

const QUIZ_TYPE_LABELS: Record<string, string> = {
  graded: "Graded",
  practice: "Practice",
  survey: "Survey",
};

const QUIZ_TYPE_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  graded: "default",
  practice: "secondary",
  survey: "outline",
};

export function QuizListClient({
  courseId,
  quizzes: initialQuizzes,
  createQuizAction,
}: QuizListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newQuizType, setNewQuizType] = useState("graded");
  const [newPassingScore, setNewPassingScore] = useState("70");

  function handleCreate() {
    if (!newTitle.trim()) return;

    startTransition(async () => {
      const result = await createQuizAction({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        quiz_type: newQuizType,
        passing_score: parseInt(newPassingScore, 10) || 70,
      });

      if (result.success && result.id) {
        // Navigate to the quiz builder
        router.push(`/admin/courses/${courseId}/quizzes/${result.id}`);
      }
    });
  }

  return (
    <div className="space-y-4">
      {quizzes.length === 0 && !showCreate ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-4">
              No quizzes yet. Create your first quiz to assess student
              knowledge.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quiz Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/admin/courses/${courseId}/quizzes/${quiz.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {quiz.title}
                          </h3>
                        </div>
                        {quiz.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              QUIZ_TYPE_COLORS[quiz.quiz_type] || "secondary"
                            }
                          >
                            {QUIZ_TYPE_LABELS[quiz.quiz_type] || quiz.quiz_type}
                          </Badge>
                          <Badge
                            variant={
                              quiz.is_published ? "default" : "secondary"
                            }
                          >
                            {quiz.is_published ? "Published" : "Draft"}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            Pass: {quiz.passing_score}%
                          </span>
                          {quiz.max_attempts && (
                            <span className="text-xs text-gray-400">
                              Max: {quiz.max_attempts} attempt
                              {quiz.max_attempts !== 1 ? "s" : ""}
                            </span>
                          )}
                          {quiz.time_limit_minutes && (
                            <span className="text-xs text-gray-400">
                              {quiz.time_limit_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Create Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </>
      )}

      {/* Create Dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Quiz
              </h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quiz-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Module 1 Assessment"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-desc">Description</Label>
                <Textarea
                  id="quiz-desc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-type">Type</Label>
                  <select
                    id="quiz-type"
                    value={newQuizType}
                    onChange={(e) => setNewQuizType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="graded">Graded</option>
                    <option value="practice">Practice</option>
                    <option value="survey">Survey</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-passing">Passing Score (%)</Label>
                  <Input
                    id="quiz-passing"
                    type="number"
                    value={newPassingScore}
                    onChange={(e) => setNewPassingScore(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleCreate}
                disabled={!newTitle.trim() || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create & Build"
                )}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
