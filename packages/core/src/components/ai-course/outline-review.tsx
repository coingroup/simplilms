"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Label,
  Textarea,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@simplilms/ui";
import {
  Loader2,
  Sparkles,
  Check,
  RotateCcw,
  Clock,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import type { GeneratedOutline } from "../../lib/ai-service";
import {
  createCourseFromOutline,
  generateCourseFromInterview,
  type AiCourseInterviewRow,
} from "../../actions/ai-course";
import { OutlineModuleCard } from "./outline-module-card";

interface OutlineReviewProps {
  interview: AiCourseInterviewRow;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 border-green-200",
  intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  advanced: "bg-red-100 text-red-800 border-red-200",
};

export function OutlineReview({ interview }: OutlineReviewProps) {
  const router = useRouter();
  const outline = interview.generated_outline;

  const [editedTitle, setEditedTitle] = useState(outline?.title || "");
  const [editedDescription, setEditedDescription] = useState(
    outline?.description || ""
  );
  const [isCreating, startCreating] = useTransition();
  const [isRegenerating, startRegenerating] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!outline) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No generated outline found. Please go back and generate a course
            first.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalLessons = outline.modules.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0
  );

  const totalQuizQuestions = outline.modules.reduce(
    (sum, mod) =>
      sum +
      mod.lessons.reduce(
        (lSum, lesson) => lSum + (lesson.quiz_questions?.length || 0),
        0
      ),
    0
  );

  function handleCreate() {
    setError(null);

    const editedOutline: GeneratedOutline = {
      ...outline!,
      title: editedTitle || outline!.title,
      description: editedDescription || outline!.description,
    };

    startCreating(async () => {
      const result = await createCourseFromOutline(
        interview.id,
        editedOutline
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.courseId) {
        router.push(`/admin/courses/${result.courseId}`);
      }
    });
  }

  function handleRegenerate() {
    setError(null);

    startRegenerating(async () => {
      const result = await generateCourseFromInterview(interview.id);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  const difficultyClass =
    DIFFICULTY_COLORS[outline.difficulty] ||
    "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              AI-Generated Course Outline
            </span>
          </div>
          <div className="space-y-4">
            {/* Editable Title */}
            <div className="space-y-1.5">
              <Label htmlFor="courseTitle" className="text-xs">
                Course Title
              </Label>
              <Input
                id="courseTitle"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-lg font-semibold"
                disabled={isCreating || isRegenerating}
              />
            </div>

            {/* Editable Description */}
            <div className="space-y-1.5">
              <Label htmlFor="courseDescription" className="text-xs">
                Description
              </Label>
              <Textarea
                id="courseDescription"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={3}
                disabled={isCreating || isRegenerating}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={difficultyClass} variant="outline">
              {outline.difficulty}
            </Badge>
            {outline.estimated_hours > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {outline.estimated_hours} hours
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {outline.modules.length} modules, {totalLessons} lessons
            </div>
            {totalQuizQuestions > 0 && (
              <div className="text-sm text-muted-foreground">
                {totalQuizQuestions} quiz questions
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      {outline.learning_objectives &&
        outline.learning_objectives.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {outline.learning_objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

      {/* Modules */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Course Modules
        </h3>
        {outline.modules.map((module, index) => (
          <OutlineModuleCard
            key={index}
            module={module}
            moduleIndex={index}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <Separator />
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={handleRegenerate}
          disabled={isCreating || isRegenerating}
        >
          {isRegenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4 mr-2" />
              Regenerate
            </>
          )}
        </Button>
        <Button
          onClick={handleCreate}
          disabled={isCreating || isRegenerating}
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Course...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Create Course
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
