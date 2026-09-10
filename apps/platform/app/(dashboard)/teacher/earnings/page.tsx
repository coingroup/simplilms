import { requireRole } from "@simplilms/auth/server";
import { redirect } from "next/navigation";
import { getInstructorEarnings } from "@simplilms/core";
import {
  getConnectAccountStatus,
  createConnectOnboardingLink,
  createConnectDashboardLink,
} from "@simplilms/core/actions/stripe-connect";
import { EarningsSummary } from "@simplilms/core/components/teacher/earnings-summary";
import { ConnectStatusCard } from "./connect-status";

export const metadata = {
  title: "Earnings",
};

export default async function TeacherEarningsPage() {
  const user = await requireRole(["super_admin", "teacher_paid"]);

  // Only teacher_paid can see earnings (teacher_unpaid redirected)
  if (user.role === "teacher_unpaid") {
    redirect("/teacher");
  }

  const [earnings, connectStatus] = await Promise.all([
    getInstructorEarnings(user.user.id),
    getConnectAccountStatus(user.user.id),
  ]);

  const boundOnboard = async () => {
    "use server";
    return createConnectOnboardingLink();
  };

  const boundDashboard = async () => {
    "use server";
    return createConnectDashboardLink();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Earnings</h1>
        <p className="text-sm text-muted-foreground">
          Track your commission earnings across all classes.
        </p>
      </div>

      <ConnectStatusCard
        status={connectStatus}
        onOnboard={boundOnboard}
        onDashboard={boundDashboard}
      />

      <EarningsSummary earnings={earnings} />
    </div>
  );
}
