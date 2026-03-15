import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplilms/ui";
import { formatDateTime } from "../../lib/formatting";
import type { ClassStudentRow } from "../../lib/queries";

interface ClassRosterTableProps {
  students: ClassStudentRow[];
}

/**
 * Table of students enrolled in a class.
 * Per CLAUDE.md spec: shows first name + last initial only.
 */
export function ClassRosterTable({ students }: ClassRosterTableProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">No students enrolled yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Enrolled Since</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const firstName = student.first_name || "Unknown";
            const lastInitial = student.last_name
              ? `${student.last_name.charAt(0)}.`
              : "";
            return (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  {firstName} {lastInitial}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(student.enrolled_at)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
