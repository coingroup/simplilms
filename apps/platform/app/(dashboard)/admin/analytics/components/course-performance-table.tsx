"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@simplilms/ui";
import type { CoursePerformanceRow } from "@simplilms/core/actions/analytics";
import { BookOpen, ArrowUpDown } from "lucide-react";
import Link from "next/link";

interface CoursePerformanceTableProps {
  courses: CoursePerformanceRow[];
}

type SortField =
  | "courseTitle"
  | "enrollmentCount"
  | "completionRate"
  | "avgProgressPct"
  | "avgQuizScore";

export function CoursePerformanceTable({
  courses,
}: CoursePerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>("enrollmentCount");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...courses].sort((a, b) => {
    const aVal = a[sortField] ?? -1;
    const bVal = b[sortField] ?? -1;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortAsc
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortAsc
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  function getProgressColor(pct: number) {
    if (pct >= 75) return "text-green-600";
    if (pct >= 50) return "text-amber-600";
    if (pct >= 25) return "text-orange-600";
    return "text-red-600";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Course Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium text-gray-500">
                  <button
                    onClick={() => toggleSort("courseTitle")}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Course
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-2 font-medium text-gray-500 text-center">
                  <button
                    onClick={() => toggleSort("enrollmentCount")}
                    className="flex items-center gap-1 hover:text-gray-900 mx-auto"
                  >
                    Enrollments
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-2 font-medium text-gray-500 text-center">
                  <button
                    onClick={() => toggleSort("completionRate")}
                    className="flex items-center gap-1 hover:text-gray-900 mx-auto"
                  >
                    Completion
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-2 font-medium text-gray-500 text-center">
                  <button
                    onClick={() => toggleSort("avgProgressPct")}
                    className="flex items-center gap-1 hover:text-gray-900 mx-auto"
                  >
                    Avg Progress
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-2 font-medium text-gray-500 text-center">
                  <button
                    onClick={() => toggleSort("avgQuizScore")}
                    className="flex items-center gap-1 hover:text-gray-900 mx-auto"
                  >
                    Quiz Score
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-2 font-medium text-gray-500 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((course) => (
                <tr key={course.courseId} className="hover:bg-gray-50">
                  <td className="py-3">
                    <Link
                      href={`/admin/analytics/courses/${course.courseId}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {course.courseTitle}
                    </Link>
                  </td>
                  <td className="py-3 text-center">{course.enrollmentCount}</td>
                  <td className="py-3 text-center">
                    <span className={getProgressColor(course.completionRate)}>
                      {course.completionRate}%
                    </span>
                    <span className="text-gray-400 text-xs ml-1">
                      ({course.completedCount})
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${course.avgProgressPct}%` }}
                        />
                      </div>
                      <span className="text-xs">{course.avgProgressPct}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    {course.avgQuizScore !== null ? (
                      <span
                        className={getProgressColor(course.avgQuizScore)}
                      >
                        {course.avgQuizScore}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    <Badge
                      variant={course.isPublished ? "default" : "secondary"}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-400"
                  >
                    No courses found
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
