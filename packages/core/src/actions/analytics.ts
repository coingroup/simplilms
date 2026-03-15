"use server";

import { createServerClient } from "@simplilms/auth/server";

// ============================================================
// Types
// ============================================================

export interface OverviewStats {
  totalStudents: number;
  totalCourses: number;
  activeEnrollments: number;
  totalRevenueCents: number;
  completedEnrollments: number;
  avgCompletionRate: number;
  avgQuizScore: number;
  totalLessonsCompleted: number;
}

export interface EnrollmentTrendPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface CoursePerformanceRow {
  courseId: string;
  courseTitle: string;
  enrollmentCount: number;
  completedCount: number;
  completionRate: number;
  avgQuizScore: number | null;
  avgProgressPct: number;
  isPublished: boolean;
}

export interface QuizPerformanceRow {
  quizId: string;
  quizTitle: string;
  courseTitle: string;
  courseId: string;
  attemptCount: number;
  avgScore: number;
  passRate: number;
  avgTimeSeconds: number | null;
}

export interface AtRiskStudent {
  studentId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  riskScore: number; // 0-100, higher = more at risk
  riskFactors: string[];
  lastAccessedAt: string | null;
  enrolledCourses: number;
  avgProgressPct: number;
}

export interface RevenueByPeriod {
  period: string; // YYYY-MM
  totalCents: number;
  transactionCount: number;
}

export interface StudentActivityRow {
  studentId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  enrolledCourses: number;
  completedCourses: number;
  lessonsCompleted: number;
  avgProgressPct: number;
  lastAccessedAt: string | null;
  totalTimeSpentSeconds: number;
}

// ============================================================
// Overview Stats
// ============================================================

export async function getAnalyticsOverview(): Promise<OverviewStats> {
  const supabase = await createServerClient();

  const [
    studentsRes,
    coursesRes,
    enrollmentsRes,
    completedRes,
    paymentsRes,
    progressRes,
    quizAttemptsRes,
    lessonProgressRes,
  ] = await Promise.all([
    // Total students
    (supabase as any)
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
    // Total published courses
    (supabase as any)
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    // Active course enrollments
    (supabase as any)
      .from("course_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    // Completed enrollments
    (supabase as any)
      .from("course_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    // Total revenue
    (supabase as any)
      .from("payments")
      .select("amount_cents")
      .eq("status", "succeeded"),
    // Avg progress
    (supabase as any)
      .from("course_enrollments")
      .select("progress_pct")
      .in("status", ["active", "completed"]),
    // Avg quiz score
    (supabase as any)
      .from("quiz_attempts")
      .select("score_pct")
      .eq("status", "graded")
      .not("score_pct", "is", null),
    // Lessons completed
    (supabase as any)
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  const totalRevenueCents = (paymentsRes.data || []).reduce(
    (sum: number, p: { amount_cents: number | null }) =>
      sum + (p.amount_cents || 0),
    0
  );

  const progressData = progressRes.data || [];
  const avgCompletionRate =
    progressData.length > 0
      ? Math.round(
          progressData.reduce(
            (sum: number, e: { progress_pct: number }) =>
              sum + (e.progress_pct || 0),
            0
          ) / progressData.length
        )
      : 0;

  const quizScores = quizAttemptsRes.data || [];
  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(
          quizScores.reduce(
            (sum: number, a: { score_pct: number | null }) =>
              sum + (a.score_pct || 0),
            0
          ) / quizScores.length
        )
      : 0;

  return {
    totalStudents: studentsRes.count || 0,
    totalCourses: coursesRes.count || 0,
    activeEnrollments: enrollmentsRes.count || 0,
    totalRevenueCents,
    completedEnrollments: completedRes.count || 0,
    avgCompletionRate,
    avgQuizScore,
    totalLessonsCompleted: lessonProgressRes.count || 0,
  };
}

// ============================================================
// Enrollment Trends (last 30 days or custom range)
// ============================================================

export async function getEnrollmentTrends(
  days: number = 30
): Promise<EnrollmentTrendPoint[]> {
  const supabase = await createServerClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await (supabase as any)
    .from("course_enrollments")
    .select("enrolled_at")
    .gte("enrolled_at", startDate.toISOString())
    .order("enrolled_at", { ascending: true });

  if (error || !data) return [];

  // Group by date
  const countsByDate: Record<string, number> = {};

  // Initialize all dates in range
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    countsByDate[key] = 0;
  }

  // Count enrollments per day
  (data as { enrolled_at: string }[]).forEach((row) => {
    const date = row.enrolled_at.split("T")[0];
    if (countsByDate[date] !== undefined) {
      countsByDate[date]++;
    }
  });

  return Object.entries(countsByDate).map(([date, count]) => ({
    date,
    count,
  }));
}

// ============================================================
// Course Performance
// ============================================================

export async function getCoursePerformance(): Promise<CoursePerformanceRow[]> {
  const supabase = await createServerClient();

  // Get all courses
  const { data: courses, error: courseError } = await (supabase as any)
    .from("courses")
    .select("id, title, is_published")
    .order("title");

  if (courseError || !courses || courses.length === 0) return [];

  // Get all course enrollments
  const { data: enrollments } = await (supabase as any)
    .from("course_enrollments")
    .select("course_id, status, progress_pct")
    .in("status", ["active", "completed"]);

  // Get quiz attempts grouped by course
  const { data: quizzes } = await (supabase as any)
    .from("quizzes")
    .select("id, course_id");

  const { data: attempts } = await (supabase as any)
    .from("quiz_attempts")
    .select("quiz_id, score_pct")
    .eq("status", "graded")
    .not("score_pct", "is", null);

  // Build quiz → course mapping
  const quizCourseMap: Record<string, string> = {};
  (quizzes || []).forEach((q: { id: string; course_id: string }) => {
    quizCourseMap[q.id] = q.course_id;
  });

  // Build course metrics
  const courseMetrics: Record<
    string,
    {
      enrollmentCount: number;
      completedCount: number;
      totalProgress: number;
      quizScores: number[];
    }
  > = {};

  courses.forEach((c: { id: string }) => {
    courseMetrics[c.id] = {
      enrollmentCount: 0,
      completedCount: 0,
      totalProgress: 0,
      quizScores: [],
    };
  });

  (enrollments || []).forEach(
    (e: { course_id: string; status: string; progress_pct: number }) => {
      const m = courseMetrics[e.course_id];
      if (!m) return;
      m.enrollmentCount++;
      if (e.status === "completed") m.completedCount++;
      m.totalProgress += e.progress_pct || 0;
    }
  );

  (attempts || []).forEach(
    (a: { quiz_id: string; score_pct: number | null }) => {
      const courseId = quizCourseMap[a.quiz_id];
      const m = courseMetrics[courseId];
      if (m && a.score_pct !== null) {
        m.quizScores.push(a.score_pct);
      }
    }
  );

  return (
    courses as { id: string; title: string; is_published: boolean }[]
  ).map((c) => {
    const m = courseMetrics[c.id];
    return {
      courseId: c.id,
      courseTitle: c.title,
      enrollmentCount: m.enrollmentCount,
      completedCount: m.completedCount,
      completionRate:
        m.enrollmentCount > 0
          ? Math.round((m.completedCount / m.enrollmentCount) * 100)
          : 0,
      avgQuizScore:
        m.quizScores.length > 0
          ? Math.round(
              m.quizScores.reduce((a, b) => a + b, 0) / m.quizScores.length
            )
          : null,
      avgProgressPct:
        m.enrollmentCount > 0
          ? Math.round(m.totalProgress / m.enrollmentCount)
          : 0,
      isPublished: c.is_published,
    };
  });
}

// ============================================================
// Quiz Performance
// ============================================================

export async function getQuizPerformance(): Promise<QuizPerformanceRow[]> {
  const supabase = await createServerClient();

  // Get all quizzes with course info
  const { data: quizzes, error } = await (supabase as any)
    .from("quizzes")
    .select("id, title, course_id")
    .eq("is_published", true);

  if (error || !quizzes || quizzes.length === 0) return [];

  // Get courses for titles
  const courseIds = [...new Set(quizzes.map((q: { course_id: string }) => q.course_id))] as string[];
  const { data: courses } = await (supabase as any)
    .from("courses")
    .select("id, title")
    .in("id", courseIds);

  const courseMap: Record<string, string> = {};
  (courses || []).forEach((c: { id: string; title: string }) => {
    courseMap[c.id] = c.title;
  });

  // Get all graded attempts
  const { data: attempts } = await (supabase as any)
    .from("quiz_attempts")
    .select("quiz_id, score_pct, passed, time_spent_seconds")
    .eq("status", "graded");

  // Group by quiz
  const quizMetrics: Record<
    string,
    {
      scores: number[];
      passCount: number;
      totalTime: number;
      timeCount: number;
    }
  > = {};

  (attempts || []).forEach(
    (a: {
      quiz_id: string;
      score_pct: number | null;
      passed: boolean | null;
      time_spent_seconds: number | null;
    }) => {
      if (!quizMetrics[a.quiz_id]) {
        quizMetrics[a.quiz_id] = {
          scores: [],
          passCount: 0,
          totalTime: 0,
          timeCount: 0,
        };
      }
      const m = quizMetrics[a.quiz_id];
      if (a.score_pct !== null) m.scores.push(a.score_pct);
      if (a.passed) m.passCount++;
      if (a.time_spent_seconds) {
        m.totalTime += a.time_spent_seconds;
        m.timeCount++;
      }
    }
  );

  return (quizzes as { id: string; title: string; course_id: string }[]).map(
    (q) => {
      const m = quizMetrics[q.id] || {
        scores: [],
        passCount: 0,
        totalTime: 0,
        timeCount: 0,
      };
      return {
        quizId: q.id,
        quizTitle: q.title,
        courseTitle: courseMap[q.course_id] || "Unknown Course",
        courseId: q.course_id,
        attemptCount: m.scores.length,
        avgScore:
          m.scores.length > 0
            ? Math.round(
                m.scores.reduce((a, b) => a + b, 0) / m.scores.length
              )
            : 0,
        passRate:
          m.scores.length > 0
            ? Math.round((m.passCount / m.scores.length) * 100)
            : 0,
        avgTimeSeconds:
          m.timeCount > 0 ? Math.round(m.totalTime / m.timeCount) : null,
      };
    }
  );
}

// ============================================================
// At-Risk Students
// ============================================================

export async function getAtRiskStudents(): Promise<AtRiskStudent[]> {
  const supabase = await createServerClient();

  // Get all students with active enrollments
  const { data: enrollments, error } = await (supabase as any)
    .from("course_enrollments")
    .select("student_id, course_id, progress_pct, last_accessed_at, enrolled_at, status")
    .eq("status", "active");

  if (error || !enrollments || enrollments.length === 0) return [];

  // Group by student
  const studentEnrollments: Record<
    string,
    {
      courseIds: string[];
      totalProgress: number;
      lastAccessed: string | null;
      enrollmentCount: number;
    }
  > = {};

  (
    enrollments as {
      student_id: string;
      course_id: string;
      progress_pct: number;
      last_accessed_at: string | null;
      enrolled_at: string;
    }[]
  ).forEach((e) => {
    if (!studentEnrollments[e.student_id]) {
      studentEnrollments[e.student_id] = {
        courseIds: [],
        totalProgress: 0,
        lastAccessed: null,
        enrollmentCount: 0,
      };
    }
    const s = studentEnrollments[e.student_id];
    s.courseIds.push(e.course_id);
    s.totalProgress += e.progress_pct || 0;
    s.enrollmentCount++;
    if (
      !s.lastAccessed ||
      (e.last_accessed_at && e.last_accessed_at > s.lastAccessed)
    ) {
      s.lastAccessed = e.last_accessed_at;
    }
  });

  // Get student profiles
  const studentIds = Object.keys(studentEnrollments);
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", studentIds);

  const profileMap: Record<
    string,
    { first_name: string | null; last_name: string | null; email: string | null }
  > = {};
  (profiles || []).forEach(
    (p: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    }) => {
      profileMap[p.id] = p;
    }
  );

  // Calculate risk scores
  const now = new Date();
  const results: AtRiskStudent[] = [];

  for (const [studentId, data] of Object.entries(studentEnrollments)) {
    const profile = profileMap[studentId] || {};
    const avgProgress = data.totalProgress / data.enrollmentCount;
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Factor 1: No activity in 7+ days (30 points)
    if (data.lastAccessed) {
      const daysSinceAccess = Math.floor(
        (now.getTime() - new Date(data.lastAccessed).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceAccess >= 14) {
        riskScore += 40;
        riskFactors.push(`No activity for ${daysSinceAccess} days`);
      } else if (daysSinceAccess >= 7) {
        riskScore += 25;
        riskFactors.push(`Inactive for ${daysSinceAccess} days`);
      } else if (daysSinceAccess >= 3) {
        riskScore += 10;
      }
    } else {
      riskScore += 30;
      riskFactors.push("Never accessed course");
    }

    // Factor 2: Low progress (30 points)
    if (avgProgress < 10) {
      riskScore += 30;
      riskFactors.push(`Very low progress (${Math.round(avgProgress)}%)`);
    } else if (avgProgress < 25) {
      riskScore += 20;
      riskFactors.push(`Low progress (${Math.round(avgProgress)}%)`);
    } else if (avgProgress < 50) {
      riskScore += 10;
    }

    // Factor 3: No progress at all with enrollment > 7 days old
    if (avgProgress === 0) {
      riskScore += 15;
      riskFactors.push("No lessons started");
    }

    // Only include students with risk score >= 30
    if (riskScore >= 30) {
      results.push({
        studentId,
        firstName: (profile as any).first_name || null,
        lastName: (profile as any).last_name || null,
        email: (profile as any).email || null,
        riskScore: Math.min(riskScore, 100),
        riskFactors,
        lastAccessedAt: data.lastAccessed,
        enrolledCourses: data.enrollmentCount,
        avgProgressPct: Math.round(avgProgress),
      });
    }
  }

  // Sort by risk score descending
  results.sort((a, b) => b.riskScore - a.riskScore);
  return results;
}

// ============================================================
// Revenue Analytics
// ============================================================

export async function getRevenueByMonth(
  months: number = 12
): Promise<RevenueByPeriod[]> {
  const supabase = await createServerClient();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const { data, error } = await (supabase as any)
    .from("payments")
    .select("amount_cents, paid_at")
    .eq("status", "succeeded")
    .gte("paid_at", startDate.toISOString())
    .order("paid_at", { ascending: true });

  if (error || !data) return [];

  // Initialize all months in range
  const periods: Record<string, { totalCents: number; transactionCount: number }> = {};
  for (let i = 0; i <= months; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    periods[key] = { totalCents: 0, transactionCount: 0 };
  }

  (data as { amount_cents: number; paid_at: string }[]).forEach((p) => {
    const d = new Date(p.paid_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (periods[key]) {
      periods[key].totalCents += p.amount_cents || 0;
      periods[key].transactionCount++;
    }
  });

  return Object.entries(periods).map(([period, data]) => ({
    period,
    ...data,
  }));
}

// ============================================================
// Student Activity (for export and detailed view)
// ============================================================

export async function getStudentActivity(): Promise<StudentActivityRow[]> {
  const supabase = await createServerClient();

  // Get all students
  const { data: students, error } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("role", "student")
    .order("last_name");

  if (error || !students || students.length === 0) return [];

  // Get all course enrollments
  const { data: enrollments } = await (supabase as any)
    .from("course_enrollments")
    .select("student_id, status, progress_pct, last_accessed_at")
    .in("status", ["active", "completed"]);

  // Get lesson progress for time spent
  const { data: lessonProgress } = await (supabase as any)
    .from("lesson_progress")
    .select("student_id, status, time_spent_seconds");

  // Build student metrics
  const studentMetrics: Record<
    string,
    {
      enrolledCourses: number;
      completedCourses: number;
      totalProgress: number;
      lastAccessed: string | null;
      lessonsCompleted: number;
      totalTimeSpent: number;
    }
  > = {};

  (enrollments || []).forEach(
    (e: {
      student_id: string;
      status: string;
      progress_pct: number;
      last_accessed_at: string | null;
    }) => {
      if (!studentMetrics[e.student_id]) {
        studentMetrics[e.student_id] = {
          enrolledCourses: 0,
          completedCourses: 0,
          totalProgress: 0,
          lastAccessed: null,
          lessonsCompleted: 0,
          totalTimeSpent: 0,
        };
      }
      const m = studentMetrics[e.student_id];
      m.enrolledCourses++;
      if (e.status === "completed") m.completedCourses++;
      m.totalProgress += e.progress_pct || 0;
      if (
        !m.lastAccessed ||
        (e.last_accessed_at && e.last_accessed_at > m.lastAccessed)
      ) {
        m.lastAccessed = e.last_accessed_at;
      }
    }
  );

  (lessonProgress || []).forEach(
    (lp: {
      student_id: string;
      status: string;
      time_spent_seconds: number;
    }) => {
      const m = studentMetrics[lp.student_id];
      if (!m) return;
      if (lp.status === "completed") m.lessonsCompleted++;
      m.totalTimeSpent += lp.time_spent_seconds || 0;
    }
  );

  return (
    students as {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    }[]
  ).map((s) => {
    const m = studentMetrics[s.id] || {
      enrolledCourses: 0,
      completedCourses: 0,
      totalProgress: 0,
      lastAccessed: null,
      lessonsCompleted: 0,
      totalTimeSpent: 0,
    };
    return {
      studentId: s.id,
      firstName: s.first_name,
      lastName: s.last_name,
      email: s.email,
      enrolledCourses: m.enrolledCourses,
      completedCourses: m.completedCourses,
      lessonsCompleted: m.lessonsCompleted,
      avgProgressPct:
        m.enrolledCourses > 0
          ? Math.round(m.totalProgress / m.enrolledCourses)
          : 0,
      lastAccessedAt: m.lastAccessed,
      totalTimeSpentSeconds: m.totalTimeSpent,
    };
  });
}

// ============================================================
// Course-Level Analytics Drill-Down
// ============================================================

export interface CourseAnalyticsDetail {
  course: {
    id: string;
    title: string;
    enrollmentCount: number;
    completedCount: number;
    avgProgress: number;
  };
  enrollmentTrend: EnrollmentTrendPoint[];
  moduleCompletion: {
    moduleId: string;
    moduleTitle: string;
    lessonCount: number;
    avgCompletion: number;
  }[];
  quizResults: {
    quizId: string;
    quizTitle: string;
    attemptCount: number;
    avgScore: number;
    passRate: number;
  }[];
  topStudents: {
    studentId: string;
    firstName: string | null;
    lastName: string | null;
    progressPct: number;
    lessonsCompleted: number;
    avgQuizScore: number | null;
  }[];
}

export async function getCourseAnalytics(
  courseId: string
): Promise<CourseAnalyticsDetail | null> {
  const supabase = await createServerClient();

  // Get course
  const { data: course, error: courseError } = await (supabase as any)
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .single();

  if (courseError || !course) return null;

  // Parallel queries
  const [
    enrollmentsRes,
    modulesRes,
    lessonsRes,
    lessonProgressRes,
    quizzesRes,
    quizAttemptsRes,
  ] = await Promise.all([
    (supabase as any)
      .from("course_enrollments")
      .select("student_id, status, progress_pct, enrolled_at, last_accessed_at")
      .eq("course_id", courseId)
      .in("status", ["active", "completed"]),
    (supabase as any)
      .from("modules")
      .select("id, title, sort_order")
      .eq("course_id", courseId)
      .order("sort_order"),
    (supabase as any)
      .from("lessons")
      .select("id, module_id")
      .eq("is_published", true),
    (supabase as any)
      .from("lesson_progress")
      .select("student_id, lesson_id, status, time_spent_seconds")
      .eq("course_id", courseId),
    (supabase as any)
      .from("quizzes")
      .select("id, title")
      .eq("course_id", courseId)
      .eq("is_published", true),
    (supabase as any)
      .from("quiz_attempts")
      .select("quiz_id, student_id, score_pct, passed, status"),
  ]);

  const enrollments = enrollmentsRes.data || [];
  const modules = modulesRes.data || [];
  const lessons = lessonsRes.data || [];
  const lessonProgress = lessonProgressRes.data || [];
  const quizzes = quizzesRes.data || [];
  const quizAttempts = quizAttemptsRes.data || [];

  // Course-level stats
  const enrollmentCount = enrollments.length;
  const completedCount = enrollments.filter(
    (e: { status: string }) => e.status === "completed"
  ).length;
  const avgProgress =
    enrollmentCount > 0
      ? Math.round(
          enrollments.reduce(
            (sum: number, e: { progress_pct: number }) =>
              sum + (e.progress_pct || 0),
            0
          ) / enrollmentCount
        )
      : 0;

  // Enrollment trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const enrollmentTrend: EnrollmentTrendPoint[] = [];
  const trendMap: Record<string, number> = {};

  for (let i = 0; i <= 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    trendMap[key] = 0;
  }

  enrollments.forEach((e: { enrolled_at: string }) => {
    const date = e.enrolled_at.split("T")[0];
    if (trendMap[date] !== undefined) trendMap[date]++;
  });

  for (const [date, count] of Object.entries(trendMap)) {
    enrollmentTrend.push({ date, count });
  }

  // Module completion
  const moduleIds = modules.map((m: { id: string }) => m.id);
  const lessonsByModule: Record<string, string[]> = {};
  lessons.forEach((l: { id: string; module_id: string }) => {
    if (moduleIds.includes(l.module_id)) {
      if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = [];
      lessonsByModule[l.module_id].push(l.id);
    }
  });

  const completedLessons = new Set(
    lessonProgress
      .filter((lp: { status: string }) => lp.status === "completed")
      .map((lp: { lesson_id: string }) => lp.lesson_id)
  );

  const moduleCompletion = modules.map(
    (m: { id: string; title: string }) => {
      const moduleLessons = lessonsByModule[m.id] || [];
      const completed = moduleLessons.filter((lId) =>
        completedLessons.has(lId)
      ).length;
      return {
        moduleId: m.id,
        moduleTitle: m.title,
        lessonCount: moduleLessons.length,
        avgCompletion:
          moduleLessons.length > 0 && enrollmentCount > 0
            ? Math.round((completed / (moduleLessons.length * enrollmentCount)) * 100)
            : 0,
      };
    }
  );

  // Quiz results
  const courseQuizIds = quizzes.map((q: { id: string }) => q.id);
  const quizResults = quizzes.map((q: { id: string; title: string }) => {
    const qAttempts = quizAttempts.filter(
      (a: { quiz_id: string; status: string }) =>
        a.quiz_id === q.id && a.status === "graded"
    );
    const scores = qAttempts
      .map((a: { score_pct: number | null }) => a.score_pct)
      .filter((s: number | null): s is number => s !== null);
    const passCount = qAttempts.filter(
      (a: { passed: boolean | null }) => a.passed
    ).length;

    return {
      quizId: q.id,
      quizTitle: q.title,
      attemptCount: qAttempts.length,
      avgScore:
        scores.length > 0
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
          : 0,
      passRate:
        qAttempts.length > 0
          ? Math.round((passCount / qAttempts.length) * 100)
          : 0,
    };
  });

  // Top students (by progress)
  const studentIds = enrollments.map((e: { student_id: string }) => e.student_id);
  let profileMap: Record<
    string,
    { first_name: string | null; last_name: string | null }
  > = {};

  if (studentIds.length > 0) {
    const { data: profiles } = await (supabase as any)
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", studentIds);

    (profiles || []).forEach(
      (p: { id: string; first_name: string | null; last_name: string | null }) => {
        profileMap[p.id] = { first_name: p.first_name, last_name: p.last_name };
      }
    );
  }

  // Student lesson counts + quiz scores
  const studentLessons: Record<string, number> = {};
  lessonProgress.forEach((lp: { student_id: string; status: string }) => {
    if (lp.status === "completed") {
      studentLessons[lp.student_id] = (studentLessons[lp.student_id] || 0) + 1;
    }
  });

  const studentQuizScores: Record<string, number[]> = {};
  quizAttempts
    .filter(
      (a: { quiz_id: string; status: string }) =>
        courseQuizIds.includes(a.quiz_id) && a.status === "graded"
    )
    .forEach((a: { student_id: string; score_pct: number | null }) => {
      if (a.score_pct !== null) {
        if (!studentQuizScores[a.student_id])
          studentQuizScores[a.student_id] = [];
        studentQuizScores[a.student_id].push(a.score_pct);
      }
    });

  const topStudents = enrollments
    .map(
      (e: { student_id: string; progress_pct: number }) => {
        const profile = profileMap[e.student_id] || {};
        const scores = studentQuizScores[e.student_id] || [];
        return {
          studentId: e.student_id,
          firstName: (profile as any).first_name || null,
          lastName: (profile as any).last_name || null,
          progressPct: e.progress_pct || 0,
          lessonsCompleted: studentLessons[e.student_id] || 0,
          avgQuizScore:
            scores.length > 0
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : null,
        };
      }
    )
    .sort(
      (a: { progressPct: number }, b: { progressPct: number }) =>
        b.progressPct - a.progressPct
    )
    .slice(0, 10);

  return {
    course: {
      id: course.id,
      title: course.title,
      enrollmentCount,
      completedCount,
      avgProgress,
    },
    enrollmentTrend,
    moduleCompletion,
    quizResults,
    topStudents,
  };
}

// ============================================================
// CSV Export Helpers
// ============================================================

export async function getAnalyticsExportData(
  type: "students" | "courses" | "quizzes" | "revenue"
): Promise<string> {
  switch (type) {
    case "students": {
      const data = await getStudentActivity();
      const headers = [
        "Name",
        "Email",
        "Enrolled Courses",
        "Completed Courses",
        "Lessons Completed",
        "Avg Progress %",
        "Total Time (hours)",
        "Last Accessed",
      ];
      const rows = data.map((s) => [
        `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        s.email || "",
        s.enrolledCourses,
        s.completedCourses,
        s.lessonsCompleted,
        s.avgProgressPct,
        (s.totalTimeSpentSeconds / 3600).toFixed(1),
        s.lastAccessedAt
          ? new Date(s.lastAccessedAt).toLocaleDateString()
          : "Never",
      ]);
      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }
    case "courses": {
      const data = await getCoursePerformance();
      const headers = [
        "Course",
        "Enrollments",
        "Completed",
        "Completion Rate %",
        "Avg Progress %",
        "Avg Quiz Score",
        "Published",
      ];
      const rows = data.map((c) => [
        `"${c.courseTitle}"`,
        c.enrollmentCount,
        c.completedCount,
        c.completionRate,
        c.avgProgressPct,
        c.avgQuizScore ?? "N/A",
        c.isPublished ? "Yes" : "No",
      ]);
      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }
    case "quizzes": {
      const data = await getQuizPerformance();
      const headers = [
        "Quiz",
        "Course",
        "Attempts",
        "Avg Score %",
        "Pass Rate %",
        "Avg Time (min)",
      ];
      const rows = data.map((q) => [
        `"${q.quizTitle}"`,
        `"${q.courseTitle}"`,
        q.attemptCount,
        q.avgScore,
        q.passRate,
        q.avgTimeSeconds ? (q.avgTimeSeconds / 60).toFixed(1) : "N/A",
      ]);
      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }
    case "revenue": {
      const data = await getRevenueByMonth(12);
      const headers = ["Period", "Revenue", "Transactions"];
      const rows = data.map((r) => [
        r.period,
        (r.totalCents / 100).toFixed(2),
        r.transactionCount,
      ]);
      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }
    default:
      return "";
  }
}
