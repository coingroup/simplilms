import { requireRole } from "@simplilms/auth/server";
import { getInstructorClasses } from "@simplilms/core";
import { TeacherClassCard } from "@simplilms/core/components/teacher/teacher-class-card";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "My Classes",
};

export default async function TeacherClassesPage() {
  const user = await requireRole(["super_admin", "teacher_paid", "teacher_unpaid"]);
  const classes = await getInstructorClasses(user.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">My Classes</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your assigned classes.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">
            No classes assigned
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You don&apos;t have any classes assigned yet. Contact your
            administrator.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <TeacherClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  );
}
