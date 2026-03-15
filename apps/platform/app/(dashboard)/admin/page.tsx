import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { Users, FileText, GraduationCap, DollarSign } from "lucide-react";
import { getDashboardStats, formatCurrency } from "@simplilms/core";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const user = await requireRole(["super_admin"]);
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Total Prospects",
      value: stats.totalProspects.toLocaleString(),
      icon: Users,
      description: "All-time inquiries",
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplications.toLocaleString(),
      icon: FileText,
      description: "Awaiting review",
    },
    {
      title: "Active Enrollments",
      value: stats.activeEnrollments.toLocaleString(),
      icon: GraduationCap,
      description: "Currently enrolled",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.totalRevenueCents),
      icon: DollarSign,
      description: "Total collected",
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
          Here&apos;s an overview of your platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => {
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
