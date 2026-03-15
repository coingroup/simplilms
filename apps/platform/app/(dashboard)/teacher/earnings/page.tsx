import { requireRole } from "@simplilms/auth/server";
import { redirect } from "next/navigation";
import { getInstructorEarnings } from "@simplilms/core";
import { EarningsSummary } from "@simplilms/core/components/teacher/earnings-summary";

export const metadata = {
  title: "Earnings",
};

export default async function TeacherEarningsPage() {
  const user = await requireRole(["super_admin", "teacher_paid"]);

  // Only teacher_paid can see earnings (teacher_unpaid redirected)
  if (user.role === "teacher_unpaid") {
    redirect("/teacher");
  }

  const earnings = await getInstructorEarnings(user.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Earnings</h1>
        <p className="text-sm text-muted-foreground">
          Track your commission earnings across all classes.
        </p>
      </div>

      <EarningsSummary earnings={earnings} />
    </div>
  );
}
