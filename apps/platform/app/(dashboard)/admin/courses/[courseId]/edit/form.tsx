"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Button,
} from "@simplilms/ui";
import { Loader2, Save, Check } from "lucide-react";
import type { CourseRow } from "@simplilms/core/actions/courses";

interface CourseEditFormProps {
  course: CourseRow;
  updateAction: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
}

export function CourseEditForm({ course, updateAction }: CourseEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFree, setIsFree] = useState(course.is_free);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    if (isFree) {
      formData.set("is_free", "true");
    } else {
      formData.delete("is_free");
    }

    startTransition(async () => {
      const result = await updateAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 max-w-2xl">
        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Course Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={course.title}
                placeholder="e.g., Introduction to Web Development"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={course.description || ""}
                placeholder="A brief overview of the course content and goals..."
                rows={3}
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={course.category || ""}
                  placeholder="e.g., Web Development"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  name="difficulty"
                  defaultValue={course.difficulty || ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  disabled={isPending}
                >
                  <option value="">Select difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                name="estimated_hours"
                type="number"
                min="0"
                step="0.5"
                defaultValue={course.estimated_hours ?? ""}
                placeholder="e.g., 40"
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                id="is_free"
                name="is_free"
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                value="true"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={isPending}
              />
              <Label htmlFor="is_free" className="cursor-pointer">
                This course is free
              </Label>
            </div>
            {!isFree && (
              <div className="space-y-2">
                <Label htmlFor="price_cents">Price (in cents)</Label>
                <Input
                  id="price_cents"
                  name="price_cents"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={course.price_cents ?? ""}
                  placeholder="e.g., 4999 for $49.99"
                  disabled={isPending}
                />
                <p className="text-xs text-gray-500">
                  Enter the price in cents. For example, $49.99 = 4999.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="learning_objectives">Objectives</Label>
              <Textarea
                id="learning_objectives"
                name="learning_objectives"
                defaultValue={
                  course.learning_objectives?.join("\n") || ""
                }
                placeholder="Enter one learning objective per line..."
                rows={4}
                disabled={isPending}
              />
              <p className="text-xs text-gray-500">
                Enter one objective per line. These will be displayed to
                students on the course overview.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <Button type="submit" disabled={isPending}>
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
          <a
            href={`/admin/courses/${course.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </a>
        </div>
      </div>
    </form>
  );
}
