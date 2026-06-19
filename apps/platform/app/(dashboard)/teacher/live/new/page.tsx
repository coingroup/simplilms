import { requireRole } from "@simplilms/auth/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SessionScheduler } from "@simplilms/core/components/live-classes/session-scheduler";

export const metadata = {
  title: "Schedule Live Session",
};

export default async function TeacherNewLiveSessionPage() {
  await requireRole(["teacher_paid", "teacher_unpaid", "super_admin"]);

  return (
    <div className="space-y-6">
      <Link
        href="/teacher/live"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Live Classes
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold">Schedule Live Session</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add the details for your upcoming live class. Paste in the Zoom links
          from your Zoom account.
        </p>
      </div>

      <SessionScheduler redirectTo="/teacher/live" />
    </div>
  );
}
