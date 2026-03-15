"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@simplilms/ui";
import type { QuizPerformanceRow } from "@simplilms/core/actions/analytics";
import { HelpCircle } from "lucide-react";

interface QuizPerformanceTableProps {
  quizzes: QuizPerformanceRow[];
}

export function QuizPerformanceTable({ quizzes }: QuizPerformanceTableProps) {
  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  }

  function formatTime(seconds: number | null) {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Quiz Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium text-gray-500">Quiz</th>
                <th className="pb-2 font-medium text-gray-500">Course</th>
                <th className="pb-2 font-medium text-gray-500 text-center">
                  Attempts
                </th>
                <th className="pb-2 font-medium text-gray-500 text-center">
                  Avg Score
                </th>
                <th className="pb-2 font-medium text-gray-500 text-center">
                  Pass Rate
                </th>
                <th className="pb-2 font-medium text-gray-500 text-center">
                  Avg Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quizzes.map((quiz) => (
                <tr key={quiz.quizId} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">{quiz.quizTitle}</td>
                  <td className="py-3 text-gray-600">{quiz.courseTitle}</td>
                  <td className="py-3 text-center">{quiz.attemptCount}</td>
                  <td className="py-3 text-center">
                    {quiz.attemptCount > 0 ? (
                      <span className={getScoreColor(quiz.avgScore)}>
                        {quiz.avgScore}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {quiz.attemptCount > 0 ? (
                      <span className={getScoreColor(quiz.passRate)}>
                        {quiz.passRate}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 text-center text-gray-600">
                    {formatTime(quiz.avgTimeSeconds)}
                  </td>
                </tr>
              ))}
              {quizzes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-400"
                  >
                    No published quizzes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
