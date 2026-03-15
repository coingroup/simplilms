import { requireRole } from "@simplilms/auth/server";
import { Badge } from "@simplilms/ui";
import { BookOpen } from "lucide-react";
import { createServerClient } from "@simplilms/auth/server";

export const metadata = {
  title: "Instructors -- Admin",
};

export default async function AdminInstructorsPage() {
  await requireRole(["super_admin"]);

  const supabase = await createServerClient();
  const { data: instructors, error } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, email, role, created_at")
    .in("role", ["teacher_paid", "teacher_unpaid"])
    .order("created_at", { ascending: false });

  const instructorList = (instructors || []) as Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    role: string;
    created_at: string;
  }>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
        <p className="text-sm text-gray-500 mt-1">
          {instructorList.length} instructor
          {instructorList.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {instructorList.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No instructors found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Type
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {instructorList.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {inst.first_name || ""} {inst.last_name || ""}
                      {!inst.first_name && !inst.last_name && (
                        <span className="text-gray-400">Unnamed</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {inst.email || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          inst.role === "teacher_paid"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {inst.role === "teacher_paid" ? "Paid" : "Volunteer"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(inst.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
