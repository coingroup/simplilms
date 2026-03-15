import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { BookOpen, Users, MessageSquare } from "lucide-react";
import { getInstructorDashboardStats, getUnreadMessageCount } from "@simplilms/core";

export const metadata = {
  title: "Instructor Dashboard",
};

export default async function TeacherDashboardPage() {
  const user = await requireRole([
    "super_admin",
    "teacher_paid",
    "teacher_unpaid",
  ]);

  const [dashboardStats, unreadMessages] = await Promise.all([
    getInstructorDashboardStats(user.user.id),
    getUnreadMessageCount(user.user.id),
  ]);

  const stats = [
    {
      title: "My Classes",
      value: String(dashboardStats.activeClasses),
      icon: BookOpen,
      description:
        dashboardStats.totalClasses > dashboardStats.activeClasses
          ? `${dashboardStats.totalClasses} total (${dashboardStats.totalClasses - dashboardStats.activeClasses} inactive)`
          : "Active classes",
    },
    {
      title: "Total Students",
      value: String(dashboardStats.totalStudents),
      icon: Users,
      description: "Across all classes",
    },
    {
      title: "Messages",
      value: String(unreadMessages),
      icon: MessageSquare,
      description: unreadMessages === 1 ? "Unread message" : "Unread messages",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">
          Welcome back
          {user.profile?.firstName ? `, ${user.profile.firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your classes and track student attendance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
