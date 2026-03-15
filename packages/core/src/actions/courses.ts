"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

// ============================================================
// Types
// ============================================================

export interface CourseRow {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  estimated_hours: number | null;
  is_published: boolean;
  is_free: boolean;
  price_cents: number | null;
  max_students: number | null;
  instructor_id: string | null;
  prerequisites: string[];
  learning_objectives: string[];
  tags: string[];
  settings: Record<string, unknown>;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModuleRow {
  id: string;
  tenant_id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  unlock_rule: "immediate" | "sequential" | "date";
  unlock_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonRow {
  id: string;
  tenant_id: string;
  module_id: string;
  title: string;
  description: string | null;
  content_type: "text" | "video" | "document" | "embed" | "quiz";
  content: Record<string, unknown>;
  duration_minutes: number | null;
  is_required: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Queries
// ============================================================

export async function getCourses(): Promise<CourseRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
  return (data || []) as CourseRow[];
}

export async function getPublishedCourses(): Promise<CourseRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching published courses:", error);
    return [];
  }
  return (data || []) as CourseRow[];
}

export async function getCourseById(
  id: string
): Promise<CourseRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching course:", error);
    return null;
  }
  return data as CourseRow;
}

export async function getCourseBySlug(
  slug: string
): Promise<CourseRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as CourseRow;
}

export async function getModulesByCourse(
  courseId: string
): Promise<ModuleRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching modules:", error);
    return [];
  }
  return (data || []) as ModuleRow[];
}

export async function getLessonsByModule(
  moduleId: string
): Promise<LessonRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("lessons")
    .select("*")
    .eq("module_id", moduleId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }
  return (data || []) as LessonRow[];
}

export async function getLessonById(
  lessonId: string
): Promise<LessonRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error) {
    console.error("Error fetching lesson:", error);
    return null;
  }
  return data as LessonRow;
}

export async function getCourseWithContent(courseId: string): Promise<{
  course: CourseRow;
  modules: (ModuleRow & { lessons: LessonRow[] })[];
} | null> {
  const course = await getCourseById(courseId);
  if (!course) return null;

  const modules = await getModulesByCourse(courseId);
  const modulesWithLessons = await Promise.all(
    modules.map(async (mod) => {
      const lessons = await getLessonsByModule(mod.id);
      return { ...mod, lessons };
    })
  );

  return { course, modules: modulesWithLessons };
}

// ============================================================
// Mutations — Courses
// ============================================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

export async function createCourse(
  formData: FormData
): Promise<void> {
  const { user, error: authError } = await getUser();
  if (authError || !user) throw new Error("Unauthorized");
  if (user.role !== "super_admin") throw new Error("Insufficient permissions");

  const title = formData.get("title") as string;
  if (!title || title.trim().length === 0) {
    throw new Error("Course title is required");
  }

  const supabase = await createServerClient();
  const tenantId = getTenantId();

  // Generate unique slug
  let slug = generateSlug(title);
  const { data: existing } = await (supabase as any)
    .from("courses")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const insertData: Record<string, unknown> = {
    tenant_id: tenantId,
    title: title.trim(),
    slug,
    description: (formData.get("description") as string)?.trim() || null,
    category: (formData.get("category") as string)?.trim() || null,
    difficulty: (formData.get("difficulty") as string) || null,
    estimated_hours: formData.get("estimated_hours")
      ? Number(formData.get("estimated_hours"))
      : null,
    is_free: formData.get("is_free") === "true",
    price_cents: formData.get("price_cents")
      ? Number(formData.get("price_cents"))
      : null,
    max_students: formData.get("max_students")
      ? Number(formData.get("max_students"))
      : null,
    instructor_id: (formData.get("instructor_id") as string) || null,
  };

  const objectivesRaw = formData.get("learning_objectives") as string;
  if (objectivesRaw) {
    insertData.learning_objectives = objectivesRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const { data, error } = await (supabase as any)
    .from("courses")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    console.error("Error creating course:", error);
    throw new Error("Failed to create course");
  }

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${data.id}`);
}

export async function updateCourse(
  courseId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const title = formData.get("title") as string;
    if (!title || title.trim().length === 0) {
      return { success: false, error: "Course title is required" };
    }

    const supabase = await createServerClient();

    const updateData: Record<string, unknown> = {
      title: title.trim(),
      description: (formData.get("description") as string)?.trim() || null,
      category: (formData.get("category") as string)?.trim() || null,
      difficulty: (formData.get("difficulty") as string) || null,
      estimated_hours: formData.get("estimated_hours")
        ? Number(formData.get("estimated_hours"))
        : null,
      is_free: formData.get("is_free") === "true",
      price_cents: formData.get("price_cents")
        ? Number(formData.get("price_cents"))
        : null,
      max_students: formData.get("max_students")
        ? Number(formData.get("max_students"))
        : null,
      instructor_id: (formData.get("instructor_id") as string) || null,
    };

    const objectivesRaw = formData.get("learning_objectives") as string;
    if (objectivesRaw !== null) {
      updateData.learning_objectives = objectivesRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const { error } = await (supabase as any)
      .from("courses")
      .update(updateData)
      .eq("id", courseId);

    if (error) {
      console.error("Error updating course:", error);
      return { success: false, error: "Failed to update course" };
    }

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (err) {
    console.error("updateCourse error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleCoursePublished(
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const course = await getCourseById(courseId);
    if (!course) return { success: false, error: "Course not found" };

    const supabase = await createServerClient();
    const newPublished = !course.is_published;

    const { error } = await (supabase as any)
      .from("courses")
      .update({
        is_published: newPublished,
        published_at: newPublished ? new Date().toISOString() : null,
      })
      .eq("id", courseId);

    if (error) {
      console.error("Error toggling course publish:", error);
      return { success: false, error: "Failed to update course" };
    }

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (err) {
    console.error("toggleCoursePublished error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Mutations — Modules
// ============================================================

export async function createModule(
  courseId: string,
  data: { title: string; description?: string }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    // Get the next sort order
    const { data: existing } = await (supabase as any)
      .from("modules")
      .select("sort_order")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder = existing?.[0] ? existing[0].sort_order + 1 : 0;

    const { data: mod, error } = await (supabase as any)
      .from("modules")
      .insert({
        tenant_id: tenantId,
        course_id: courseId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        sort_order: nextOrder,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating module:", error);
      return { success: false, error: "Failed to create module" };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true, id: mod.id };
  } catch (err) {
    console.error("createModule error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateModule(
  moduleId: string,
  data: { title?: string; description?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined)
      updateData.description = data.description.trim() || null;

    const { error } = await (supabase as any)
      .from("modules")
      .update(updateData)
      .eq("id", moduleId);

    if (error) {
      console.error("Error updating module:", error);
      return { success: false, error: "Failed to update module" };
    }

    revalidatePath("/admin/courses");
    return { success: true };
  } catch (err) {
    console.error("updateModule error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteModule(
  moduleId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const { error } = await (supabase as any)
      .from("modules")
      .delete()
      .eq("id", moduleId);

    if (error) {
      console.error("Error deleting module:", error);
      return { success: false, error: "Failed to delete module" };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (err) {
    console.error("deleteModule error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Mutations — Lessons
// ============================================================

export async function createLesson(
  moduleId: string,
  courseId: string,
  data: {
    title: string;
    content_type?: string;
    description?: string;
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    const { data: existing } = await (supabase as any)
      .from("lessons")
      .select("sort_order")
      .eq("module_id", moduleId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder = existing?.[0] ? existing[0].sort_order + 1 : 0;

    const { data: lesson, error } = await (supabase as any)
      .from("lessons")
      .insert({
        tenant_id: tenantId,
        module_id: moduleId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        content_type: data.content_type || "text",
        content: {},
        sort_order: nextOrder,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating lesson:", error);
      return { success: false, error: "Failed to create lesson" };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true, id: lesson.id };
  } catch (err) {
    console.error("createLesson error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateLesson(
  lessonId: string,
  courseId: string,
  data: {
    title?: string;
    description?: string;
    content_type?: string;
    content?: Record<string, unknown>;
    duration_minutes?: number | null;
    is_required?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined)
      updateData.description = data.description.trim() || null;
    if (data.content_type !== undefined) updateData.content_type = data.content_type;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.duration_minutes !== undefined)
      updateData.duration_minutes = data.duration_minutes;
    if (data.is_required !== undefined) updateData.is_required = data.is_required;

    const { error } = await (supabase as any)
      .from("lessons")
      .update(updateData)
      .eq("id", lessonId);

    if (error) {
      console.error("Error updating lesson:", error);
      return { success: false, error: "Failed to update lesson" };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (err) {
    console.error("updateLesson error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteLesson(
  lessonId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const { error } = await (supabase as any)
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (error) {
      console.error("Error deleting lesson:", error);
      return { success: false, error: "Failed to delete lesson" };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (err) {
    console.error("deleteLesson error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
