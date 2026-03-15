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
  CardHeader,
  CardTitle,
  Badge,
} from "@simplilms/ui";
import type {
  QuizRow,
  QuizQuestionRow,
} from "@simplilms/core/actions/progress";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  GripVertical,
  HelpCircle,
  Loader2,
  Plus,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";

interface QuizBuilderClientProps {
  courseId: string;
  quiz: QuizRow;
  questions: QuizQuestionRow[];
  courseName: string;
  updateQuizAction: (data: {
    title?: string;
    description?: string;
    passing_score?: number;
    max_attempts?: number | null;
    time_limit_minutes?: number | null;
    shuffle_questions?: boolean;
    show_answers_after?: string;
    is_published?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  createQuestionAction: (data: {
    question_type: string;
    question_text: string;
    explanation?: string;
    options?: Array<{ id: string; text: string; is_correct?: boolean }>;
    points?: number;
  }) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateQuestionAction: (
    questionId: string,
    data: {
      question_text?: string;
      explanation?: string;
      options?: Array<{ id: string; text: string; is_correct?: boolean }>;
      points?: number;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  deleteQuestionAction: (
    questionId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
  essay: "Essay",
};

export function QuizBuilderClient({
  courseId,
  quiz: initialQuiz,
  questions: initialQuestions,
  courseName,
  updateQuizAction,
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
}: QuizBuilderClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz settings state
  const [title, setTitle] = useState(initialQuiz.title);
  const [description, setDescription] = useState(
    initialQuiz.description || ""
  );
  const [passingScore, setPassingScore] = useState(
    initialQuiz.passing_score.toString()
  );
  const [maxAttempts, setMaxAttempts] = useState(
    initialQuiz.max_attempts?.toString() || ""
  );
  const [timeLimit, setTimeLimit] = useState(
    initialQuiz.time_limit_minutes?.toString() || ""
  );
  const [shuffleQuestions, setShuffleQuestions] = useState(
    initialQuiz.shuffle_questions
  );
  const [showAnswersAfter, setShowAnswersAfter] = useState(
    initialQuiz.show_answers_after
  );
  const [isPublished, setIsPublished] = useState(initialQuiz.is_published);

  // Questions state
  const [questions, setQuestions] = useState(initialQuestions);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState("multiple_choice");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleSaveSettings() {
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateQuizAction({
        title: title.trim(),
        description: description.trim() || undefined,
        passing_score: parseInt(passingScore, 10) || 70,
        max_attempts: maxAttempts ? parseInt(maxAttempts, 10) : null,
        time_limit_minutes: timeLimit ? parseInt(timeLimit, 10) : null,
        shuffle_questions: shuffleQuestions,
        show_answers_after: showAnswersAfter,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  function handleTogglePublished() {
    startTransition(async () => {
      const newState = !isPublished;
      const result = await updateQuizAction({ is_published: newState });
      if (result.success) {
        setIsPublished(newState);
      }
    });
  }

  function handleAddQuestion() {
    setShowAddQuestion(false);

    const defaultOptions =
      newQuestionType === "multiple_choice"
        ? [
            { id: crypto.randomUUID(), text: "Option A", is_correct: true },
            { id: crypto.randomUUID(), text: "Option B", is_correct: false },
            { id: crypto.randomUUID(), text: "Option C", is_correct: false },
            { id: crypto.randomUUID(), text: "Option D", is_correct: false },
          ]
        : newQuestionType === "true_false"
          ? [
              { id: crypto.randomUUID(), text: "True", is_correct: true },
              { id: crypto.randomUUID(), text: "False", is_correct: false },
            ]
          : newQuestionType === "short_answer"
            ? [{ id: crypto.randomUUID(), text: "", is_correct: true }]
            : [];

    startTransition(async () => {
      const result = await createQuestionAction({
        question_type: newQuestionType,
        question_text: "New question",
        options: defaultOptions,
        points: 1,
      });

      if (result.success && result.id) {
        const newQuestion: QuizQuestionRow = {
          id: result.id,
          tenant_id: "",
          quiz_id: initialQuiz.id,
          question_type: newQuestionType as QuizQuestionRow["question_type"],
          question_text: "New question",
          explanation: null,
          options: defaultOptions,
          points: 1,
          sort_order: questions.length,
          created_at: new Date().toISOString(),
        };
        setQuestions((prev) => [...prev, newQuestion]);
        setEditingQuestionId(result.id);
        router.refresh();
      }
    });
  }

  function handleDeleteQuestion(questionId: string) {
    setConfirmDeleteId(null);

    startTransition(async () => {
      const result = await deleteQuestionAction(questionId);
      if (result.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        if (editingQuestionId === questionId) {
          setEditingQuestionId(null);
        }
        router.refresh();
      }
    });
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6">
      {/* Back Link + Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {courseName}
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <Badge variant={isPublished ? "default" : "secondary"}>
              {isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {questions.length} question{questions.length !== 1 ? "s" : ""} &middot;{" "}
            {totalPoints} total points &middot; Passing: {passingScore}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant={isPublished ? "outline" : "default"}
            size="sm"
            onClick={handleTogglePublished}
            disabled={isPending}
          >
            {isPublished ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quiz-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Quiz title"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passing-score">Passing Score (%)</Label>
                <Input
                  id="passing-score"
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  min="0"
                  max="100"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiz-description">Description</Label>
              <Textarea
                id="quiz-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this quiz..."
                rows={2}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-attempts">Max Attempts</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  placeholder="Unlimited"
                  min="1"
                  disabled={isPending}
                />
                <p className="text-xs text-gray-400">Leave empty for unlimited</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (min)</Label>
                <Input
                  id="time-limit"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="No limit"
                  min="1"
                  disabled={isPending}
                />
                <p className="text-xs text-gray-400">Leave empty for no limit</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="show-answers">Show Answers</Label>
                <select
                  id="show-answers"
                  value={showAnswersAfter}
                  onChange={(e) =>
                    setShowAnswersAfter(
                      e.target.value as QuizRow["show_answers_after"]
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={isPending}
                >
                  <option value="submission">After Submission</option>
                  <option value="grading">After Grading</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  Shuffle question order for each attempt
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSaveSettings}
                disabled={isPending || !title.trim()}
                size="sm"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Questions ({questions.length})
          </h2>
          <Button
            size="sm"
            onClick={() => setShowAddQuestion(true)}
            disabled={isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No questions yet. Add your first question to build this quiz.
              </p>
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              isEditing={editingQuestionId === question.id}
              isPending={isPending}
              onEdit={() =>
                setEditingQuestionId(
                  editingQuestionId === question.id ? null : question.id
                )
              }
              onUpdate={(data) => {
                startTransition(async () => {
                  const result = await updateQuestionAction(question.id, data);
                  if (result.success) {
                    setQuestions((prev) =>
                      prev.map((q) =>
                        q.id === question.id ? { ...q, ...data } : q
                      )
                    );
                    router.refresh();
                  }
                });
              }}
              onDelete={() => setConfirmDeleteId(question.id)}
            />
          ))
        )}
      </div>

      {/* Add Question Dialog */}
      {showAddQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Question
              </h3>
              <button
                type="button"
                onClick={() => setShowAddQuestion(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      "multiple_choice",
                      "true_false",
                      "short_answer",
                      "essay",
                    ] as const
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewQuestionType(type)}
                      className={`p-3 rounded-lg border-2 transition-colors text-left ${
                        newQuestionType === type
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {QUESTION_TYPE_LABELS[type]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleAddQuestion} disabled={isPending}>
                {isPending ? "Adding..." : "Add Question"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowAddQuestion(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Question
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this question? This action cannot
              be undone.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="destructive"
                onClick={() => handleDeleteQuestion(confirmDeleteId)}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Question Card Component
// ============================================================

interface QuestionCardProps {
  question: QuizQuestionRow;
  index: number;
  isEditing: boolean;
  isPending: boolean;
  onEdit: () => void;
  onUpdate: (data: {
    question_text?: string;
    explanation?: string;
    options?: Array<{ id: string; text: string; is_correct?: boolean }>;
    points?: number;
  }) => void;
  onDelete: () => void;
}

function QuestionCard({
  question,
  index,
  isEditing,
  isPending,
  onEdit,
  onUpdate,
  onDelete,
}: QuestionCardProps) {
  const [questionText, setQuestionText] = useState(question.question_text);
  const [explanation, setExplanation] = useState(question.explanation || "");
  const [options, setOptions] = useState(question.options);
  const [points, setPoints] = useState(question.points.toString());

  function handleSave() {
    onUpdate({
      question_text: questionText.trim(),
      explanation: explanation.trim() || undefined,
      options,
      points: parseInt(points, 10) || 1,
    });
    onEdit(); // Close editing
  }

  function handleOptionTextChange(optionId: string, text: string) {
    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, text } : o))
    );
  }

  function handleCorrectChange(optionId: string) {
    if (
      question.question_type === "multiple_choice" ||
      question.question_type === "true_false"
    ) {
      // Single correct answer
      setOptions((prev) =>
        prev.map((o) => ({ ...o, is_correct: o.id === optionId }))
      );
    }
  }

  function handleAddOption() {
    setOptions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: `Option ${String.fromCharCode(65 + prev.length)}`,
        is_correct: false,
      },
    ]);
  }

  function handleRemoveOption(optionId: string) {
    setOptions((prev) => prev.filter((o) => o.id !== optionId));
  }

  const correctOption = options.find((o) => o.is_correct);

  return (
    <Card
      className={isEditing ? "ring-2 ring-primary ring-offset-2" : undefined}
    >
      <CardContent className="p-4">
        {isEditing ? (
          /* Editing Mode */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">
                  Q{index + 1}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {QUESTION_TYPE_LABELS[question.question_type]}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor={`pts-${question.id}`} className="text-xs">
                    Points:
                  </Label>
                  <Input
                    id={`pts-${question.id}`}
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-16 h-8 text-sm"
                    min="1"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`q-${question.id}`}>Question Text</Label>
              <Textarea
                id={`q-${question.id}`}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter your question..."
                rows={2}
                disabled={isPending}
              />
            </div>

            {/* Option Editor for multiple choice / true-false */}
            {(question.question_type === "multiple_choice" ||
              question.question_type === "true_false") && (
              <div className="space-y-2">
                <Label>Answer Options</Label>
                <div className="space-y-2">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={opt.is_correct}
                        onChange={() => handleCorrectChange(opt.id)}
                        disabled={isPending}
                        className="h-4 w-4 text-primary focus:ring-primary"
                        title="Mark as correct answer"
                      />
                      <Input
                        value={opt.text}
                        onChange={(e) =>
                          handleOptionTextChange(opt.id, e.target.value)
                        }
                        className="flex-1 h-9"
                        disabled={
                          isPending ||
                          question.question_type === "true_false"
                        }
                        placeholder="Option text"
                      />
                      {question.question_type === "multiple_choice" &&
                        options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(opt.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            disabled={isPending}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                    </div>
                  ))}
                </div>
                {question.question_type === "multiple_choice" &&
                  options.length < 6 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      disabled={isPending}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Option
                    </Button>
                  )}
                <p className="text-xs text-gray-400">
                  Select the radio button next to the correct answer.
                </p>
              </div>
            )}

            {/* Short answer expected value */}
            {question.question_type === "short_answer" && (
              <div className="space-y-2">
                <Label>Expected Answer</Label>
                <Input
                  value={options[0]?.text || ""}
                  onChange={(e) => {
                    const newOpts = [...options];
                    if (newOpts[0]) {
                      newOpts[0] = {
                        ...newOpts[0],
                        text: e.target.value,
                        is_correct: true,
                      };
                    } else {
                      newOpts.push({
                        id: crypto.randomUUID(),
                        text: e.target.value,
                        is_correct: true,
                      });
                    }
                    setOptions(newOpts);
                  }}
                  placeholder="Expected answer (case-insensitive)"
                  disabled={isPending}
                />
                <p className="text-xs text-gray-400">
                  Exact match (case-insensitive). Leave empty for manual
                  grading.
                </p>
              </div>
            )}

            {/* Essay has no options */}
            {question.question_type === "essay" && (
              <p className="text-xs text-gray-400 bg-yellow-50 p-2 rounded">
                Essay questions require manual grading. Students will see a
                text area to write their response.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor={`exp-${question.id}`}>
                Explanation (shown after submission)
              </Label>
              <Textarea
                id={`exp-${question.id}`}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the correct answer..."
                rows={2}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending || !questionText.trim()}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Save Question
              </Button>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="flex items-start gap-3">
            <GripVertical className="h-5 w-5 text-gray-300 shrink-0 mt-0.5 cursor-grab" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-400">
                      Q{index + 1}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {QUESTION_TYPE_LABELS[question.question_type]}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {question.points} pt{question.points !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {question.question_text}
                  </p>

                  {/* Show options preview */}
                  {(question.question_type === "multiple_choice" ||
                    question.question_type === "true_false") && (
                    <div className="mt-2 space-y-1">
                      {options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`text-xs flex items-center gap-1.5 ${
                            opt.is_correct
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {opt.is_correct ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <span className="w-3" />
                          )}
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === "short_answer" &&
                    correctOption?.text && (
                      <p className="text-xs text-green-600 mt-1">
                        Expected: {correctOption.text}
                      </p>
                    )}

                  {question.explanation && (
                    <p className="text-xs text-gray-400 mt-1.5 italic">
                      {question.explanation}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={onEdit}>
                    <Settings className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
