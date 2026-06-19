"use client";

import { useState } from "react";
import { ExternalLink, Video, AlertCircle } from "lucide-react";
import { Button } from "@simplilms/ui";

interface ZoomEmbedProps {
  joinUrl: string;
  title: string;
  passcode?: string | null;
}

/**
 * Attempts to embed Zoom via iframe. Because Zoom's web client may block
 * embedding in some configurations, we also always show an "Open in Zoom"
 * fallback button.
 */
export function ZoomEmbed({ joinUrl, title, passcode }: ZoomEmbedProps) {
  const [showEmbed, setShowEmbed] = useState(false);

  // Convert a standard Zoom meeting URL to the web-client embed URL
  // e.g. https://zoom.us/j/123456789 → https://zoom.us/wc/join/123456789
  function buildEmbedUrl(url: string): string {
    try {
      const u = new URL(url);
      // Already a web-client URL
      if (u.pathname.startsWith("/wc/")) return url;

      const meetingIdMatch = u.pathname.match(/\/j\/(\d+)/);
      if (!meetingIdMatch) return url;

      const meetingId = meetingIdMatch[1];
      const embedUrl = new URL(`https://zoom.us/wc/join/${meetingId}`);
      if (passcode) embedUrl.searchParams.set("pwd", passcode);
      return embedUrl.toString();
    } catch {
      return url;
    }
  }

  const embedUrl = buildEmbedUrl(joinUrl);

  return (
    <div className="space-y-4">
      {/* Always-visible "Open in Zoom" button */}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Video className="h-4 w-4" />
          Open in Zoom
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEmbed((v) => !v)}
        >
          {showEmbed ? "Hide embed" : "Embed in browser"}
        </Button>
      </div>

      {passcode && (
        <p className="text-sm text-muted-foreground">
          Passcode:{" "}
          <span className="font-mono font-semibold text-foreground">
            {passcode}
          </span>
        </p>
      )}

      {/* Zoom web-client embed */}
      {showEmbed && (
        <div className="space-y-2">
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              The embedded view may ask you to sign in. If it doesn&apos;t load,
              use the <strong>Open in Zoom</strong> button above.
            </span>
          </div>

          <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            <iframe
              src={embedUrl}
              title={title}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full"
              style={{ height: "640px", minHeight: "480px" }}
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      )}
    </div>
  );
}
