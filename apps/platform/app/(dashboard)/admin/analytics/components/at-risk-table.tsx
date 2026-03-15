"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@simplilms/ui";
import type { AtRiskStudent } from "@simplilms/core/actions/analytics";
import { AlertTriangle } from "lucide-react";

interface AtRiskTableProps {
  students: AtRiskStudent[];
}

export function AtRiskTable({ students }: AtRiskTableProps) {
  function getRiskBadge(score: number) {
    if (score >= 70) {
      return <Badge variant="destructive">High Risk</Badge>;
    }
    if (score >= 50) {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          Medium Risk
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        Low Risk
      </Badge>
    );
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            At-Risk Students
          </CardTitle>
          {students.length > 0 && (
            <span className="text-sm text-gray-500">
              {students.length} student{students.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No at-risk students detected. All students are making progress!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-gray-500">Student</th>
                  <th className="pb-2 font-medium text-gray-500 text-center">
                    Risk Level
                  </th>
                  <th className="pb-2 font-medium text-gray-500">
                    Risk Factors
                  </th>
                  <th className="pb-2 font-medium text-gray-500 text-center">
                    Progress
                  </th>
                  <th className="pb-2 font-medium text-gray-500 text-center">
                    Courses
                  </th>
                  <th className="pb-2 font-medium text-gray-500 text-center">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <span className="font-medium">
                          {student.firstName || ""} {student.lastName || ""}
                        </span>
                        {student.email && (
                          <p className="text-xs text-gray-400">
                            {student.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      {getRiskBadge(student.riskScore)}
                    </td>
                    <td className="py-3">
                      <ul className="space-y-0.5">
                        {student.riskFactors.map((factor, i) => (
                          <li
                            key={i}
                            className="text-xs text-gray-600 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              student.avgProgressPct < 25
                                ? "bg-red-500"
                                : student.avgProgressPct < 50
                                ? "bg-amber-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${student.avgProgressPct}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs">
                          {student.avgProgressPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      {student.enrolledCourses}
                    </td>
                    <td className="py-3 text-center text-gray-600">
                      {formatDate(student.lastAccessedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
