"use client";

import { useState, useTransition } from "react";
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
  Badge,
} from "@simplilms/ui";
import type { ModuleRow, LessonRow } from "@simplilms/core/actions/courses";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Film,
  File,
  Code,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type ModuleWithLessons = ModuleRow & { lessons: LessonRow[] };

const CONTENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  text: <FileText className="h-4 w-4" />,
  video: <Film className="h-4 w-4" />,
  document: <File className="h-4 w-4" />,
  embed: <Code className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  video: "Video",
  document: "Document",
  embed: "Embed",
  quiz: "Quiz",
};

const CONTENT_TYPE_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  text: "secondary",
  video: "default",
  document: "outline",
  embed: "secondary",
  quiz: "default",
};

interface CourseBuilderClientProps {
  courseId: string;
  modules: ModuleWithLessons[];
  isPublished: boolean;
  createModuleAction: (data: {
    title: string;
    description?: string;
  }) => Promise<{ success: boolean; error?: string; id?: string }>;
  createLessonAction: (
    moduleId: string,
    data: { title: string; content_type?: string; description?: string }
  ) => Promise<{ success: boolean; error?: string; id?: string }>;
  deleteModuleAction: (
    moduleId: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteLessonAction: (
    lessonId: string
  ) => Promise<{ success: boolean; error?: string }>;
  togglePublishedAction: () => Promise<{
    success: boolean;
    error?: string;
  }>;
}

export function CourseBuilderClient({
  courseId,
  modules: initialModules,
  isPublished: initialIsPublished,
  createModuleAction,
  createLessonAction,
  deleteModuleAction,
  deleteLessonAction,
  togglePublishedAction,
}: CourseBuilderClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modules, setModules] = useState(initialModules);
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(initialModules.map((m) => m.id))
  );

  // Add Module dialog state
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");

  // Add Lesson dialog state
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(
    null
  );
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonContentType, setNewLessonContentType] = useState("text");

  // Delete confirmation state
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "module" | "lesson";
    id: string;
    name: string;
  } | null>(null);

  function toggleModuleExpanded(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  function handleAddModule() {
    if (!newModuleTitle.trim()) return;

    startTransition(async () => {
      const result = await createModuleAction({
        title: newModuleTitle.trim(),
        description: newModuleDescription.trim() || undefined,
      });
      if (result.success && result.id) {
        setModules((prev) => [
          ...prev,
          {
            id: result.id!,
            tenant_id: "",
            course_id: courseId,
            title: newModuleTitle.trim(),
            description: newModuleDescription.trim() || null,
            sort_order: prev.length,
            is_published: false,
            unlock_rule: "immediate" as const,
            unlock_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            lessons: [],
          },
        ]);
        setExpandedModules((prev) => new Set([...prev, result.id!]));
      }
      setShowAddModule(false);
      setNewModuleTitle("");
      setNewModuleDescription("");
      router.refresh();
    });
  }

  function handleAddLesson(moduleId: string) {
    if (!newLessonTitle.trim()) return;

    startTransition(async () => {
      const result = await createLessonAction(moduleId, {
        title: newLessonTitle.trim(),
        content_type: newLessonContentType,
      });
      if (result.success && result.id) {
        setModules((prev) =>
          prev.map((mod) =>
            mod.id === moduleId
              ? {
                  ...mod,
                  lessons: [
                    ...mod.lessons,
                    {
                      id: result.id!,
                      tenant_id: "",
                      module_id: moduleId,
                      title: newLessonTitle.trim(),
                      description: null,
                      content_type: newLessonContentType as LessonRow["content_type"],
                      content: {},
                      duration_minutes: null,
                      is_required: false,
                      is_published: false,
                      sort_order: mod.lessons.length,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                  ],
                }
              : mod
          )
        );
      }
      setAddLessonModuleId(null);
      setNewLessonTitle("");
      setNewLessonContentType("text");
      router.refresh();
    });
  }

  function handleDeleteConfirm() {
    if (!confirmDelete) return;

    startTransition(async () => {
      if (confirmDelete.type === "module") {
        const result = await deleteModuleAction(confirmDelete.id);
        if (result.success) {
          setModules((prev) => prev.filter((m) => m.id !== confirmDelete.id));
        }
      } else {
        const result = await deleteLessonAction(confirmDelete.id);
        if (result.success) {
          setModules((prev) =>
            prev.map((mod) => ({
              ...mod,
              lessons: mod.lessons.filter((l) => l.id !== confirmDelete.id),
            }))
          );
        }
      }
      setConfirmDelete(null);
      router.refresh();
    });
  }

  function handleTogglePublished() {
    startTransition(async () => {
      const result = await togglePublishedAction();
      if (result.success) {
        setIsPublished((prev) => !prev);
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Publish Toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant={isPublished ? "outline" : "default"}
          onClick={handleTogglePublished}
          disabled={isPending}
        >
          {isPublished ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </>
          )}
        </Button>
      </div>

      {/* Modules & Lessons */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Modules & Lessons
        </h2>

        {modules.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No modules yet. Add your first module to start building this
                  course.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          modules.map((mod, modIndex) => (
            <Card key={mod.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleModuleExpanded(mod.id)}
                    className="flex items-center gap-2 text-left"
                  >
                    {expandedModules.has(mod.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <CardTitle className="text-base">
                      <span className="text-gray-400 mr-2">
                        {modIndex + 1}.
                      </span>
                      {mod.title}
                    </CardTitle>
                    <span className="text-xs text-gray-400 ml-2">
                      {mod.lessons.length} lesson
                      {mod.lessons.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAddLessonModuleId(mod.id);
                        setNewLessonTitle("");
                        setNewLessonContentType("text");
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lesson
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setConfirmDelete({
                          type: "module",
                          id: mod.id,
                          name: mod.title,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedModules.has(mod.id) && (
                <CardContent className="pt-0">
                  {mod.lessons.length === 0 ? (
                    <p className="text-sm text-gray-400 py-2 pl-6">
                      No lessons in this module.
                    </p>
                  ) : (
                    <div className="space-y-1 pl-6">
                      {mod.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 group"
                        >
                          <Link
                            href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                            className="flex items-center gap-3 flex-1 min-w-0"
                          >
                            <span className="text-xs text-gray-400 w-6 shrink-0">
                              {modIndex + 1}.{lessonIndex + 1}
                            </span>
                            <span className="text-gray-500 shrink-0">
                              {CONTENT_TYPE_ICONS[lesson.content_type] || (
                                <FileText className="h-4 w-4" />
                              )}
                            </span>
                            <span className="text-sm text-gray-900 truncate">
                              {lesson.title}
                            </span>
                            <Badge
                              variant={
                                CONTENT_TYPE_COLORS[lesson.content_type] ||
                                "secondary"
                              }
                            >
                              {CONTENT_TYPE_LABELS[lesson.content_type] ||
                                lesson.content_type}
                            </Badge>
                            {lesson.duration_minutes !== null && (
                              <span className="text-xs text-gray-400 shrink-0">
                                {lesson.duration_minutes} min
                              </span>
                            )}
                          </Link>
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                            >
                              <Button variant="ghost" size="sm">
                                <Pencil className="h-4 w-4 text-gray-500" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setConfirmDelete({
                                  type: "lesson",
                                  id: lesson.id,
                                  name: lesson.title,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}

        {/* Add Module Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setShowAddModule(true);
            setNewModuleTitle("");
            setNewModuleDescription("");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {/* Add Module Dialog */}
      {showAddModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Module
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModule(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="module-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="module-title"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="e.g., Getting Started"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-description">Description</Label>
                <Textarea
                  id="module-description"
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  placeholder="Brief description of this module..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleAddModule}
                disabled={!newModuleTitle.trim() || isPending}
              >
                {isPending ? "Adding..." : "Add Module"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowAddModule(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lesson Dialog */}
      {addLessonModuleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Lesson
              </h3>
              <button
                type="button"
                onClick={() => setAddLessonModuleId(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lesson-title"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="e.g., Introduction to Variables"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-content-type">Content Type</Label>
                <select
                  id="lesson-content-type"
                  value={newLessonContentType}
                  onChange={(e) => setNewLessonContentType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="embed">Embed</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={() => handleAddLesson(addLessonModuleId)}
                disabled={!newLessonTitle.trim() || isPending}
              >
                {isPending ? "Adding..." : "Add Lesson"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setAddLessonModuleId(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete {confirmDelete.type === "module" ? "Module" : "Lesson"}
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-medium">&quot;{confirmDelete.name}&quot;</span>?
              {confirmDelete.type === "module" &&
                " This will also delete all lessons within this module."}
              {" "}This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
