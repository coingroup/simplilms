"use client";

import { useState, useTransition } from "react";
import { Badge, Button, Card, CardContent } from "@simplilms/ui";
import { ExternalLink, Trash2, Video, Zap } from "lucide-react";

interface ZoomActionsProps {
  classId: string;
  hasZoom: boolean;
  zoomMeetingId: string | null;
  zoomJoinUrl: string | null;
  zoomConfigured: boolean;
  onCreateZoom: () => Promise<{
    success: boolean;
    error?: string;
    meetingId?: string;
    joinUrl?: string;
    startUrl?: string;
  }>;
  onDeleteZoom: () => Promise<{ success: boolean; error?: string }>;
}

export function ZoomActions({
  classId,
  hasZoom,
  zoomMeetingId,
  zoomJoinUrl,
  zoomConfigured,
  onCreateZoom,
  onDeleteZoom,
}: ZoomActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreate = () => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await onCreateZoom();
      if (result.success) {
        setSuccess(`Zoom meeting created (ID: ${result.meetingId})`);
      } else {
        setError(result.error || "Failed to create meeting");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Remove Zoom meeting from this class?")) return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await onDeleteZoom();
      if (result.success) {
        setSuccess("Zoom meeting removed");
      } else {
        setError(result.error || "Failed to remove meeting");
      }
    });
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Zoom Integration</p>
              {hasZoom ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">
                    Meeting ID: {zoomMeetingId}
                  </Badge>
                  {zoomJoinUrl && (
                    <a
                      href={zoomJoinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      Join Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {zoomConfigured
                    ? "No Zoom meeting linked. Create one automatically or paste URLs in class settings."
                    : "Zoom API not configured. Paste meeting URLs manually in class settings."}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasZoom ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            ) : zoomConfigured ? (
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={isPending}
              >
                <Zap className="h-4 w-4 mr-1" />
                {isPending ? "Creating..." : "Create Zoom Meeting"}
              </Button>
            ) : null}
          </div>
        </div>

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        {success && <p className="text-sm text-green-600 mt-2">{success}</p>}
      </CardContent>
    </Card>
  );
}
