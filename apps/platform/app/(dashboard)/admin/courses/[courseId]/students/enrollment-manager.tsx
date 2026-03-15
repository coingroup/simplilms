"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplilms/ui";
import type { CourseEnrollmentWithStudent } from "@simplilms/core/actions/progress";
import {
  UserPlus,
  Search,
  Users,
  Award,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
} from "lucide-react";

interface EnrollmentManagerProps {
  enrollments: CourseEnrollmentWithStudent[];
  availableStudents: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  }[];
  enrollAction: (
    studentId: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateStatusAction: (
    enrollmentId: string,
    status: "active" | "dropped" | "expired"
  ) => Promise<{ success: boolean; error?: string }>;
  issueCertAction: (
    studentId: string
  ) => Promise<{ success: boolean; error?: string; certificateId?: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  dropped: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-gray-100 text-gray-800 border-gray-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <CheckCircle2 className="h-3.5 w-3.5" />,
  completed: <Award className="h-3.5 w-3.5" />,
  dropped: <XCircle className="h-3.5 w-3.5" />,
  expired: <Clock className="h-3.5 w-3.5" />,
};

export function EnrollmentManagerClient({
  enrollments: initialEnrollments,
  availableStudents,
  enrollAction,
  updateStatusAction,
  issueCertAction,
}: EnrollmentManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [enrollSearch, setEnrollSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((e) => {
    const matchesStatus =
      statusFilter === "all" || e.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      e.student?.first_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      e.student?.last_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      e.student?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter available students for enrollment dialog
  const filteredAvailable = availableStudents.filter((s) => {
    if (!enrollSearch) return true;
    const q = enrollSearch.toLowerCase();
    return (
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  // Stats
  const activeCount = enrollments.filter((e) => e.status === "active").length;
  const completedCount = enrollments.filter(
    (e) => e.status === "completed"
  ).length;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + e.progress_pct, 0) /
            enrollments.length
        )
      : 0;

  function handleEnrollStudent(studentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await enrollAction(studentId);
      if (result.error) {
        setError(result.error);
      } else {
        setShowEnrollDialog(false);
        setEnrollSearch("");
        router.refresh();
      }
    });
  }

  function handleUpdateStatus(
    enrollmentId: string,
    status: "active" | "dropped" | "expired"
  ) {
    setError(null);
    startTransition(async () => {
      const result = await updateStatusAction(enrollmentId, status);
      if (result.error) {
        setError(result.error);
      } else {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === enrollmentId ? { ...e, status } : e))
        );
      }
    });
  }

  function handleIssueCert(studentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await issueCertAction(studentId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{enrollments.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{avgProgress}%</p>
                <p className="text-xs text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters + Enroll Button */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowEnrollDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Enroll Student
        </Button>
      </div>

      {/* Enrollment Table */}
      <Card>
        <CardContent className="p-0">
          {filteredEnrollments.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {enrollments.length === 0
                  ? "No students enrolled yet. Click 'Enroll Student' to get started."
                  : "No enrollments match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">
                      Student
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">
                      Progress
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700">
                      Enrolled
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {enrollment.student?.first_name || ""}{" "}
                            {enrollment.student?.last_name || ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            {enrollment.student?.email || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`${
                            STATUS_COLORS[enrollment.status] || ""
                          } inline-flex items-center gap-1`}
                          variant="outline"
                        >
                          {STATUS_ICONS[enrollment.status]}
                          {enrollment.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${enrollment.progress_pct}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {enrollment.progress_pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          {enrollment.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                handleUpdateStatus(enrollment.id, "dropped")
                              }
                              disabled={isPending}
                            >
                              Drop
                            </Button>
                          )}
                          {enrollment.status === "dropped" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                handleUpdateStatus(enrollment.id, "active")
                              }
                              disabled={isPending}
                            >
                              Reactivate
                            </Button>
                          )}
                          {enrollment.status === "completed" &&
                            !enrollment.certificate_id && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() =>
                                  handleIssueCert(enrollment.student_id)
                                }
                                disabled={isPending}
                              >
                                <Award className="h-3.5 w-3.5 mr-1" />
                                Issue Certificate
                              </Button>
                            )}
                          {enrollment.certificate_id && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              <Award className="h-3 w-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enroll Student Dialog */}
      {showEnrollDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Enroll Student
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEnrollDialog(false);
                  setEnrollSearch("");
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students by name or email..."
                  value={enrollSearch}
                  onChange={(e) => setEnrollSearch(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredAvailable.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  {availableStudents.length === 0
                    ? "No students available to enroll."
                    : "No students match your search."}
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredAvailable.slice(0, 50).map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleEnrollStudent(student.id)}
                      disabled={isPending}
                      className="w-full flex items-center justify-between p-3 rounded-md hover:bg-gray-50 text-left transition-colors disabled:opacity-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.first_name || ""}{" "}
                          {student.last_name || ""}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.email || "—"}
                        </p>
                      </div>
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <UserPlus className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
