import { getUser } from "@simplilms/auth/server";
import { redirect } from "next/navigation";
import { getEnrollments, formatDateTime } from "@simplilms/core";
import { Badge } from "@simplilms/ui";
import { GraduationCap } from "lucide-react";

interface EnrollmentsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  payment_plan_active: "Payment Plan",
  suspended: "Suspended",
  completed: "Completed",
  withdrawn: "Withdrawn",
};

const STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  payment_plan_active: "secondary",
  suspended: "destructive",
  completed: "outline",
  withdrawn: "destructive",
};

const TUITION_METHOD_LABELS: Record<string, string> = {
  full_payment: "Full Payment",
  isa: "ISA",
};

export default async function AdminEnrollmentsPage({
  searchParams,
}: EnrollmentsPageProps) {
  const { user, error } = await getUser();
  if (error || !user || user.role !== "super_admin") {
    redirect("/login");
  }

  const params = await searchParams;
  const status = params.status || undefined;
  const search = params.search || undefined;
  const page = parseInt(params.page || "1", 10);

  const { enrollments, totalCount } = await getEnrollments({
    status,
    search,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} total enrollment{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {["", "active", "payment_plan_active", "suspended", "completed", "withdrawn"].map(
          (s) => {
            const isActive = (status || "") === s;
            return (
              <a
                key={s}
                href={`/admin/enrollments${s ? `?status=${s}` : ""}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {s ? STATUS_LABELS[s] || s : "All"}
              </a>
            );
          }
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No enrollments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Enrollment #
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Tuition Method
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                    Enrolled
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {enrollment.enrollment_number || "\u2014"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          STATUS_COLORS[enrollment.status] || "secondary"
                        }
                      >
                        {STATUS_LABELS[enrollment.status] || enrollment.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {enrollment.tuition_payment_method
                        ? TUITION_METHOD_LABELS[
                            enrollment.tuition_payment_method
                          ] || enrollment.tuition_payment_method
                        : "\u2014"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDateTime(enrollment.enrolled_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 20 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Showing {(page - 1) * 20 + 1}–
            {Math.min(page * 20, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/enrollments?page=${page - 1}${status ? `&status=${status}` : ""}`}
                className="px-3 py-1.5 text-xs font-medium rounded border border-gray-200 hover:bg-gray-50"
              >
                Previous
              </a>
            )}
            {page * 20 < totalCount && (
              <a
                href={`/admin/enrollments?page=${page + 1}${status ? `&status=${status}` : ""}`}
                className="px-3 py-1.5 text-xs font-medium rounded border border-gray-200 hover:bg-gray-50"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
