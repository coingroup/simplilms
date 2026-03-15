import { requireRole } from "@simplilms/auth/server";
import { Badge } from "@simplilms/ui";
import { Calendar } from "lucide-react";
import { createServerClient } from "@simplilms/auth/server";

export const metadata = {
  title: "Classes -- Admin",
};

export default async function AdminClassesPage() {
  await requireRole(["super_admin"]);

  const supabase = await createServerClient();
  const { data: classes, error } = await (supabase as any)
    .from("classes")
    .select(
      "id, name, description, is_active, max_students, commission_rate, price_cents, created_at, instructor:profiles!classes_instructor_id_fkey(first_name, last_name)"
    )
    .order("created_at", { ascending: false });

  const classList = (classes || []) as Array<{
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    max_students: number | null;
    commission_rate: number;
    price_cents: number | null;
    created_at: string;
    instructor: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  }>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {classList.length} class{classList.length !== 1 ? "es" : ""} managed
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {classList.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No classes found.</p>
            <p className="text-xs text-gray-400 mt-1">
              Classes will appear here once created.
            </p>
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
                    Instructor
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Max Students
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classList.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">
                        {cls.name}
                      </p>
                      {cls.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">
                          {cls.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {cls.instructor
                        ? `${cls.instructor.first_name || ""} ${cls.instructor.last_name || ""}`.trim() ||
                          "Unnamed"
                        : "Unassigned"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={cls.is_active ? "default" : "secondary"}
                      >
                        {cls.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {cls.max_students ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(cls.created_at).toLocaleDateString("en-US", {
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
