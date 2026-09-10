"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea, Card } from "@simplilms/ui";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface ClassFormProps {
  initialData?: {
    name: string;
    description: string;
    instructorId: string;
    schedule: { days: string[]; startTime: string; endTime: string; timezone: string };
    maxStudents: number | null;
    priceCents: number | null;
    commissionRate: number;
    zoomMeetingId: string | null;
    zoomJoinUrl: string | null;
    zoomStartUrl: string | null;
  };
  instructors: { id: string; name: string }[];
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string; id?: string }>;
  submitLabel: string;
  redirectTo?: string;
}

export function ClassForm({
  initialData,
  instructors,
  onSubmit,
  submitLabel,
  redirectTo,
}: ClassFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [instructorId, setInstructorId] = useState(initialData?.instructorId || "");
  const [selectedDays, setSelectedDays] = useState<string[]>(initialData?.schedule?.days || []);
  const [startTime, setStartTime] = useState(initialData?.schedule?.startTime || "09:00");
  const [endTime, setEndTime] = useState(initialData?.schedule?.endTime || "10:00");
  const [timezone, setTimezone] = useState(initialData?.schedule?.timezone || "America/New_York");
  const [maxStudents, setMaxStudents] = useState(initialData?.maxStudents?.toString() || "");
  const [priceCents, setPriceCents] = useState(
    initialData?.priceCents ? (initialData.priceCents / 100).toString() : ""
  );
  const [commissionRate, setCommissionRate] = useState(
    ((initialData?.commissionRate ?? 0.5) * 100).toString()
  );
  const [zoomMeetingId, setZoomMeetingId] = useState(initialData?.zoomMeetingId || "");
  const [zoomJoinUrl, setZoomJoinUrl] = useState(initialData?.zoomJoinUrl || "");
  const [zoomStartUrl, setZoomStartUrl] = useState(initialData?.zoomStartUrl || "");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = () => {
    setError("");
    startTransition(async () => {
      const result = await onSubmit({
        name,
        description,
        instructorId,
        schedule: { days: selectedDays, startTime, endTime, timezone },
        maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
        priceCents: priceCents ? Math.round(parseFloat(priceCents) * 100) : undefined,
        commissionRate: parseFloat(commissionRate) / 100,
        zoomMeetingId: zoomMeetingId || undefined,
        zoomJoinUrl: zoomJoinUrl || undefined,
        zoomStartUrl: zoomStartUrl || undefined,
      });
      if (result.success) {
        router.push(redirectTo || "/admin/classes");
      } else {
        setError(result.error || "Something went wrong");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Basic Info */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Basic Information</h2>
        <div className="space-y-2">
          <Label htmlFor="name">Class Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Real Estate Licensing - Cohort 3" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Brief class description..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instructor">Instructor *</Label>
          <select
            id="instructor"
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select instructor...</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Schedule */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Schedule</h2>
        <div className="space-y-2">
          <Label>Days of Week *</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  selectedDays.includes(day)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-input hover:bg-muted"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Pricing */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Pricing & Capacity</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" step="0.01" value={priceCents} onChange={(e) => setPriceCents(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission">Commission (%)</Label>
            <Input id="commission" type="number" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} placeholder="50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxStudents">Max Students</Label>
            <Input id="maxStudents" type="number" value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} placeholder="No limit" />
          </div>
        </div>
      </Card>

      {/* Zoom */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Zoom Integration</h2>
        <p className="text-xs text-muted-foreground">
          Paste your Zoom meeting details to enable one-click join for students and instructors.
        </p>
        <div className="space-y-2">
          <Label htmlFor="zoomMeetingId">Zoom Meeting ID</Label>
          <Input id="zoomMeetingId" value={zoomMeetingId} onChange={(e) => setZoomMeetingId(e.target.value)} placeholder="123 456 7890" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zoomJoinUrl">Student Join URL</Label>
          <Input id="zoomJoinUrl" value={zoomJoinUrl} onChange={(e) => setZoomJoinUrl(e.target.value)} placeholder="https://zoom.us/j/..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zoomStartUrl">Instructor Start URL</Label>
          <Input id="zoomStartUrl" value={zoomStartUrl} onChange={(e) => setZoomStartUrl(e.target.value)} placeholder="https://zoom.us/s/..." />
        </div>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={isPending || !name.trim() || !instructorId}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
