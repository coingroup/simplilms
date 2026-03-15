"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { Input } from "@simplilms/ui";
import { Label } from "@simplilms/ui";
import { Textarea } from "@simplilms/ui";
import { Button } from "@simplilms/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Course"}
    </Button>
  );
}

export function CourseCreateForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [isFree, setIsFree] = useState(true);

  return (
    <form action={action}>
      <div className="grid gap-6 max-w-2xl">
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
                placeholder="e.g., Introduction to Web Development"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A brief overview of the course content and goals..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="e.g., Web Development"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  name="difficulty"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue=""
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
                placeholder="e.g., 40"
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
                  placeholder="e.g., 4999 for $49.99"
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
                placeholder="Enter one learning objective per line..."
                rows={4}
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
          <SubmitButton />
          <a
            href="/admin/courses"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </a>
        </div>
      </div>
    </form>
  );
}
