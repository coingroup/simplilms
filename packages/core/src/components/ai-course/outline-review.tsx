"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
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
  Plus,
  Trash2,
  Pencil,
  X,
  AlertCircle,
} from "lucide-react";
import type { GeneratedOutline, GeneratedModule } from "../../lib/ai-service";
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

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function OutlineReview({ interview }: OutlineReviewProps) {
  const router = useRouter();
  const originalOutline = interview.generated_outline;

  // Full editable outline state
  const [editedOutline, setEditedOutline] = useState<GeneratedOutline | null>(
    originalOutline ? { ...originalOutline, modules: originalOutline.modules.map(m => ({ ...m, lessons: m.lessons.map(l => ({ ...l })) })) } : null
  );
  const [isCreating, startCreating] = useTransition();
  const [isRegenerating, startRegenerating] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Learning objective editing state
  const [editingObjectiveIndex, setEditingObjectiveIndex] = useState<number | null>(null);
  const [editingObjectiveValue, setEditingObjectiveValue] = useState("");

  // Track whether changes have been made
  const hasChanges = useMemo(() => {
    if (!originalOutline || !editedOutline) return false;
    return !deepEqual(originalOutline, editedOutline);
  }, [originalOutline, editedOutline]);

  // ---- Outline field updaters ----

  const updateTitle = useCallback((title: string) => {
    setEditedOutline(prev => prev ? { ...prev, title } : prev);
  }, []);

  const updateDescription = useCallback((description: string) => {
    setEditedOutline(prev => prev ? { ...prev, description } : prev);
  }, []);

  // ---- Learning objective handlers ----

  const startEditingObjective = useCallback((index: number, value: string) => {
    setEditingObjectiveIndex(index);
    setEditingObjectiveValue(value);
  }, []);

  const saveObjective = useCallback(() => {
    if (editingObjectiveIndex === null) return;
    setEditedOutline(prev => {
      if (!prev) return prev;
      const objectives = [...prev.learning_objectives];
      objectives[editingObjectiveIndex] = editingObjectiveValue.trim();
      return { ...prev, learning_objectives: objectives };
    });
    setEditingObjectiveIndex(null);
    setEditingObjectiveValue("");
  }, [editingObjectiveIndex, editingObjectiveValue]);

  const cancelEditingObjective = useCallback(() => {
    setEditingObjectiveIndex(null);
    setEditingObjectiveValue("");
  }, []);

  const addObjective = useCallback(() => {
    setEditedOutline(prev => {
      if (!prev) return prev;
      const objectives = [...prev.learning_objectives, "New learning objective"];
      return { ...prev, learning_objectives: objectives };
    });
    // Start editing the newly added objective
    setEditedOutline(prev => {
      if (!prev) return prev;
      const newIndex = prev.learning_objectives.length - 1;
      setEditingObjectiveIndex(newIndex);
      setEditingObjectiveValue(prev.learning_objectives[newIndex] || "New learning objective");
      return prev;
    });
  }, []);

  const removeObjective = useCallback((index: number) => {
    setEditedOutline(prev => {
      if (!prev) return prev;
      const objectives = prev.learning_objectives.filter((_, i) => i !== index);
      return { ...prev, learning_objectives: objectives };
    });
    if (editingObjectiveIndex === index) {
      cancelEditingObjective();
    }
  }, [editingObjectiveIndex, cancelEditingObjective]);

  // ---- Module handlers ----

  const updateModule = useCallback((moduleIndex: number, updatedModule: GeneratedModule) => {
    setEditedOutline(prev => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      modules[moduleIndex] = updatedModule;
      return { ...prev, modules };
    });
  }, []);

  const deleteModule = useCallback((moduleIndex: number) => {
    setEditedOutline(prev => {
      if (!prev) return prev;
      const modules = prev.modules.filter((_, i) => i !== moduleIndex);
      return { ...prev, modules };
    });
  }, []);

  const moveModuleUp = useCallback((moduleIndex: number) => {
    if (moduleIndex === 0) return;
    setEditedOutline(prev => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      [modules[moduleIndex - 1], modules[moduleIndex]] = [modules[moduleIndex], modules[moduleIndex - 1]];
      return { ...prev, modules };
    });
  }, []);

  const moveModuleDown = useCallback((moduleIndex: number) => {
    setEditedOutline(prev => {
      if (!prev) return prev;
      if (moduleIndex >= prev.modules.length - 1) return prev;
      const modules = [...prev.modules];
      [modules[moduleIndex], modules[moduleIndex + 1]] = [modules[moduleIndex + 1], modules[moduleIndex]];
      return { ...prev, modules };
    });
  }, []);

  const addModule = useCallback(() => {
    setEditedOutline(prev => {
      if (!prev) return prev;
      const newModule: GeneratedModule = {
        title: "New Module",
        description: "Module description",
        lessons: [
          {
            title: "New Lesson",
            content_type: "text",
            content: "<p>Lesson content goes here.</p>",
            duration_minutes: 15,
            quiz_questions: [],
          },
        ],
      };
      return { ...prev, modules: [...prev.modules, newModule] };
    });
  }, []);

  // ---- No outline state ----

  if (!editedOutline) {
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

  // ---- Computed stats ----

  const totalLessons = editedOutline.modules.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0
  );

  const totalQuizQuestions = editedOutline.modules.reduce(
    (sum, mod) =>
      sum +
      mod.lessons.reduce(
        (lSum, lesson) => lSum + (lesson.quiz_questions?.length || 0),
        0
      ),
    0
  );

  // ---- Action handlers ----

  function handleCreate() {
    setError(null);

    startCreating(async () => {
      const result = await createCourseFromOutline(
        interview.id,
        editedOutline!
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
    DIFFICULTY_COLORS[editedOutline.difficulty] ||
    "bg-gray-100 text-gray-800 border-gray-200";

  const isDisabled = isCreating || isRegenerating;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Changes indicator */}
      {hasChanges && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>You have unsaved changes to the outline. These will be applied when you create the course.</span>
        </div>
      )}

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
                value={editedOutline.title}
                onChange={(e) => updateTitle(e.target.value)}
                className="text-lg font-semibold"
                disabled={isDisabled}
              />
            </div>

            {/* Editable Description */}
            <div className="space-y-1.5">
              <Label htmlFor="courseDescription" className="text-xs">
                Description
              </Label>
              <Textarea
                id="courseDescription"
                value={editedOutline.description}
                onChange={(e) => updateDescription(e.target.value)}
                rows={3}
                disabled={isDisabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={difficultyClass} variant="outline">
              {editedOutline.difficulty}
            </Badge>
            {editedOutline.estimated_hours > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {editedOutline.estimated_hours} hours
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {editedOutline.modules.length} modules, {totalLessons} lessons
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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Learning Objectives
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={addObjective}
              disabled={isDisabled}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {editedOutline.learning_objectives.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No learning objectives. Click "Add" to create one.
            </p>
          ) : (
            <ul className="space-y-2">
              {editedOutline.learning_objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2 text-sm group">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                  {editingObjectiveIndex === index ? (
                    <div className="flex-1 flex items-center gap-1.5">
                      <Input
                        value={editingObjectiveValue}
                        onChange={(e) => setEditingObjectiveValue(e.target.value)}
                        className="h-7 text-sm flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveObjective();
                          }
                          if (e.key === "Escape") {
                            cancelEditingObjective();
                          }
                        }}
                        disabled={isDisabled}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={saveObjective}
                        disabled={isDisabled}
                      >
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={cancelEditingObjective}
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <span
                        className="cursor-pointer hover:text-foreground/80 flex-1"
                        onClick={() => !isDisabled && startEditingObjective(index, objective)}
                        title="Click to edit"
                      >
                        {objective}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => startEditingObjective(index, objective)}
                          disabled={isDisabled}
                        >
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeObjective(index)}
                          disabled={isDisabled}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Modules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Course Modules
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={addModule}
            disabled={isDisabled}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Module
          </Button>
        </div>
        {editedOutline.modules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No modules. Click "Add Module" to create one.
              </p>
            </CardContent>
          </Card>
        ) : (
          editedOutline.modules.map((module, index) => (
            <OutlineModuleCard
              key={index}
              module={module}
              moduleIndex={index}
              onUpdate={(moduleIndex, updatedModule) =>
                updateModule(moduleIndex, updatedModule)
              }
              onDelete={(moduleIndex) => deleteModule(moduleIndex)}
              onMoveUp={() => moveModuleUp(index)}
              onMoveDown={() => moveModuleDown(index)}
              isFirst={index === 0}
              isLast={index === editedOutline.modules.length - 1}
              disabled={isDisabled}
            />
          ))
        )}
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
          disabled={isDisabled}
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
          disabled={isDisabled}
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
