"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Button, Card, CardContent, Badge } from "@simplilms/ui";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  PlayCircle,
  FileText,
  Video,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";
import {
  startLesson,
  completeLesson,
} from "@simplilms/core/actions/progress";
import type { LessonProgressRow } from "@simplilms/core/actions/progress";
import type {
  CourseRow,
  ModuleRow,
  LessonRow,
} from "@simplilms/core/actions/courses";

interface ModuleWithLessons extends ModuleRow {
  lessons: LessonRow[];
}

interface CoursePlayerClientProps {
  course: CourseRow;
  modules: ModuleWithLessons[];
  progress: LessonProgressRow[];
  courseId: string;
}

function getLessonIcon(contentType: string) {
  switch (contentType) {
    case "video":
      return Video;
    case "document":
      return Download;
    case "embed":
      return ExternalLink;
    case "quiz":
      return PlayCircle;
    default:
      return FileText;
  }
}

export function CoursePlayerClient({
  course,
  modules,
  progress,
  courseId,
}: CoursePlayerClientProps) {
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(
      progress
        .filter((p) => p.status === "completed")
        .map((p) => p.lesson_id)
    )
  );
  const [startedLessons, setStartedLessons] = useState<Set<string>>(
    new Set(
      progress
        .filter((p) => p.status === "in_progress" || p.status === "completed")
        .map((p) => p.lesson_id)
    )
  );

  // Find the first incomplete lesson as default
  useEffect(() => {
    if (currentLessonId) return;

    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        if (!lesson.is_published) continue;
        if (!completedLessons.has(lesson.id)) {
          setCurrentLessonId(lesson.id);
          return;
        }
      }
    }

    // All completed or no lessons, select the first one
    const firstLesson = modules[0]?.lessons?.[0];
    if (firstLesson) {
      setCurrentLessonId(firstLesson.id);
    }
  }, [modules, completedLessons, currentLessonId]);

  // Find the current lesson object
  const currentLesson = modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === currentLessonId);

  // Auto-start lesson when selecting it
  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      setCurrentLessonId(lessonId);

      if (!startedLessons.has(lessonId)) {
        startTransition(async () => {
          const result = await startLesson(lessonId, courseId);
          if (result.success) {
            setStartedLessons((prev) => new Set([...prev, lessonId]));
          }
        });
      }
    },
    [courseId, startedLessons]
  );

  // Trigger start for the initially selected lesson
  useEffect(() => {
    if (currentLessonId && !startedLessons.has(currentLessonId)) {
      startTransition(async () => {
        const result = await startLesson(currentLessonId, courseId);
        if (result.success) {
          setStartedLessons((prev) => new Set([...prev, currentLessonId]));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonId]);

  const handleCompleteLesson = () => {
    if (!currentLessonId) return;

    startTransition(async () => {
      const result = await completeLesson(currentLessonId, courseId);
      if (result.success) {
        setCompletedLessons((prev) => new Set([...prev, currentLessonId]));
      }
    });
  };

  const allLessons = modules.flatMap((m) => m.lessons.filter((l) => l.is_published));
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);

  const handleNextLesson = () => {
    if (currentIndex < allLessons.length - 1) {
      handleSelectLesson(allLessons[currentIndex + 1].id);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Sidebar - Module/Lesson Navigation */}
      <div className="order-2 lg:order-1">
        <Card>
          <CardContent className="p-0">
            <div className="p-3 border-b">
              <h3 className="text-sm font-semibold">Course Content</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedLessons.size} / {allLessons.length} lessons completed
              </p>
            </div>
            <nav className="divide-y">
              {modules.map((mod) => {
                const publishedLessons = mod.lessons.filter(
                  (l) => l.is_published
                );
                if (publishedLessons.length === 0) return null;

                const moduleCompleted = publishedLessons.every((l) =>
                  completedLessons.has(l.id)
                );

                return (
                  <div key={mod.id}>
                    <div className="px-3 py-2 bg-gray-50">
                      <div className="flex items-center gap-2">
                        {moduleCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-gray-700 truncate">
                          {mod.title}
                        </span>
                      </div>
                    </div>
                    <ul>
                      {publishedLessons.map((lesson) => {
                        const isCompleted = completedLessons.has(lesson.id);
                        const isCurrent = lesson.id === currentLessonId;
                        const LessonIcon = getLessonIcon(lesson.content_type);

                        return (
                          <li key={lesson.id}>
                            <button
                              onClick={() => handleSelectLesson(lesson.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors ${
                                isCurrent
                                  ? "bg-primary/5 border-l-2 border-primary"
                                  : ""
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                              ) : (
                                <LessonIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              )}
                              <span
                                className={`truncate ${
                                  isCurrent
                                    ? "font-medium text-primary"
                                    : isCompleted
                                      ? "text-gray-500"
                                      : "text-gray-700"
                                }`}
                              >
                                {lesson.title}
                              </span>
                              {lesson.duration_minutes && (
                                <span className="text-[10px] text-gray-400 shrink-0 ml-auto">
                                  {lesson.duration_minutes}m
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="order-1 lg:order-2">
        {currentLesson ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    {currentLesson.title}
                  </h2>
                  {currentLesson.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentLesson.description}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0 capitalize">
                  {currentLesson.content_type}
                </Badge>
              </div>

              {/* Lesson Content */}
              <div className="mb-6">
                <LessonContent lesson={currentLesson} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                {completedLessons.has(currentLesson.id) ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Button
                    onClick={handleCompleteLesson}
                    disabled={isPending}
                    size="sm"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    )}
                    Mark as Complete
                  </Button>
                )}

                {currentIndex < allLessons.length - 1 && (
                  <Button
                    onClick={handleNextLesson}
                    variant="outline"
                    size="sm"
                  >
                    Next Lesson
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                No lessons available in this course yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function LessonContent({ lesson }: { lesson: LessonRow }) {
  const content = lesson.content as Record<string, unknown>;

  switch (lesson.content_type) {
    case "text":
      return content.body ? (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content.body as string }}
        />
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No content available for this lesson.
        </p>
      );

    case "video":
      return content.url ? (
        <div className="space-y-3">
          {(content.url as string).includes("youtube.com") ||
          (content.url as string).includes("youtu.be") ||
          (content.url as string).includes("vimeo.com") ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={content.url as string}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson.title}
              />
            </div>
          ) : (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <video
                src={content.url as string}
                controls
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No video available for this lesson.
        </p>
      );

    case "document":
      return content.url ? (
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
          <Download className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {(content.filename as string) || "Document"}
            </p>
            <p className="text-xs text-muted-foreground">
              Click to download the document
            </p>
          </div>
          <a
            href={content.url as string}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </Button>
          </a>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No document available for this lesson.
        </p>
      );

    case "embed":
      return content.url ? (
        <div className="aspect-video rounded-lg overflow-hidden border">
          <iframe
            src={content.url as string}
            className="w-full h-full"
            title={lesson.title}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No embed available for this lesson.
        </p>
      );

    default:
      return (
        <p className="text-sm text-muted-foreground italic">
          Unsupported content type: {lesson.content_type}
        </p>
      );
  }
}
