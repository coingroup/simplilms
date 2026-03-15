import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@simplilms/ui";
import { Users, Video, Calendar } from "lucide-react";
import Link from "next/link";
import type { InstructorClassRow } from "../../lib/queries";

interface TeacherClassCardProps {
  cls: InstructorClassRow;
}

function parseSchedule(schedule: Record<string, unknown> | null): string {
  if (!schedule) return "Schedule not set";
  try {
    const days = schedule.days as string[] | undefined;
    const startTime = schedule.startTime as string | undefined;
    const endTime = schedule.endTime as string | undefined;
    const timezone = schedule.timezone as string | undefined;

    if (!days || days.length === 0) return "Schedule not set";

    const dayStr = days.join(", ");
    const timeStr =
      startTime && endTime ? `${startTime} - ${endTime}` : "Time TBD";
    const tzStr = timezone ? ` (${timezone})` : "";

    return `${dayStr} | ${timeStr}${tzStr}`;
  } catch {
    return "Schedule not set";
  }
}

export function TeacherClassCard({ cls }: TeacherClassCardProps) {
  return (
    <Link href={`/teacher/classes/${cls.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{cls.name}</CardTitle>
            {cls.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {cls.description}
              </p>
            )}
          </div>
          <Badge variant={cls.is_active ? "default" : "secondary"}>
            {cls.is_active ? "Active" : "Inactive"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {cls.enrolled_count} {cls.enrolled_count === 1 ? "student" : "students"} enrolled
              {cls.max_students ? ` / ${cls.max_students} max` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{parseSchedule(cls.schedule)}</span>
          </div>
          {cls.zoom_start_url && (
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Zoom Ready</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
