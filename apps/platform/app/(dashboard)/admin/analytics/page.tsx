import { requireRole } from "@simplilms/auth/server";
import {
  getAnalyticsOverview,
  getEnrollmentTrends,
  getCoursePerformance,
  getQuizPerformance,
  getAtRiskStudents,
  getRevenueByMonth,
  getAnalyticsExportData,
} from "@simplilms/core/actions/analytics";
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Target,
  Award,
  CheckSquare,
} from "lucide-react";
import { StatCard } from "./components/stat-card";
import { MiniChart } from "./components/mini-chart";
import { RevenueChart } from "./components/revenue-chart";
import { CoursePerformanceTable } from "./components/course-performance-table";
import { QuizPerformanceTable } from "./components/quiz-performance-table";
import { AtRiskTable } from "./components/at-risk-table";
import { ExportButton } from "./components/export-button";

export const metadata = {
  title: "Analytics — Admin",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AdminAnalyticsPage() {
  await requireRole(["super_admin"]);

  // Fetch all analytics data in parallel
  const [overview, enrollmentTrends, coursePerformance, quizPerformance, atRiskStudents, revenueData] =
    await Promise.all([
      getAnalyticsOverview(),
      getEnrollmentTrends(30),
      getCoursePerformance(),
      getQuizPerformance(),
      getAtRiskStudents(),
      getRevenueByMonth(12),
    ]);

  // Bound export action
  const boundExport = async (type: string) => {
    "use server";
    return getAnalyticsExportData(type as "students" | "courses" | "quizzes" | "revenue");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform performance, student engagement, and revenue insights.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton
            exportAction={boundExport}
            type="students"
            label="Export Students"
          />
          <ExportButton
            exportAction={boundExport}
            type="courses"
            label="Export Courses"
          />
          <ExportButton
            exportAction={boundExport}
            type="revenue"
            label="Export Revenue"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Students"
          value={overview.totalStudents}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          label="Published Courses"
          value={overview.totalCourses}
          icon={BookOpen}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          label="Active Enrollments"
          value={overview.activeEnrollments}
          icon={GraduationCap}
          color="text-purple-600"
          bg="bg-purple-50"
          subtitle={`${overview.completedEnrollments} completed`}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(overview.totalRevenueCents)}
          icon={DollarSign}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          label="Avg Completion Rate"
          value={`${overview.avgCompletionRate}%`}
          icon={TrendingUp}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          label="Avg Quiz Score"
          value={`${overview.avgQuizScore}%`}
          icon={Target}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          label="Lessons Completed"
          value={overview.totalLessonsCompleted}
          icon={CheckSquare}
          color="text-cyan-600"
          bg="bg-cyan-50"
        />
        <StatCard
          label="At-Risk Students"
          value={atRiskStudents.length}
          icon={Award}
          color={atRiskStudents.length > 0 ? "text-red-600" : "text-gray-600"}
          bg={atRiskStudents.length > 0 ? "bg-red-50" : "bg-gray-50"}
          subtitle={
            atRiskStudents.length > 0
              ? "Require attention"
              : "All students on track"
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <MiniChart
          title="Enrollment Trend"
          data={enrollmentTrends.map((t) => ({
            label: t.date,
            value: t.count,
          }))}
          icon={<TrendingUp className="h-5 w-5" />}
          formatLabel={formatDate}
          subtitle="Last 30 days"
          color="bg-primary/70"
        />
        <RevenueChart
          data={revenueData}
          totalRevenueCents={overview.totalRevenueCents}
        />
      </div>

      {/* Course Performance Table */}
      <CoursePerformanceTable courses={coursePerformance} />

      {/* Quiz Performance Table */}
      <QuizPerformanceTable quizzes={quizPerformance} />

      {/* At-Risk Students */}
      <AtRiskTable students={atRiskStudents} />
    </div>
  );
}
