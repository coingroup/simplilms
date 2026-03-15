import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { Users, Phone, Clock } from "lucide-react";
import { getRepDashboardStats } from "@simplilms/core";

export const metadata = {
  title: "Admissions Dashboard",
};

export default async function RepDashboardPage() {
  const user = await requireRole(["super_admin", "school_rep"]);
  const stats = await getRepDashboardStats();

  const cards = [
    {
      title: "My Prospects",
      value: stats.myProspects.toLocaleString(),
      icon: Users,
      description: "Assigned to you",
    },
    {
      title: "Pending Calls",
      value: stats.pendingCalls.toLocaleString(),
      icon: Phone,
      description: "Scheduled discovery calls",
    },
    {
      title: "Recent Inquiries",
      value: stats.recentInquiries.toLocaleString(),
      icon: Clock,
      description: "Last 7 days",
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
          Manage your prospect pipeline and discovery calls.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
