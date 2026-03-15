import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { BarChart3, Users, GraduationCap, BookOpen, DollarSign } from "lucide-react";
import { createServerClient } from "@simplilms/auth/server";

export const metadata = {
  title: "Analytics -- Admin",
};

export default async function AdminAnalyticsPage() {
  await requireRole(["super_admin"]);

  const supabase = await createServerClient();

  // Fetch counts in parallel
  const [
    { count: studentCount },
    { count: courseCount },
    { count: enrollmentCount },
    { count: instructorCount },
  ] = await Promise.all([
    (supabase as any)
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
    (supabase as any)
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    (supabase as any)
      .from("course_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    (supabase as any)
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["teacher_paid", "teacher_unpaid"]),
  ]);

  const stats = [
    {
      label: "Total Students",
      value: studentCount || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Published Courses",
      value: courseCount || 0,
      icon: BookOpen,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Active Enrollments",
      value: enrollmentCount || 0,
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Instructors",
      value: instructorCount || 0,
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform overview and key metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Detailed charts for enrollment trends, completion rates, revenue,
            and quiz performance are coming in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
