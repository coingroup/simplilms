"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
} from "@simplilms/ui";

interface AttendancePageClientProps {
  classes: { id: string; name: string }[];
  selectedClassId: string;
  selectedDate: string;
}

export function AttendancePageClient({
  classes,
  selectedClassId,
  selectedDate,
}: AttendancePageClientProps) {
  const router = useRouter();

  const handleClassChange = (classId: string) => {
    const params = new URLSearchParams();
    params.set("classId", classId);
    params.set("date", selectedDate);
    router.push(`/teacher/attendance?${params.toString()}`);
  };

  const handleDateChange = (date: string) => {
    if (!selectedClassId) return;
    const params = new URLSearchParams();
    params.set("classId", selectedClassId);
    params.set("date", date);
    router.push(`/teacher/attendance?${params.toString()}`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label>Class</Label>
            <Select value={selectedClassId} onValueChange={handleClassChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class..." />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48 space-y-2">
            <Label>Session Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
