"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@simplilms/ui";
import { Film } from "lucide-react";
import { addRecording } from "../../actions/live-classes";

interface AddRecordingFormProps {
  sessionId: string;
  currentUrl?: string;
}

export function AddRecordingForm({ sessionId, currentUrl }: AddRecordingFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState(currentUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!url.trim()) {
      setError("Please enter a recording URL.");
      return;
    }
    setSaving(true);
    try {
      const result = await addRecording(sessionId, url.trim());
      if (!result.success) {
        setError(result.error ?? "Failed to save recording.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-lg">
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600">Recording saved successfully.</p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor={`rec-url-${sessionId}`}>
          <Film className="inline h-3.5 w-3.5 mr-1" />
          Recording URL
        </Label>
        <Input
          id={`rec-url-${sessionId}`}
          type="url"
          placeholder="https://zoom.us/rec/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : currentUrl ? "Update Recording" : "Add Recording"}
        </Button>
      </div>
    </form>
  );
}
