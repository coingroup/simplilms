"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Textarea,
} from "@simplilms/ui";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Brain,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  GripVertical,
} from "lucide-react";
import type { GeneratedModule, GeneratedLesson } from "../../lib/ai-service";

interface OutlineModuleCardProps {
  module: GeneratedModule;
  moduleIndex: number;
  onUpdate: (moduleIndex: number, updatedModule: GeneratedModule) => void;
  onDelete: (moduleIndex: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
}

export function OutlineModuleCard({
  module,
  moduleIndex,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  disabled = false,
}: OutlineModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Inline editing state for module title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");

  // Inline editing state for module description
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");

  // Inline editing state for lesson titles
  const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState("");

  // Inline editing state for lesson duration
  const [editingDurationIndex, setEditingDurationIndex] = useState<number | null>(null);
  const [editingDuration, setEditingDuration] = useState("");

  // Delete confirmation
  const [confirmDeleteModule, setConfirmDeleteModule] = useState(false);

  // ---- Computed ----

  const totalDuration = module.lessons.reduce(
    (sum, lesson) => sum + (lesson.duration_minutes || 0),
    0
  );

  const totalQuizQuestions = module.lessons.reduce(
    (sum, lesson) => sum + (lesson.quiz_questions?.length || 0),
    0
  );

  // ---- Module title editing ----

  const startEditTitle = useCallback(() => {
    if (disabled) return;
    setEditingTitle(module.title);
    setIsEditingTitle(true);
  }, [module.title, disabled]);

  const saveTitle = useCallback(() => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      onUpdate(moduleIndex, { ...module, title: trimmed });
    }
    setIsEditingTitle(false);
  }, [editingTitle, module, moduleIndex, onUpdate]);

  const cancelEditTitle = useCallback(() => {
    setIsEditingTitle(false);
  }, []);

  // ---- Module description editing ----

  const startEditDescription = useCallback(() => {
    if (disabled) return;
    setEditingDescription(module.description || "");
    setIsEditingDescription(true);
  }, [module.description, disabled]);

  const saveDescription = useCallback(() => {
    onUpdate(moduleIndex, { ...module, description: editingDescription.trim() });
    setIsEditingDescription(false);
  }, [editingDescription, module, moduleIndex, onUpdate]);

  const cancelEditDescription = useCallback(() => {
    setIsEditingDescription(false);
  }, []);

  // ---- Lesson title editing ----

  const startEditLessonTitle = useCallback((lessonIndex: number, title: string) => {
    if (disabled) return;
    setEditingLessonIndex(lessonIndex);
    setEditingLessonTitle(title);
  }, [disabled]);

  const saveLessonTitle = useCallback(() => {
    if (editingLessonIndex === null) return;
    const trimmed = editingLessonTitle.trim();
    if (trimmed) {
      const lessons = [...module.lessons];
      lessons[editingLessonIndex] = { ...lessons[editingLessonIndex], title: trimmed };
      onUpdate(moduleIndex, { ...module, lessons });
    }
    setEditingLessonIndex(null);
    setEditingLessonTitle("");
  }, [editingLessonIndex, editingLessonTitle, module, moduleIndex, onUpdate]);

  const cancelEditLessonTitle = useCallback(() => {
    setEditingLessonIndex(null);
    setEditingLessonTitle("");
  }, []);

  // ---- Lesson duration editing ----

  const startEditDuration = useCallback((lessonIndex: number, duration: number) => {
    if (disabled) return;
    setEditingDurationIndex(lessonIndex);
    setEditingDuration(String(duration));
  }, [disabled]);

  const saveDuration = useCallback(() => {
    if (editingDurationIndex === null) return;
    const parsed = parseInt(editingDuration, 10);
    const value = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    const lessons = [...module.lessons];
    lessons[editingDurationIndex] = { ...lessons[editingDurationIndex], duration_minutes: value };
    onUpdate(moduleIndex, { ...module, lessons });
    setEditingDurationIndex(null);
    setEditingDuration("");
  }, [editingDurationIndex, editingDuration, module, moduleIndex, onUpdate]);

  const cancelEditDuration = useCallback(() => {
    setEditingDurationIndex(null);
    setEditingDuration("");
  }, []);

  // ---- Lesson reorder ----

  const moveLessonUp = useCallback((lessonIndex: number) => {
    if (lessonIndex === 0) return;
    const lessons = [...module.lessons];
    [lessons[lessonIndex - 1], lessons[lessonIndex]] = [lessons[lessonIndex], lessons[lessonIndex - 1]];
    onUpdate(moduleIndex, { ...module, lessons });
  }, [module, moduleIndex, onUpdate]);

  const moveLessonDown = useCallback((lessonIndex: number) => {
    if (lessonIndex >= module.lessons.length - 1) return;
    const lessons = [...module.lessons];
    [lessons[lessonIndex], lessons[lessonIndex + 1]] = [lessons[lessonIndex + 1], lessons[lessonIndex]];
    onUpdate(moduleIndex, { ...module, lessons });
  }, [module, moduleIndex, onUpdate]);

  // ---- Lesson add / delete ----

  const addLesson = useCallback(() => {
    const newLesson: GeneratedLesson = {
      title: "New Lesson",
      content_type: "text",
      content: "<p>Lesson content goes here.</p>",
      duration_minutes: 15,
      quiz_questions: [],
    };
    onUpdate(moduleIndex, { ...module, lessons: [...module.lessons, newLesson] });
  }, [module, moduleIndex, onUpdate]);

  const deleteLesson = useCallback((lessonIndex: number) => {
    const lessons = module.lessons.filter((_, i) => i !== lessonIndex);
    onUpdate(moduleIndex, { ...module, lessons });
  }, [module, moduleIndex, onUpdate]);

  // ---- Module delete with confirmation ----

  const handleDeleteModule = useCallback(() => {
    if (confirmDeleteModule) {
      onDelete(moduleIndex);
      setConfirmDeleteModule(false);
    } else {
      setConfirmDeleteModule(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setConfirmDeleteModule(false), 3000);
    }
  }, [confirmDeleteModule, moduleIndex, onDelete]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left: expand toggle + title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              className="shrink-0 p-0.5 rounded hover:bg-muted/80 transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {isEditingTitle ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="h-7 text-sm font-semibold flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveTitle();
                    }
                    if (e.key === "Escape") cancelEditTitle();
                  }}
                  disabled={disabled}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={saveTitle}
                  disabled={disabled}
                >
                  <Check className="h-3.5 w-3.5 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={cancelEditTitle}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <CardTitle
                className="text-sm font-semibold truncate cursor-pointer hover:text-foreground/80"
                onClick={startEditTitle}
                title="Click to edit title"
              >
                Module {moduleIndex + 1}: {module.title}
              </CardTitle>
            )}
          </div>

          {/* Right: stats + actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="secondary" className="text-xs">
              {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
            </Badge>
            {totalDuration > 0 && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {totalDuration} min
              </Badge>
            )}

            {/* Module reorder buttons */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              disabled={isFirst || disabled}
              title="Move module up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              disabled={isLast || disabled}
              title="Move module down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>

            {/* Module delete button */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 p-0 ${confirmDeleteModule ? "px-2 text-red-600 bg-red-50 hover:bg-red-100" : "w-7"}`}
              onClick={(e) => { e.stopPropagation(); handleDeleteModule(); }}
              disabled={disabled}
              title={confirmDeleteModule ? "Click again to confirm" : "Delete module"}
            >
              {confirmDeleteModule ? (
                <span className="text-xs font-medium">Confirm?</span>
              ) : (
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              )}
            </Button>
          </div>
        </div>

        {/* Module description */}
        {isEditingDescription ? (
          <div className="ml-6 mt-1.5 flex items-start gap-1.5">
            <Textarea
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              className="text-xs flex-1 min-h-[48px]"
              rows={2}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelEditDescription();
              }}
              disabled={disabled}
            />
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 shrink-0"
                onClick={saveDescription}
                disabled={disabled}
              >
                <Check className="h-3 w-3 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 shrink-0"
                onClick={cancelEditDescription}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ) : (
          module.description && (
            <p
              className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-2 cursor-pointer hover:text-muted-foreground/80"
              onClick={startEditDescription}
              title="Click to edit description"
            >
              {module.description}
            </p>
          )
        )}
        {!module.description && !isEditingDescription && (
          <button
            type="button"
            className="text-xs text-muted-foreground/50 mt-1 ml-6 italic hover:text-muted-foreground"
            onClick={startEditDescription}
            disabled={disabled}
          >
            Add description...
          </button>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-4">
          <div className="ml-6 space-y-1.5">
            {module.lessons.map((lesson, lessonIndex) => (
              <div
                key={lessonIndex}
                className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30 text-sm group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />

                  {editingLessonIndex === lessonIndex ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Input
                        value={editingLessonTitle}
                        onChange={(e) => setEditingLessonTitle(e.target.value)}
                        className="h-7 text-sm flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveLessonTitle();
                          }
                          if (e.key === "Escape") cancelEditLessonTitle();
                        }}
                        disabled={disabled}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0"
                        onClick={saveLessonTitle}
                        disabled={disabled}
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0"
                        onClick={cancelEditLessonTitle}
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <span
                      className="truncate cursor-pointer hover:text-foreground/80 flex-1"
                      onClick={() => startEditLessonTitle(lessonIndex, lesson.title)}
                      title="Click to edit title"
                    >
                      {lessonIndex + 1}. {lesson.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {lesson.content_type}
                  </Badge>

                  {/* Editable duration */}
                  {editingDurationIndex === lessonIndex ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingDuration}
                        onChange={(e) => setEditingDuration(e.target.value)}
                        className="h-6 w-12 text-xs text-center p-0.5"
                        type="number"
                        min={0}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveDuration();
                          }
                          if (e.key === "Escape") cancelEditDuration();
                        }}
                        disabled={disabled}
                      />
                      <span className="text-[10px] text-muted-foreground">m</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={saveDuration}
                        disabled={disabled}
                      >
                        <Check className="h-2.5 w-2.5 text-green-600" />
                      </Button>
                    </div>
                  ) : (
                    lesson.duration_minutes > 0 && (
                      <span
                        className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground/80"
                        onClick={() => startEditDuration(lessonIndex, lesson.duration_minutes)}
                        title="Click to edit duration"
                      >
                        <Clock className="h-3 w-3" />
                        {lesson.duration_minutes}m
                      </span>
                    )
                  )}

                  {lesson.duration_minutes === 0 && editingDurationIndex !== lessonIndex && (
                    <span
                      className="text-[10px] text-muted-foreground/50 cursor-pointer hover:text-muted-foreground italic"
                      onClick={() => startEditDuration(lessonIndex, 0)}
                    >
                      +time
                    </span>
                  )}

                  {lesson.quiz_questions && lesson.quiz_questions.length > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      {lesson.quiz_questions.length} Q
                    </span>
                  )}

                  {/* Lesson reorder buttons - visible on hover */}
                  <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveLessonUp(lessonIndex)}
                      disabled={lessonIndex === 0 || disabled}
                      title="Move lesson up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveLessonDown(lessonIndex)}
                      disabled={lessonIndex === module.lessons.length - 1 || disabled}
                      title="Move lesson down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => deleteLesson(lessonIndex)}
                      disabled={disabled}
                      title="Delete lesson"
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add lesson button */}
            <button
              type="button"
              className="flex items-center gap-1.5 w-full py-2 px-3 rounded-md border border-dashed border-muted-foreground/25 text-xs text-muted-foreground hover:border-muted-foreground/50 hover:text-muted-foreground/80 transition-colors"
              onClick={addLesson}
              disabled={disabled}
            >
              <Plus className="h-3.5 w-3.5" />
              Add lesson
            </button>

            {totalQuizQuestions > 0 && (
              <p className="text-xs text-muted-foreground mt-2 ml-1">
                {totalQuizQuestions} quiz question{totalQuizQuestions !== 1 ? "s" : ""} across
                this module
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
