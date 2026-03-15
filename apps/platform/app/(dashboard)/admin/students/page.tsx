import { requireRole } from "@simplilms/auth/server";
import { Badge } from "@simplilms/ui";
import { UserCheck } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@simplilms/auth/server";

export const metadata = {
  title: "Students -- Admin",
};

export default async function AdminStudentsPage() {
  await requireRole(["super_admin"]);

  const supabase = await createServerClient();
  const { data: students, error } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, email, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  const studentList = (students || []) as Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    created_at: string;
  }>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-sm text-gray-500 mt-1">
          {studentList.length} student{studentList.length !== 1 ? "s" : ""}{" "}
          enrolled
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {studentList.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No students found.</p>
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
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentList.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {s.first_name || ""} {s.last_name || ""}
                      {!s.first_name && !s.last_name && (
                        <span className="text-gray-400">Unnamed</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {s.email || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(s.created_at).toLocaleDateString("en-US", {
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
