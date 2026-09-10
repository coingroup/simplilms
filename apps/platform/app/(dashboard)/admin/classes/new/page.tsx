import { requireRole } from "@simplilms/auth/server";
import { createClass } from "@simplilms/core/actions/classes";
import { ClassForm } from "@simplilms/core/components/classes/class-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@simplilms/auth/server";

export const metadata = { title: "Create Class — Admin" };

export default async function NewClassPage() {
  await requireRole(["super_admin"]);

  // Fetch instructors for the dropdown
  const supabase = await createServerClient();
  const { data: instructors } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name")
    .in("role", ["teacher_paid", "teacher_unpaid"])
    .order("first_name");

  const instructorList = (instructors || []).map((i: any) => ({
    id: i.id,
    name: `${i.first_name || ""} ${i.last_name || ""}`.trim() || "Unnamed",
  }));

  const boundCreateClass = async (data: any) => {
    "use server";
    return createClass(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/classes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Link>
        <h1 className="text-2xl font-bold">Create New Class</h1>
      </div>

      <ClassForm
        instructors={instructorList}
        onSubmit={boundCreateClass}
        submitLabel="Create Class"
      />
    </div>
  );
}
