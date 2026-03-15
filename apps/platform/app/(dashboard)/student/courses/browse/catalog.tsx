"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
} from "@simplilms/ui";
import type { CourseRow } from "@simplilms/core/actions/courses";
import {
  BookOpen,
  Check,
  Clock,
  GraduationCap,
  Loader2,
  Search,
} from "lucide-react";

interface CourseCatalogClientProps {
  courses: CourseRow[];
  enrolledCourseIds: string[];
  enrollAction: (
    courseId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-purple-100 text-purple-800",
};

export function CourseCatalogClient({
  courses,
  enrolledCourseIds: initialEnrolledIds,
  enrollAction,
}: CourseCatalogClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(
    null
  );
  const [enrolledIds, setEnrolledIds] = useState(
    new Set(initialEnrolledIds)
  );
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );

  // Extract unique categories
  const categories = Array.from(
    new Set(courses.map((c) => c.category).filter(Boolean) as string[])
  );

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !search ||
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase()) ||
      course.category?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !selectedCategory || course.category === selectedCategory;

    const matchesDifficulty =
      !selectedDifficulty || course.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  function handleEnroll(courseId: string) {
    setEnrollingCourseId(courseId);

    startTransition(async () => {
      const result = await enrollAction(courseId);
      if (result.success) {
        setEnrolledIds((prev) => new Set([...prev, courseId]));
        router.refresh();
      }
      setEnrollingCourseId(null);
    });
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Category filters */}
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Difficulty filters */}
          <span className="text-gray-300 mx-1">|</span>
          {(["beginner", "intermediate", "advanced"] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() =>
                setSelectedDifficulty(
                  selectedDifficulty === diff ? null : diff
                )
              }
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedDifficulty === diff
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {DIFFICULTY_LABELS[diff]}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">No courses found</p>
          <p className="text-xs text-gray-400 mt-1">
            {search || selectedCategory || selectedDifficulty
              ? "Try adjusting your filters."
              : "No courses are available at this time."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledIds.has(course.id);
            const isEnrolling = enrollingCourseId === course.id;

            return (
              <Card
                key={course.id}
                className="flex flex-col h-full hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">
                      {course.title}
                    </CardTitle>
                    {course.is_free && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-green-100 text-green-800"
                      >
                        Free
                      </Badge>
                    )}
                  </div>
                  {course.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
                      {course.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  {/* Metadata */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {course.category && (
                        <Badge variant="outline" className="text-xs">
                          {course.category}
                        </Badge>
                      )}
                      {course.difficulty && (
                        <Badge
                          variant="secondary"
                          className={`text-xs ${DIFFICULTY_COLORS[course.difficulty] || ""}`}
                        >
                          {DIFFICULTY_LABELS[course.difficulty]}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {course.estimated_hours !== null && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {course.estimated_hours} hours
                        </span>
                      )}
                      {course.learning_objectives &&
                        course.learning_objectives.length > 0 && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {course.learning_objectives.length} objectives
                          </span>
                        )}
                    </div>

                    {/* Learning objectives preview */}
                    {course.learning_objectives &&
                      course.learning_objectives.length > 0 && (
                        <ul className="text-xs text-gray-500 space-y-1">
                          {course.learning_objectives.slice(0, 3).map((obj, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <Check className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{obj}</span>
                            </li>
                          ))}
                          {course.learning_objectives.length > 3 && (
                            <li className="text-gray-400">
                              +{course.learning_objectives.length - 3} more
                            </li>
                          )}
                        </ul>
                      )}
                  </div>

                  {/* Action */}
                  {isEnrolled ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(`/student/courses/${course.id}`)
                      }
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleEnroll(course.id)}
                      disabled={isPending}
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-4 w-4 mr-2" />
                          {course.is_free
                            ? "Enroll for Free"
                            : course.price_cents
                              ? `Enroll — $${(course.price_cents / 100).toFixed(2)}`
                              : "Enroll Now"}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
