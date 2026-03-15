"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "@simplilms/ui";
import { toast } from "sonner";
import { markBulkAttendance } from "../../actions/attendance";
import type { ClassStudentRow, AttendanceRow } from "../../lib/queries";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

interface AttendanceFormProps {
  classId: string;
  className: string;
  students: ClassStudentRow[];
  existingAttendance: AttendanceRow[];
  sessionDate: string;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: "present", label: "Present", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "late", label: "Late", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "absent", label: "Absent", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "excused", label: "Excused", color: "bg-blue-100 text-blue-700 border-blue-200" },
];

export function AttendanceForm({
  classId,
  className,
  students,
  existingAttendance,
  sessionDate,
}: AttendanceFormProps) {
  // Build initial status map from existing attendance
  const initialStatuses: Record<string, AttendanceStatus> = {};
  existingAttendance.forEach((a) => {
    initialStatuses[a.student_id] = a.status as AttendanceStatus;
  });

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(initialStatuses);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newStatuses: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      newStatuses[s.student_id] = status;
    });
    setStatuses(newStatuses);
  };

  const handleSave = () => {
    startTransition(async () => {
      const records = students
        .filter((s) => statuses[s.student_id])
        .map((s) => ({
          studentId: s.student_id,
          status: statuses[s.student_id],
        }));

      if (records.length === 0) {
        toast.error("No attendance records to save. Please mark at least one student.");
        return;
      }

      const result = await markBulkAttendance({
        classId,
        sessionDate,
        records,
      });

      if (result.success) {
        toast.success(`Attendance saved for ${result.updatedCount} students.`);
      } else {
        toast.error(result.error || "Failed to save attendance");
      }
    });
  };

  const markedCount = Object.keys(statuses).length;
  const totalStudents = students.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{className}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Session: {new Date(sessionDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {markedCount}/{totalStudents} marked
            </span>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || markedCount === 0}
            >
              {isPending ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick actions */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Mark all:</span>
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant="outline"
              size="sm"
              onClick={() => handleMarkAll(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No students enrolled in this class.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Current</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const firstName = student.first_name || "Unknown";
                  const lastInitial = student.last_name
                    ? `${student.last_name.charAt(0)}.`
                    : "";
                  const currentStatus = statuses[student.student_id];

                  return (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-medium">
                        {firstName} {lastInitial}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={currentStatus || ""}
                          onValueChange={(value) =>
                            handleStatusChange(student.student_id, value as AttendanceStatus)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        {currentStatus ? (
                          <Badge
                            variant="outline"
                            className={
                              STATUS_OPTIONS.find((o) => o.value === currentStatus)?.color || ""
                            }
                          >
                            {STATUS_OPTIONS.find((o) => o.value === currentStatus)?.label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
