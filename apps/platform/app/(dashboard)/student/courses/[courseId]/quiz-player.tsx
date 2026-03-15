"use client";

import { useState, useEffect, useTransition } from "react";
import { Button, Card, CardContent, Badge } from "@simplilms/ui";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";
import {
  getQuizById,
  getQuizQuestions,
  getQuizAttempts,
  startQuizAttempt,
  submitQuizAttempt,
} from "@simplilms/core/actions/progress";
import type {
  QuizRow,
  QuizQuestionRow,
  QuizAttemptRow,
} from "@simplilms/core/actions/progress";

interface QuizPlayerProps {
  quizId: string;
  studentId: string;
  onComplete?: () => void;
}

type QuizState = "loading" | "intro" | "taking" | "submitted" | "results";

export function QuizPlayer({ quizId, studentId, onComplete }: QuizPlayerProps) {
  const [isPending, startTransition] = useTransition();
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [quiz, setQuiz] = useState<QuizRow | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionRow[]>([]);
  const [attempts, setAttempts] = useState<QuizAttemptRow[]>([]);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, { selected?: string; text?: string }>
  >({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load quiz data
  useEffect(() => {
    async function loadQuiz() {
      const [quizData, questionsData, attemptsData] = await Promise.all([
        getQuizById(quizId),
        getQuizQuestions(quizId),
        getQuizAttempts(quizId, studentId),
      ]);

      setQuiz(quizData);
      setQuestions(questionsData);
      setAttempts(attemptsData);

      // Check for in-progress attempt
      const inProgress = attemptsData.find((a) => a.status === "in_progress");
      if (inProgress) {
        setCurrentAttemptId(inProgress.id);
        // Restore answers
        if (inProgress.answers) {
          const restored: Record<string, { selected?: string; text?: string }> =
            {};
          for (const a of inProgress.answers) {
            restored[a.question_id] = {
              selected: a.selected,
              text: a.text,
            };
          }
          setAnswers(restored);
        }
        setQuizState("taking");
      } else if (
        attemptsData.length > 0 &&
        attemptsData[0].status !== "in_progress"
      ) {
        // Show most recent result
        const latest = attemptsData[0];
        setResult({
          score: latest.score_pct || 0,
          passed: latest.passed || false,
        });
        setQuizState("results");
      } else {
        setQuizState("intro");
      }
    }

    loadQuiz();
  }, [quizId, studentId]);

  function handleStartQuiz() {
    setError(null);
    startTransition(async () => {
      const result = await startQuizAttempt(quizId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setCurrentAttemptId(result.attemptId || null);
      setAnswers({});
      setCurrentQuestion(0);
      setQuizState("taking");
    });
  }

  function handleSelectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], selected: optionId },
    }));
  }

  function handleTextAnswer(questionId: string, text: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], text },
    }));
  }

  function handleSubmitQuiz() {
    if (!currentAttemptId) return;
    setError(null);

    const formattedAnswers = questions.map((q) => ({
      question_id: q.id,
      selected: answers[q.id]?.selected,
      text: answers[q.id]?.text,
    }));

    startTransition(async () => {
      const res = await submitQuizAttempt(currentAttemptId, formattedAnswers);
      if (res.error) {
        setError(res.error);
        return;
      }
      setResult({
        score: res.score || 0,
        passed: res.passed || false,
      });
      setQuizState("results");
      onComplete?.();
    });
  }

  if (quizState === "loading" || !quiz) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Intro screen
  if (quizState === "intro") {
    const attemptsUsed = attempts.filter(
      (a) => a.status !== "in_progress"
    ).length;
    const canAttempt =
      !quiz.max_attempts || attemptsUsed < quiz.max_attempts;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{quiz.title}</h3>
        {quiz.description && (
          <p className="text-sm text-muted-foreground">{quiz.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>{questions.length} questions</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Trophy className="h-4 w-4" />
            <span>Passing: {quiz.passing_score}%</span>
          </div>
          {quiz.time_limit_minutes && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{quiz.time_limit_minutes} minutes</span>
            </div>
          )}
          {quiz.max_attempts && (
            <div className="flex items-center gap-2 text-gray-600">
              <RotateCcw className="h-4 w-4" />
              <span>
                {attemptsUsed}/{quiz.max_attempts} attempts used
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {canAttempt ? (
          <Button onClick={handleStartQuiz} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Start Quiz
          </Button>
        ) : (
          <p className="text-sm text-red-600">
            You have used all available attempts for this quiz.
          </p>
        )}
      </div>
    );
  }

  // Taking quiz
  if (quizState === "taking") {
    const question = questions[currentQuestion];
    if (!question) return null;

    const answeredCount = Object.keys(answers).filter(
      (k) => answers[k]?.selected || answers[k]?.text
    ).length;

    return (
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span>
            {answeredCount}/{questions.length} answered
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-gray-400 shrink-0 mt-0.5">
              Q{currentQuestion + 1}.
            </span>
            <p className="text-sm font-medium text-gray-900">
              {question.question_text}
            </p>
          </div>

          {/* Answer Options */}
          {(question.question_type === "multiple_choice" ||
            question.question_type === "true_false") && (
            <div className="space-y-2 pl-7">
              {question.options.map((option) => {
                const isSelected =
                  answers[question.id]?.selected === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      handleSelectAnswer(question.id, option.id)
                    }
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors text-sm ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          )}

          {(question.question_type === "short_answer" ||
            question.question_type === "essay") && (
            <div className="pl-7">
              <textarea
                value={answers[question.id]?.text || ""}
                onChange={(e) =>
                  handleTextAnswer(question.id, e.target.value)
                }
                placeholder={
                  question.question_type === "essay"
                    ? "Write your response..."
                    : "Type your answer..."
                }
                rows={question.question_type === "essay" ? 6 : 2}
                className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {/* Question dots */}
            {questions.map((q, i) => {
              const hasAnswer = answers[q.id]?.selected || answers[q.id]?.text;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestion(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === currentQuestion
                      ? "bg-primary"
                      : hasAnswer
                        ? "bg-green-500"
                        : "bg-gray-300"
                  }`}
                />
              );
            })}
          </div>
          {currentQuestion < questions.length - 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentQuestion((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isPending}
              size="sm"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : null}
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Results
  if (quizState === "results" && result) {
    const latestAttempt = attempts[0];
    const attemptsUsed = attempts.filter(
      (a) => a.status !== "in_progress"
    ).length;
    const canRetry =
      !quiz.max_attempts || attemptsUsed < quiz.max_attempts;

    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          {result.passed ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-600">
                Quiz Passed!
              </h3>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-600">
                Quiz Not Passed
              </h3>
            </>
          )}
          <p className="text-3xl font-bold mt-2">{result.score}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            Passing score: {quiz.passing_score}%
          </p>
        </div>

        {/* Show answers if allowed */}
        {quiz.show_answers_after !== "never" &&
          latestAttempt &&
          latestAttempt.answers && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">
                Review Answers
              </h4>
              {questions.map((q, i) => {
                const answer = latestAttempt.answers.find(
                  (a: any) => a.question_id === q.id
                );
                const correctOption = q.options.find((o) => o.is_correct);
                const isCorrect =
                  answer?.selected === correctOption?.id;

                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border ${
                      isCorrect
                        ? "border-green-200 bg-green-50/50"
                        : "border-red-200 bg-red-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          Q{i + 1}. {q.question_text}
                        </p>
                        {q.explanation && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {/* Retry or continue */}
        <div className="flex items-center gap-3 pt-4 border-t">
          {canRetry && !result.passed && (
            <Button
              variant="outline"
              onClick={() => {
                setQuizState("intro");
                setResult(null);
                setAnswers({});
                setCurrentQuestion(0);
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
