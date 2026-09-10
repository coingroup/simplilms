"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";
import { BADGE_DEFINITIONS, POINTS } from "../lib/gamification-constants";

// ============================================================
// Types
// ============================================================

export interface PointEntry {
  id: string;
  tenant_id: string;
  student_id: string;
  points: number;
  reason: string;
  source_type: string;
  source_id: string | null;
  created_at: string;
}

export interface StudentStreak {
  id: string;
  tenant_id: string;
  student_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_active_days: number;
  created_at: string;
  updated_at: string;
}

export interface StudentBadge {
  id: string;
  tenant_id: string;
  student_id: string;
  badge_key: string;
  badge_name: string;
  badge_description: string | null;
  badge_icon: string;
  earned_at: string;
  created_at: string;
}

export interface LeaderboardEntry {
  student_id: string;
  student_name: string;
  total_points: number;
  badge_count: number;
  current_streak: number;
}

// ============================================================
// Queries
// ============================================================

export async function getStudentTotalPoints(
  studentId: string
): Promise<number> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("student_points")
    .select("points")
    .eq("student_id", studentId);

  if (error) {
    console.error("Error fetching student points:", error);
    return 0;
  }
  return (data || []).reduce(
    (sum: number, row: { points: number }) => sum + row.points,
    0
  );
}

export async function getStudentPointHistory(
  studentId: string,
  limit: number = 20
): Promise<PointEntry[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("student_points")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching point history:", error);
    return [];
  }
  return (data || []) as PointEntry[];
}

export async function getStudentStreak(
  studentId: string
): Promise<StudentStreak | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("student_streaks")
    .select("*")
    .eq("student_id", studentId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching student streak:", error);
  }
  return (data as StudentStreak) || null;
}

export async function getStudentBadges(
  studentId: string
): Promise<StudentBadge[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("student_badges")
    .select("*")
    .eq("student_id", studentId)
    .order("earned_at", { ascending: false });

  if (error) {
    console.error("Error fetching student badges:", error);
    return [];
  }
  return (data || []) as StudentBadge[];
}

export async function getLeaderboard(
  courseId?: string,
  limit: number = 20
): Promise<LeaderboardEntry[]> {
  const supabase = await createServerClient();
  const tenantId = getTenantId();

  // Get students with their total points
  let studentQuery = (supabase as any)
    .from("student_points")
    .select("student_id, points");

  if (courseId) {
    // Filter to students enrolled in this course
    const { data: enrollments } = await (supabase as any)
      .from("course_enrollments")
      .select("student_id")
      .eq("course_id", courseId)
      .eq("status", "active");

    const studentIds = (enrollments || []).map(
      (e: { student_id: string }) => e.student_id
    );
    if (studentIds.length === 0) return [];
    studentQuery = studentQuery.in("student_id", studentIds);
  }

  const { data: pointRows, error: pointError } = await studentQuery;
  if (pointError) {
    console.error("Error fetching leaderboard points:", pointError);
    return [];
  }

  // Aggregate points per student
  const pointsByStudent: Record<string, number> = {};
  for (const row of pointRows || []) {
    pointsByStudent[row.student_id] =
      (pointsByStudent[row.student_id] || 0) + row.points;
  }

  const studentIds = Object.keys(pointsByStudent);
  if (studentIds.length === 0) return [];

  // Get profiles
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", studentIds);

  // Get badge counts
  const { data: badgeRows } = await (supabase as any)
    .from("student_badges")
    .select("student_id")
    .in("student_id", studentIds);

  const badgeCounts: Record<string, number> = {};
  for (const row of badgeRows || []) {
    badgeCounts[row.student_id] = (badgeCounts[row.student_id] || 0) + 1;
  }

  // Get streaks
  const { data: streakRows } = await (supabase as any)
    .from("student_streaks")
    .select("student_id, current_streak")
    .in("student_id", studentIds);

  const streaks: Record<string, number> = {};
  for (const row of streakRows || []) {
    streaks[row.student_id] = row.current_streak;
  }

  const profileMap: Record<string, string> = {};
  for (const p of profiles || []) {
    profileMap[p.id] =
      `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Student";
  }

  const leaderboard: LeaderboardEntry[] = studentIds.map((id) => ({
    student_id: id,
    student_name: profileMap[id] || "Student",
    total_points: pointsByStudent[id] || 0,
    badge_count: badgeCounts[id] || 0,
    current_streak: streaks[id] || 0,
  }));

  leaderboard.sort((a, b) => b.total_points - a.total_points);
  return leaderboard.slice(0, limit);
}

// ============================================================
// Mutations — Points & Streaks
// ============================================================

export async function awardPoints(
  studentId: string,
  sourceType: string,
  reason: string,
  sourceId?: string
): Promise<{ success: boolean; points: number; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, points: 0, error: "Unauthorized" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();

    if (!(sourceType in POINTS)) {
      return { success: false, points: 0, error: "Invalid source type" };
    }
    const pointValue = POINTS[sourceType as keyof typeof POINTS];

    const { error } = await (supabase as any)
      .from("student_points")
      .insert({
        tenant_id: tenantId,
        student_id: studentId,
        points: pointValue,
        reason,
        source_type: sourceType,
        source_id: sourceId || null,
      });

    if (error) {
      console.error("Error awarding points:", error);
      return { success: false, points: 0, error: "Failed to award points" };
    }

    // Check for point milestones and award badges
    await checkPointMilestones(studentId, tenantId);

    revalidatePath("/student");
    revalidatePath("/student/courses");
    return { success: true, points: pointValue };
  } catch (err) {
    console.error("awardPoints error:", err);
    return { success: false, points: 0, error: "An unexpected error occurred" };
  }
}

export async function recordActivity(
  studentId: string
): Promise<{ success: boolean; streak?: number; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { success: false, error: "Unauthorized" };

    const supabase = await createServerClient();
    const tenantId = getTenantId();
    const today = new Date().toISOString().split("T")[0];

    // Get or create streak record
    const { data: existing } = await (supabase as any)
      .from("student_streaks")
      .select("*")
      .eq("student_id", studentId)
      .eq("tenant_id", tenantId)
      .single();

    if (!existing) {
      // Create new streak
      const { error } = await (supabase as any)
        .from("student_streaks")
        .insert({
          tenant_id: tenantId,
          student_id: studentId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          total_active_days: 1,
        });

      if (error) {
        console.error("Error creating streak:", error);
        return { success: false, error: "Failed to record activity" };
      }
      return { success: true, streak: 1 };
    }

    // Already active today
    if (existing.last_activity_date === today) {
      return { success: true, streak: existing.current_streak };
    }

    // Calculate streak
    const lastDate = new Date(existing.last_activity_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak: number;
    if (diffDays === 1) {
      // Consecutive day
      newStreak = existing.current_streak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, existing.longest_streak);

    const { error } = await (supabase as any)
      .from("student_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        total_active_days: existing.total_active_days + 1,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating streak:", error);
      return { success: false, error: "Failed to update streak" };
    }

    // Check streak milestones
    if (newStreak === 7 || newStreak === 30) {
      const bonusType =
        newStreak === 7 ? "streak_bonus_7" : "streak_bonus_30";
      const bonusPoints = POINTS[bonusType as keyof typeof POINTS];
      await (supabase as any).from("student_points").insert({
        tenant_id: tenantId,
        student_id: studentId,
        points: bonusPoints,
        reason: `${newStreak}-day streak bonus!`,
        source_type: "streak_bonus",
      });

      const badgeKey = newStreak === 7 ? "streak_7" : "streak_30";
      const badge = BADGE_DEFINITIONS[badgeKey];
      await awardBadge(studentId, tenantId, badgeKey, badge.name, badge.description, badge.icon);
    }

    revalidatePath("/student");
    return { success: true, streak: newStreak };
  } catch (err) {
    console.error("recordActivity error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Badge Helpers
// ============================================================

async function awardBadge(
  studentId: string,
  tenantId: string,
  badgeKey: string,
  badgeName: string,
  badgeDescription: string,
  badgeIcon: string
): Promise<boolean> {
  const supabase = await createServerClient();

  const { error } = await (supabase as any)
    .from("student_badges")
    .upsert(
      {
        tenant_id: tenantId,
        student_id: studentId,
        badge_key: badgeKey,
        badge_name: badgeName,
        badge_description: badgeDescription,
        badge_icon: badgeIcon,
      },
      { onConflict: "tenant_id,student_id,badge_key" }
    );

  if (error) {
    console.error("Error awarding badge:", error);
    return false;
  }
  return true;
}

async function checkPointMilestones(
  studentId: string,
  tenantId: string
): Promise<void> {
  const totalPoints = await getStudentTotalPoints(studentId);

  const milestones = [
    { threshold: 100, key: "hundred_points" },
    { threshold: 500, key: "five_hundred_points" },
    { threshold: 1000, key: "thousand_points" },
  ];

  for (const milestone of milestones) {
    if (totalPoints >= milestone.threshold) {
      const badge = BADGE_DEFINITIONS[milestone.key];
      await awardBadge(
        studentId,
        tenantId,
        milestone.key,
        badge.name,
        badge.description,
        badge.icon
      );
    }
  }
}

export async function checkAndAwardActivityBadges(
  studentId: string,
  activityType: "lesson" | "quiz" | "course" | "forum"
): Promise<void> {
  const supabase = await createServerClient();
  const tenantId = getTenantId();

  if (activityType === "lesson") {
    const { count } = await (supabase as any)
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("status", "completed");

    const lessonCount = count || 0;
    const milestones = [
      { threshold: 1, key: "first_lesson" },
      { threshold: 5, key: "five_lessons" },
      { threshold: 20, key: "twenty_lessons" },
      { threshold: 50, key: "fifty_lessons" },
    ];

    for (const m of milestones) {
      if (lessonCount >= m.threshold) {
        const badge = BADGE_DEFINITIONS[m.key];
        await awardBadge(studentId, tenantId, m.key, badge.name, badge.description, badge.icon);
      }
    }
  }

  if (activityType === "quiz") {
    const { count } = await (supabase as any)
      .from("quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("passed", true);

    if ((count || 0) >= 1) {
      const badge = BADGE_DEFINITIONS.first_quiz;
      await awardBadge(studentId, tenantId, "first_quiz", badge.name, badge.description, badge.icon);
    }

    // Check for perfect scores
    const { count: perfectCount } = await (supabase as any)
      .from("quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("score_pct", 100);

    if ((perfectCount || 0) >= 1) {
      const badge = BADGE_DEFINITIONS.perfect_quiz;
      await awardBadge(studentId, tenantId, "perfect_quiz", badge.name, badge.description, badge.icon);
    }
  }

  if (activityType === "course") {
    const { count } = await (supabase as any)
      .from("course_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("status", "completed");

    const courseCount = count || 0;
    const milestones = [
      { threshold: 1, key: "first_course" },
      { threshold: 3, key: "three_courses" },
    ];

    for (const m of milestones) {
      if (courseCount >= m.threshold) {
        const badge = BADGE_DEFINITIONS[m.key];
        await awardBadge(studentId, tenantId, m.key, badge.name, badge.description, badge.icon);
      }
    }
  }

  if (activityType === "forum") {
    const { count: threadCount } = await (supabase as any)
      .from("discussion_threads")
      .select("id", { count: "exact", head: true })
      .eq("author_id", studentId);

    const { count: postCount } = await (supabase as any)
      .from("discussion_posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", studentId);

    const totalPosts = (threadCount || 0) + (postCount || 0);
    const milestones = [
      { threshold: 1, key: "first_post" },
      { threshold: 10, key: "ten_posts" },
    ];

    for (const m of milestones) {
      if (totalPosts >= m.threshold) {
        const badge = BADGE_DEFINITIONS[m.key];
        await awardBadge(studentId, tenantId, m.key, badge.name, badge.description, badge.icon);
      }
    }
  }
}
