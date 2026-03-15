"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

// ============================================================
// Types
// ============================================================

export interface LessonProgressRow {
  id: string;
  tenant_id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  status: "not_started" | "in_progress" | "completed";
  started_at: string | null;
  completed_at: string | null;
  time_spent_seconds: number;
  last_position: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollmentRow {
  id: string;
  tenant_id: string;
  course_id: string;
  student_id: string;
  status: "active" | "completed" | "dropped" | "expired";
  enrolled_at: string;
  completed_at: string | null;
  expires_at: string | null;
  certificate_id: string | null;
  progress_pct: number;
  last_accessed_at: string | null;
  created_at: string;
}

export interface QuizAttemptRow {
  id: string;
  tenant_id: string;
  quiz_id: string;
  student_id: string;
  attempt_number: number;
  status: "in_progress" | "submitted" | "graded";
  answers: Array<{
    question_id: string;
    selected?: string;
    text?: string;
  }>;
  score_pct: number | null;
  points_earned: number | null;
  points_possible: number | null;
  passed: boolean | null;
  started_at: string;
  submitted_at: string | null;
  graded_at: string | null;
  graded_by: string | null;
  time_spent_seconds: number | null;
  created_at: string;
}

export interface QuizRow {
  id: string;
  tenant_id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  quiz_type: "graded" | "practice" | "survey";
  passing_score: number;
  max_attempts: number | null;
  time_limit_minutes: number | null;
  shuffle_questions: boolean;
  show_answers_after: "never" | "submission" | "grading";
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestionRow {
  id: string;
  tenant_id: string;
  quiz_id: string;
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  question_text: string;
  explanation: string | null;
  options: Array<{
    id: string;
    text: string;
    is_correct?: boolean;
  }>;
  points: number;
  sort_order: number;
  created_at: string;
}

export interface CertificateRow {
  id: string;
  tenant_id: string;
  student_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  template_data: Record<string, unknown>;
  pdf_url: string | null;
  verification_code: string;
  created_at: string;
}

// ============================================================
// Queries — Course Enrollments
// ============================================================

export async function getStudentCourseEnrollments(
  studentId: string
): Promise<CourseEnrollmentRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("course_enrollments")
    .select("*")
    .eq("student_id", studentId)
    .order("enrolled_at", { ascending: false });

  if (error) {
    console.error("Error fetching student course enrollments:", error);
    return [];
  }
  return (data || []) as CourseEnrollmentRow[];
}

export async function getCourseEnrollmentCount(
  courseId: string
): Promise<number> {
  const supabase = await createServerClient();
  const { count, error } = await (supabase as any)
    .from("course_enrollments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId)
    .in("status", ["active", "completed"]);

  if (error) return 0;
  return count || 0;
}

// ============================================================
// Queries — Lesson Progress
// ============================================================

export async function getStudentLessonProgress(
  studentId: string,
  courseId: string
): Promise<LessonProgressRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("lesson_progress")
    .select("*")
    .eq("student_id", studentId)
    .eq("course_id", courseId);

  if (error) {
    console.error("Error fetching lesson progress:", error);
    return [];
  }
  return (data || []) as LessonProgressRow[];
}

// ============================================================
// Queries — Quizzes
// ============================================================

export async function getQuizById(
  quizId: string
): Promise<QuizRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (error) return null;
  return data as QuizRow;
}

export async function getQuizQuestions(
  quizId: string
): Promise<QuizQuestionRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching quiz questions:", error);
    return [];
  }
  return (data || []) as QuizQuestionRow[];
}

export async function getQuizAttempts(
  quizId: string,
  studentId: string
): Promise<QuizAttemptRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quizId)
    .eq("student_id", studentId)
    .order("attempt_number", { ascending: false });

  if (error) {
    console.error("Error fetching quiz attempts:", error);
    return [];
  }
  return (data || []) as QuizAttemptRow[];
}

export async function getCourseQuizzes(
  courseId: string
): Promise<QuizRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("quizzes")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching quizzes:", error);
    return [];
  }
  return (data || []) as QuizRow[];
}

// ============================================================
// Queries — Certificates
// ============================================================

export async function getStudentCertificates(
  studentId: string
): Promise<CertificateRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("certificates")
    .select("*")
    .eq("student_id", studentId)
    .order("issued_at", { ascending: false });

  if (error) {
    console.error("Error fetching certificates:", error);
    return [];
  }
  return (data || []) as CertificateRow[];
}

export async function getCertificateByVerificationCode(
  code: string
): Promise<CertificateRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("certificates")
    .select("*")
    .eq("verification_code", code)
    .single();

  if (error) return null;
  return data as CertificateRow;
}

// ============================================================
// Queries — Course Enrollment Management (Admin)
// ============================================================

export interface CourseEnrollmentWithStudent extends CourseEnrollmentRow {
  student?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export async function getCourseEnrollments(
  courseId: string
): Promise<CourseEnrollmentWithStudent[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("course_enrollments")
    .select("*, student:profiles!course_enrollments_student_id_fkey(id, first_name, last_name, email)")
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: false });

  if (error) {
    console.error("Error fetching course enrollments:", error);
    return [];
  }
  return (data || []).map((row: any) => ({
    ...row,
    student: row.student || undefined,
  })) as CourseEnrollmentWithStudent[];
}

export async function getAvailableStudents(): Promise<
  { id: string; first_name: string | null; last_name: string | null; email: string | null }[]
> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("role", ["student"])
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }
  return data || [];
}

export async function updateCourseEnrollmentStatus(
  enrollmentId: string,
  status: "active" | "dropped" | "expired"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const updateData: Record<string, unknown> = { status };
    if (status === "dropped") {
      updateData.completed_at = null;
    }

    const { error } = await (supabase as any)
      .from("course_enrollments")
      .update(updateData)
      .eq("id", enrollmentId);

    if (error) {
      console.error("Error updating enrollment:", error);
      return { success: false, error: "Failed to update enrollment" };
    }

    return { success: true };
  } catch (err) {
    console.error("updateCourseEnrollmentStatus error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Mutations — Course Enrollment
// ============================================================

export async function enrollStudentInCourse(
  courseId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    const { error } = await (supabase as any)
      .from("course_enrollments")
      .insert({
        tenant_id: tenantId,
        course_id: courseId,
        student_id: studentId,
      });

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Student is already enrolled" };
      }
      console.error("Error enrolling student:", error);
      return { success: false, error: "Failed to enroll student" };
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (err) {
    console.error("enrollStudentInCourse error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Mutations — Lesson Progress
// ============================================================

export async function startLesson(
  lessonId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    const { error } = await (supabase as any)
      .from("lesson_progress")
      .upsert(
        {
          tenant_id: tenantId,
          student_id: user.user.id,
          lesson_id: lessonId,
          course_id: courseId,
          status: "in_progress",
          started_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id,student_id,lesson_id" }
      );

    if (error) {
      console.error("Error starting lesson:", error);
      return { success: false, error: "Failed to start lesson" };
    }

    // Update course enrollment last_accessed_at
    await (supabase as any)
      .from("course_enrollments")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("course_id", courseId)
      .eq("student_id", user.user.id);

    return { success: true };
  } catch (err) {
    console.error("startLesson error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function completeLesson(
  lessonId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    // Mark lesson complete
    const { error } = await (supabase as any)
      .from("lesson_progress")
      .upsert(
        {
          tenant_id: tenantId,
          student_id: user.user.id,
          lesson_id: lessonId,
          course_id: courseId,
          status: "completed",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id,student_id,lesson_id" }
      );

    if (error) {
      console.error("Error completing lesson:", error);
      return { success: false, error: "Failed to complete lesson" };
    }

    // Recalculate course progress percentage
    await recalculateCourseProgress(supabase, courseId, user.user.id, tenantId);

    revalidatePath(`/student/courses/${courseId}`);
    return { success: true };
  } catch (err) {
    console.error("completeLesson error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

async function recalculateCourseProgress(
  supabase: any,
  courseId: string,
  studentId: string,
  tenantId: string
): Promise<void> {
  // Count total required lessons in course
  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId);

  if (!modules || modules.length === 0) return;

  const moduleIds = modules.map((m: any) => m.id);
  const { count: totalLessons } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .in("module_id", moduleIds)
    .eq("is_required", true);

  if (!totalLessons) return;

  // Count completed lessons
  const { count: completedLessons } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("status", "completed");

  const progressPct = Math.round(
    ((completedLessons || 0) / totalLessons) * 100
  );

  const updateData: Record<string, unknown> = {
    progress_pct: progressPct,
    last_accessed_at: new Date().toISOString(),
  };

  // If 100%, mark course as completed
  if (progressPct >= 100) {
    updateData.status = "completed";
    updateData.completed_at = new Date().toISOString();
  }

  await supabase
    .from("course_enrollments")
    .update(updateData)
    .eq("course_id", courseId)
    .eq("student_id", studentId)
    .eq("tenant_id", tenantId);
}

// ============================================================
// Mutations — Quiz Attempts
// ============================================================

export async function startQuizAttempt(
  quizId: string
): Promise<{ success: boolean; error?: string; attemptId?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    // Check max attempts
    const quiz = await getQuizById(quizId);
    if (!quiz) return { success: false, error: "Quiz not found" };

    const { data: existingAttempts } = await (supabase as any)
      .from("quiz_attempts")
      .select("attempt_number")
      .eq("quiz_id", quizId)
      .eq("student_id", user.user.id)
      .order("attempt_number", { ascending: false })
      .limit(1);

    const nextAttempt = existingAttempts?.[0]
      ? existingAttempts[0].attempt_number + 1
      : 1;

    if (quiz.max_attempts && nextAttempt > quiz.max_attempts) {
      return { success: false, error: "Maximum attempts reached" };
    }

    // Check for in-progress attempt
    const { data: inProgress } = await (supabase as any)
      .from("quiz_attempts")
      .select("id")
      .eq("quiz_id", quizId)
      .eq("student_id", user.user.id)
      .eq("status", "in_progress")
      .limit(1);

    if (inProgress && inProgress.length > 0) {
      return { success: true, attemptId: inProgress[0].id };
    }

    const { data: attempt, error } = await (supabase as any)
      .from("quiz_attempts")
      .insert({
        tenant_id: tenantId,
        quiz_id: quizId,
        student_id: user.user.id,
        attempt_number: nextAttempt,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error starting quiz attempt:", error);
      return { success: false, error: "Failed to start quiz" };
    }

    return { success: true, attemptId: attempt.id };
  } catch (err) {
    console.error("startQuizAttempt error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function submitQuizAttempt(
  attemptId: string,
  answers: Array<{ question_id: string; selected?: string; text?: string }>
): Promise<{ success: boolean; error?: string; score?: number; passed?: boolean }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    const supabase = await createServerClient();

    // Get the attempt
    const { data: attempt } = await (supabase as any)
      .from("quiz_attempts")
      .select("*, quizzes(*)")
      .eq("id", attemptId)
      .single();

    if (!attempt) return { success: false, error: "Attempt not found" };
    if (attempt.student_id !== user.user.id)
      return { success: false, error: "Not your attempt" };

    // Get questions for auto-grading
    const questions = await getQuizQuestions(attempt.quiz_id);

    // Auto-grade (skip essay questions)
    let pointsEarned = 0;
    let pointsPossible = 0;
    let hasEssay = false;

    for (const q of questions) {
      pointsPossible += q.points;
      const answer = answers.find((a) => a.question_id === q.id);

      if (!answer) continue;

      if (q.question_type === "essay") {
        hasEssay = true;
        continue; // Skip — needs manual grading
      }

      if (q.question_type === "multiple_choice" || q.question_type === "true_false") {
        const correctOption = q.options.find((o) => o.is_correct);
        if (correctOption && answer.selected === correctOption.id) {
          pointsEarned += q.points;
        }
      } else if (q.question_type === "short_answer") {
        const expectedAnswer = q.options[0]?.text?.toLowerCase().trim();
        if (
          expectedAnswer &&
          answer.text?.toLowerCase().trim() === expectedAnswer
        ) {
          pointsEarned += q.points;
        }
      }
    }

    const scorePct =
      pointsPossible > 0
        ? Math.round((pointsEarned / pointsPossible) * 100)
        : 0;
    const passed = scorePct >= (attempt.quizzes?.passing_score || 70);

    const { error } = await (supabase as any)
      .from("quiz_attempts")
      .update({
        answers,
        score_pct: scorePct,
        points_earned: pointsEarned,
        points_possible: pointsPossible,
        passed,
        status: hasEssay ? "submitted" : "graded",
        submitted_at: new Date().toISOString(),
        graded_at: hasEssay ? null : new Date().toISOString(),
      })
      .eq("id", attemptId);

    if (error) {
      console.error("Error submitting quiz:", error);
      return { success: false, error: "Failed to submit quiz" };
    }

    return { success: true, score: scorePct, passed };
  } catch (err) {
    console.error("submitQuizAttempt error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Mutations — Certificates
// ============================================================

export async function issueCertificate(
  courseId: string,
  studentId: string
): Promise<{ success: boolean; error?: string; certificateId?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };
    if (user.role !== "super_admin")
      return { success: false, error: "Insufficient permissions" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    // Generate certificate number
    const { data: certNum } = await (supabase as any).rpc(
      "generate_certificate_number"
    );

    const verificationCode = crypto.randomUUID().replace(/-/g, "").substring(0, 12).toUpperCase();

    // Get student and course info for template data
    const { data: student } = await (supabase as any)
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", studentId)
      .single();

    const { data: course } = await (supabase as any)
      .from("courses")
      .select("title")
      .eq("id", courseId)
      .single();

    const { data: cert, error } = await (supabase as any)
      .from("certificates")
      .insert({
        tenant_id: tenantId,
        student_id: studentId,
        course_id: courseId,
        certificate_number: certNum || `CERT-${Date.now()}`,
        verification_code: verificationCode,
        template_data: {
          student_name: student
            ? `${student.first_name} ${student.last_name}`
            : "Student",
          course_title: course?.title || "Course",
          issued_date: new Date().toISOString(),
        },
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Certificate already issued" };
      }
      console.error("Error issuing certificate:", error);
      return { success: false, error: "Failed to issue certificate" };
    }

    // Link certificate to course enrollment
    await (supabase as any)
      .from("course_enrollments")
      .update({ certificate_id: cert.id })
      .eq("course_id", courseId)
      .eq("student_id", studentId)
      .eq("tenant_id", tenantId);

    revalidatePath("/admin/certificates");
    revalidatePath(`/student/certificates`);
    return { success: true, certificateId: cert.id };
  } catch (err) {
    console.error("issueCertificate error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
