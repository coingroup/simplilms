import { requireRole } from "@simplilms/auth/server";
import { getCourseAnalytics } from "@simplilms/core/actions/analytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@simplilms/ui";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  TrendingUp,
  BookOpen,
  HelpCircle,
  Trophy,
  Target,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MiniChart } from "../../components/mini-chart";

export const metadata = {
  title: "Course Analytics — Admin",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

export default async function CourseAnalyticsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireRole(["super_admin"]);
  const { courseId } = await params;

  const analytics = await getCourseAnalytics(courseId);
  if (!analytics) notFound();

  const { course, enrollmentTrend, moduleCompletion, quizResults, topStudents } =
    analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/analytics"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Analytics
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-sm text-gray-500 mt-1">Course performance analytics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course.enrollmentCount}</p>
                <p className="text-xs text-gray-500">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course.completedCount}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-50">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course.avgProgress}%</p>
                <p className="text-xs text-gray-500">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {course.enrollmentCount > 0
                    ? Math.round(
                        (course.completedCount / course.enrollmentCount) * 100
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs text-gray-500">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Trend */}
      <MiniChart
        title="Enrollment Trend"
        data={enrollmentTrend.map((t) => ({
          label: t.date,
          value: t.count,
        }))}
        icon={<TrendingUp className="h-5 w-5" />}
        formatLabel={formatDate}
        subtitle="Last 30 days"
        color="bg-primary/70"
      />

      {/* Module Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Module Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moduleCompletion.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No modules found
            </p>
          ) : (
            <div className="space-y-4">
              {moduleCompletion.map((mod) => (
                <div key={mod.moduleId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      {mod.moduleTitle}
                    </span>
                    <span className="text-gray-500">
                      {mod.lessonCount} lesson{mod.lessonCount !== 1 ? "s" : ""}{" "}
                      · {mod.avgCompletion}% completed
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${mod.avgCompletion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Results */}
      {quizResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-gray-500">Quiz</th>
                    <th className="pb-2 font-medium text-gray-500 text-center">
                      Attempts
                    </th>
                    <th className="pb-2 font-medium text-gray-500 text-center">
                      Avg Score
                    </th>
                    <th className="pb-2 font-medium text-gray-500 text-center">
                      Pass Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quizResults.map((quiz) => (
                    <tr key={quiz.quizId} className="hover:bg-gray-50">
                      <td className="py-3 font-medium">{quiz.quizTitle}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Students */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topStudents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No enrolled students yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-gray-500">#</th>
                    <th className="pb-2 font-medium text-gray-500">Student</th>
                    <th className="pb-2 font-medium text-gray-500 text-center">
                      Progress
                    </th>
                    <th className="pb-2 font-medium text-gray-500 text-center">
                      Lessons
                    </th>
                    <th className="pb-2 font-medium text-gray-500 text-center">
                      Quiz Avg
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topStudents.map((student, i) => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-400">{i + 1}</td>
                      <td className="py-3">
                        <span className="font-medium">
                          {student.firstName || ""} {student.lastName || ""}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${student.progressPct}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs">
                            {student.progressPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        {student.lessonsCompleted}
                      </td>
                      <td className="py-3 text-center">
                        {student.avgQuizScore !== null ? (
                          <span
                            className={getScoreColor(student.avgQuizScore)}
                          >
                            {student.avgQuizScore}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

