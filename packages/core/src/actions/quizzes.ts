"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";
import type { QuizRow, QuizQuestionRow } from "./progress";

// ============================================================
// Mutations — Quizzes (Admin)
// ============================================================

export async function createQuiz(data: {
  courseId: string;
  lessonId?: string;
  title: string;
  description?: string;
  quizType?: "graded" | "practice" | "survey";
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    const { data: quiz, error } = await (supabase as any)
      .from("quizzes")
      .insert({
        tenant_id: tenantId,
        course_id: data.courseId,
        lesson_id: data.lessonId || null,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        quiz_type: data.quizType || "graded",
        passing_score: data.passingScore ?? 70,
        max_attempts: data.maxAttempts || null,
        time_limit_minutes: data.timeLimitMinutes || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating quiz:", error);
      return { success: false, error: "Failed to create quiz" };
    }

    revalidatePath(`/admin/courses/${data.courseId}`);
    return { success: true, id: quiz.id };
  } catch (err) {
    console.error("createQuiz error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateQuiz(
  quizId: string,
  data: {
    title?: string;
    description?: string;
    quizType?: string;
    passingScore?: number;
    maxAttempts?: number | null;
    timeLimitMinutes?: number | null;
    shuffleQuestions?: boolean;
    showAnswersAfter?: string;
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
    if (data.quizType !== undefined) updateData.quiz_type = data.quizType;
    if (data.passingScore !== undefined)
      updateData.passing_score = data.passingScore;
    if (data.maxAttempts !== undefined)
      updateData.max_attempts = data.maxAttempts;
    if (data.timeLimitMinutes !== undefined)
      updateData.time_limit_minutes = data.timeLimitMinutes;
    if (data.shuffleQuestions !== undefined)
      updateData.shuffle_questions = data.shuffleQuestions;
    if (data.showAnswersAfter !== undefined)
      updateData.show_answers_after = data.showAnswersAfter;

    const { error } = await (supabase as any)
      .from("quizzes")
      .update(updateData)
      .eq("id", quizId);

    if (error) {
      console.error("Error updating quiz:", error);
      return { success: false, error: "Failed to update quiz" };
    }

    return { success: true };
  } catch (err) {
    console.error("updateQuiz error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteQuiz(
  quizId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const { error } = await (supabase as any)
      .from("quizzes")
      .delete()
      .eq("id", quizId);

    if (error) {
      console.error("Error deleting quiz:", error);
      return { success: false, error: "Failed to delete quiz" };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (err) {
    console.error("deleteQuiz error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Mutations — Quiz Questions (Admin)
// ============================================================

export async function addQuestion(
  quizId: string,
  data: {
    questionType: "multiple_choice" | "true_false" | "short_answer" | "essay";
    questionText: string;
    explanation?: string;
    options?: Array<{ id: string; text: string; is_correct?: boolean }>;
    points?: number;
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    // Get next sort order
    const { data: existing } = await (supabase as any)
      .from("quiz_questions")
      .select("sort_order")
      .eq("quiz_id", quizId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder = existing?.[0] ? existing[0].sort_order + 1 : 0;

    const { data: question, error } = await (supabase as any)
      .from("quiz_questions")
      .insert({
        tenant_id: tenantId,
        quiz_id: quizId,
        question_type: data.questionType,
        question_text: data.questionText.trim(),
        explanation: data.explanation?.trim() || null,
        options: data.options || [],
        points: data.points ?? 1,
        sort_order: nextOrder,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error adding question:", error);
      return { success: false, error: "Failed to add question" };
    }

    return { success: true, id: question.id };
  } catch (err) {
    console.error("addQuestion error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateQuestion(
  questionId: string,
  data: {
    questionText?: string;
    explanation?: string;
    options?: Array<{ id: string; text: string; is_correct?: boolean }>;
    points?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const updateData: Record<string, unknown> = {};

    if (data.questionText !== undefined)
      updateData.question_text = data.questionText.trim();
    if (data.explanation !== undefined)
      updateData.explanation = data.explanation.trim() || null;
    if (data.options !== undefined) updateData.options = data.options;
    if (data.points !== undefined) updateData.points = data.points;

    const { error } = await (supabase as any)
      .from("quiz_questions")
      .update(updateData)
      .eq("id", questionId);

    if (error) {
      console.error("Error updating question:", error);
      return { success: false, error: "Failed to update question" };
    }

    return { success: true };
  } catch (err) {
    console.error("updateQuestion error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteQuestion(
  questionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const { error } = await (supabase as any)
      .from("quiz_questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      console.error("Error deleting question:", error);
      return { success: false, error: "Failed to delete question" };
    }

    return { success: true };
  } catch (err) {
    console.error("deleteQuestion error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
