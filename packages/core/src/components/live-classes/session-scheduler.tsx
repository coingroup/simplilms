"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
} from "@simplilms/ui";
import { Calendar, Clock, Video, Link as LinkIcon } from "lucide-react";
import { createLiveSession, updateLiveSession } from "../../actions/live-classes";
import type { LiveSessionRow, CreateLiveSessionData } from "../../actions/live-classes";

interface SessionSchedulerProps {
  /** If provided, the form pre-fills with existing session data (edit mode). */
  session?: LiveSessionRow;
  /** Default class_id to associate with the session. */
  defaultClassId?: string;
  /** Default course_id to associate with the session. */
  defaultCourseId?: string;
  /** Redirect path after save */
  redirectTo?: string;
}

function toDatetimeLocal(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionScheduler({
  session,
  defaultClassId,
  defaultCourseId,
  redirectTo = "/teacher/live",
}: SessionSchedulerProps) {
  const router = useRouter();
  const isEdit = !!session;

  const [form, setForm] = useState({
    title: session?.title ?? "",
    description: session?.description ?? "",
    scheduled_at: session ? toDatetimeLocal(session.scheduled_at) : "",
    duration_minutes: String(session?.duration_minutes ?? 60),
    zoom_join_url: session?.zoom_join_url ?? "",
    zoom_start_url: session?.zoom_start_url ?? "",
    zoom_passcode: session?.zoom_passcode ?? "",
    max_attendees: session?.max_attendees ? String(session.max_attendees) : "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!form.title.trim()) {
        setError("Title is required.");
        return;
      }
      if (!form.scheduled_at) {
        setError("Scheduled date and time is required.");
        return;
      }

      const scheduledIso = new Date(form.scheduled_at).toISOString();
      const duration = parseInt(form.duration_minutes, 10) || 60;
      const maxAttendees = form.max_attendees
        ? parseInt(form.max_attendees, 10)
        : null;

      if (isEdit && session) {
        const result = await updateLiveSession(session.id, {
          title: form.title.trim(),
          description: form.description.trim() || null,
          scheduled_at: scheduledIso,
          duration_minutes: duration,
          zoom_join_url: form.zoom_join_url.trim() || null,
          zoom_start_url: form.zoom_start_url.trim() || null,
          zoom_passcode: form.zoom_passcode.trim() || null,
          max_attendees: maxAttendees,
        });
        if (!result.success) {
          setError(result.error ?? "Failed to update session.");
          return;
        }
      } else {
        const payload: CreateLiveSessionData = {
          title: form.title.trim(),
          description: form.description.trim() || null,
          scheduled_at: scheduledIso,
          duration_minutes: duration,
          zoom_join_url: form.zoom_join_url.trim() || null,
          zoom_start_url: form.zoom_start_url.trim() || null,
          zoom_passcode: form.zoom_passcode.trim() || null,
          max_attendees: maxAttendees,
          class_id: defaultClassId ?? null,
          course_id: defaultCourseId ?? null,
        };
        const result = await createLiveSession(payload);
        if (!result.success) {
          setError(result.error ?? "Failed to create session.");
          return;
        }
      }

      router.push(redirectTo);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEdit ? "Edit Live Session" : "Schedule Live Session"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Session Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Week 3 — Introduction to Neural Networks"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What will you cover in this session?"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Date + Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="scheduled_at">
                <Calendar className="inline h-3.5 w-3.5 mr-1" />
                Date & Time *
              </Label>
              <Input
                id="scheduled_at"
                name="scheduled_at"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duration_minutes">
                <Clock className="inline h-3.5 w-3.5 mr-1" />
                Duration (minutes)
              </Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min={15}
                max={480}
                value={form.duration_minutes}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Zoom section */}
          <div className="border-t pt-4 space-y-4">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Video className="h-4 w-4" />
              Zoom Details
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="zoom_join_url">
                <LinkIcon className="inline h-3.5 w-3.5 mr-1" />
                Join URL (students)
              </Label>
              <Input
                id="zoom_join_url"
                name="zoom_join_url"
                type="url"
                placeholder="https://zoom.us/j/..."
                value={form.zoom_join_url}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="zoom_start_url">Host Start URL</Label>
              <Input
                id="zoom_start_url"
                name="zoom_start_url"
                type="url"
                placeholder="https://zoom.us/s/..."
                value={form.zoom_start_url}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="zoom_passcode">Passcode</Label>
                <Input
                  id="zoom_passcode"
                  name="zoom_passcode"
                  placeholder="Optional"
                  value={form.zoom_passcode}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max_attendees">Max Attendees</Label>
                <Input
                  id="max_attendees"
                  name="max_attendees"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={form.max_attendees}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving…"
                : isEdit
                ? "Save Changes"
                : "Schedule Session"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
