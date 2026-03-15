"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Label,
  Textarea,
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
import type { LessonRow } from "@simplilms/core/actions/courses";
import {
  Save,
  Loader2,
  FileText,
  Film,
  File,
  Code,
  HelpCircle,
  Eye,
  ArrowLeft,
  Check,
} from "lucide-react";

const CONTENT_TYPE_OPTIONS = [
  { value: "text", label: "Text / Rich Content", icon: FileText },
  { value: "video", label: "Video", icon: Film },
  { value: "document", label: "Document / Download", icon: File },
  { value: "embed", label: "Embed / iFrame", icon: Code },
  { value: "quiz", label: "Quiz", icon: HelpCircle },
];

interface LessonEditorProps {
  lesson: LessonRow;
  courseId: string;
  updateAction: (
    data: {
      title?: string;
      description?: string;
      content_type?: string;
      content?: Record<string, unknown>;
      duration_minutes?: number | null;
      is_required?: boolean;
    }
  ) => Promise<{ success: boolean; error?: string }>;
}

export function LessonEditorClient({
  lesson,
  courseId,
  updateAction,
}: LessonEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || "");
  const [contentType, setContentType] = useState(lesson.content_type);
  const [durationMinutes, setDurationMinutes] = useState(
    lesson.duration_minutes?.toString() || ""
  );
  const [isRequired, setIsRequired] = useState(lesson.is_required);

  // Content fields (depend on content_type)
  const content = lesson.content as Record<string, unknown>;
  const [textBody, setTextBody] = useState((content.body as string) || "");
  const [videoUrl, setVideoUrl] = useState((content.url as string) || "");
  const [documentUrl, setDocumentUrl] = useState((content.url as string) || "");
  const [documentFilename, setDocumentFilename] = useState(
    (content.filename as string) || ""
  );
  const [embedUrl, setEmbedUrl] = useState((content.url as string) || "");
  const [quizId, setQuizId] = useState((content.quiz_id as string) || "");

  const buildContent = useCallback((): Record<string, unknown> => {
    switch (contentType) {
      case "text":
        return { body: textBody };
      case "video":
        return { url: videoUrl };
      case "document":
        return { url: documentUrl, filename: documentFilename };
      case "embed":
        return { url: embedUrl };
      case "quiz":
        return { quiz_id: quizId };
      default:
        return {};
    }
  }, [
    contentType,
    textBody,
    videoUrl,
    documentUrl,
    documentFilename,
    embedUrl,
    quizId,
  ]);

  function handleSave() {
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateAction({
        title: title.trim(),
        description: description.trim() || undefined,
        content_type: contentType,
        content: buildContent(),
        duration_minutes: durationMinutes
          ? parseInt(durationMinutes, 10)
          : null,
        is_required: isRequired,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back Link + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course Builder
        </button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Lesson Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lesson Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson title"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="e.g., 15"
                min="1"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this lesson..."
              rows={2}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select
                value={contentType}
                onValueChange={(v) => setContentType(v as LessonRow["content_type"])}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  Required for course completion
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lesson Content</CardTitle>
            <Badge variant="secondary" className="capitalize">
              {contentType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {contentType === "text" && (
            <TextContentEditor
              body={textBody}
              onChange={setTextBody}
              disabled={isPending}
            />
          )}
          {contentType === "video" && (
            <VideoContentEditor
              url={videoUrl}
              onChange={setVideoUrl}
              disabled={isPending}
            />
          )}
          {contentType === "document" && (
            <DocumentContentEditor
              url={documentUrl}
              filename={documentFilename}
              onUrlChange={setDocumentUrl}
              onFilenameChange={setDocumentFilename}
              disabled={isPending}
            />
          )}
          {contentType === "embed" && (
            <EmbedContentEditor
              url={embedUrl}
              onChange={setEmbedUrl}
              disabled={isPending}
            />
          )}
          {contentType === "quiz" && (
            <QuizContentEditor
              quizId={quizId}
              onChange={setQuizId}
              disabled={isPending}
            />
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {contentType === "text" && textBody && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-base">Preview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: textBody }}
            />
          </CardContent>
        </Card>
      )}

      {contentType === "video" && videoUrl && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-base">Preview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video preview"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Save */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/courses/${courseId}`)}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ---- Content-type specific editors ----

function TextContentEditor({
  body,
  onChange,
  disabled,
}: {
  body: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Enter HTML content for this lesson. Supports headings, paragraphs,
        lists, bold, italic, links, images, and code blocks.
      </p>
      <Textarea
        value={body}
        onChange={(e) => onChange(e.target.value)}
        placeholder="<h2>Lesson Title</h2>\n<p>Lesson content goes here...</p>"
        rows={20}
        className="font-mono text-sm"
        disabled={disabled}
      />
    </div>
  );
}

function VideoContentEditor({
  url,
  onChange,
  disabled,
}: {
  url: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Paste a YouTube, Vimeo, or direct video URL. For YouTube, use the embed
        URL format (e.g., https://www.youtube.com/embed/VIDEO_ID).
      </p>
      <div className="space-y-2">
        <Label htmlFor="video-url">Video URL</Label>
        <Input
          id="video-url"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function DocumentContentEditor({
  url,
  filename,
  onUrlChange,
  onFilenameChange,
  disabled,
}: {
  url: string;
  filename: string;
  onUrlChange: (v: string) => void;
  onFilenameChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Provide a download URL for the document and an optional display
        filename.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doc-url">Document URL</Label>
          <Input
            id="doc-url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com/document.pdf"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doc-filename">Display Name</Label>
          <Input
            id="doc-filename"
            value={filename}
            onChange={(e) => onFilenameChange(e.target.value)}
            placeholder="Course Handbook.pdf"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

function EmbedContentEditor({
  url,
  onChange,
  disabled,
}: {
  url: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Paste an embed URL for an external resource (e.g., Google Slides,
        Figma, CodePen). The content will be displayed in an iframe.
      </p>
      <div className="space-y-2">
        <Label htmlFor="embed-url">Embed URL</Label>
        <Input
          id="embed-url"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://docs.google.com/presentation/d/.../embed"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function QuizContentEditor({
  quizId,
  onChange,
  disabled,
}: {
  quizId: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Enter the Quiz ID to link to this lesson. Students will take the quiz
        as part of this lesson.
      </p>
      <div className="space-y-2">
        <Label htmlFor="quiz-id">Quiz ID</Label>
        <Input
          id="quiz-id"
          value={quizId}
          onChange={(e) => onChange(e.target.value)}
          placeholder="UUID of the quiz"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
