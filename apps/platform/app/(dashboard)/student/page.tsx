import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { GraduationCap, DollarSign, BookOpen, MessageSquare } from "lucide-react";
import {
  getEnrollmentsByUserId,
  getPaymentsByUserId,
  getPrograms,
  getUnreadMessageCount,
  getStudentClasses,
  formatCurrency,
} from "@simplilms/core";

export const metadata = {
  title: "Student Dashboard",
};

export default async function StudentDashboardPage() {
  const user = await requireRole(["super_admin", "student"]);

  const [enrollments, payments, programs, unreadMessages, classes] = await Promise.all([
    getEnrollmentsByUserId(user.user.id),
    getPaymentsByUserId(user.user.id),
    getPrograms(),
    getUnreadMessageCount(user.user.id),
    getStudentClasses(user.user.id),
  ]);

  const activeEnrollment = enrollments.find(
    (e) => e.status === "active" || e.status === "payment_plan_active"
  );

  const program = activeEnrollment
    ? programs.find((p) => p.id === activeEnrollment.program_id)
    : null;

  const pendingBalance = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const stats = [
    {
      title: "My Program",
      value: program?.name || "\u2014",
      icon: GraduationCap,
      description: activeEnrollment
        ? `Enrollment: ${activeEnrollment.enrollment_number || "Processing"}`
        : "Not enrolled",
    },
    {
      title: "Balance Due",
      value: pendingBalance > 0 ? formatCurrency(pendingBalance) : "$0.00",
      icon: DollarSign,
      description: pendingBalance > 0 ? "Outstanding balance" : "All paid",
    },
    {
      title: "My Classes",
      value: String(classes.length),
      icon: BookOpen,
      description: classes.length === 1 ? "Enrolled class" : "Enrolled classes",
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
          Here&apos;s your student dashboard overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
