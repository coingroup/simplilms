"use server";

import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";
import {
  BADGE_CATALOG,
  POINT_VALUES,
  type PointAction,
  type BadgeDefinition,
} from "../lib/gamification-config";

// Re-export types for consumers
export type { PointAction, BadgeDefinition };

// ============================================================
// Types
// ============================================================

export interface StudentPointsRow {
  id: string;
  tenant_id: string;
  student_id: string;
  points: number;
  action: PointAction;
  reference_id: string | null;
  earned_at: string;
}

export interface StudentStreakRow {
  id: string;
  tenant_id: string;
  student_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_start_date: string | null;
  updated_at: string;
}

export interface StudentBadgeRow {
  id: string;
  tenant_id: string;
  student_id: string;
  badge_key: string;
  badge_name: string;
  badge_description: string | null;
  earned_at: string;
}

export interface LeaderboardEntry {
  student_id: string;
  name: string;
  total_points: number;
  badge_count: number;
  rank: number;
}

export interface GamificationSummary {
  total_points: number;
  current_streak: number;
  longest_streak: number;
  badge_count: number;
  rank: number | null;
  recent_points: StudentPointsRow[];
}

// ============================================================
// Internal helper: award points
// ============================================================

export async function awardPoints(
  studentId: string,
  action: PointAction,
  referenceId?: string,
  pointsOverride?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const tenantId = getTenantId();
    const points = pointsOverride ?? POINT_VALUES[action];

    const { error } = await (supabase as any)
      .from("student_points")
      .insert({
        tenant_id: tenantId,
        student_id: studentId,
        points,
        action,
        reference_id: referenceId ?? null,
      });

    if (error) {
      console.error("awardPoints error:", error);
      return { success: false, error: "Failed to award points" };
    }

    return { success: true };
  } catch (err) {
    console.error("awardPoints error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================
// Queries
// ============================================================

export async function getStudentPoints(studentId?: string): Promise<{
  total: number;
  recent: StudentPointsRow[];
}> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return { total: 0, recent: [] };

    const targetId = studentId ?? user.user.id;
    const supabase = await createServerClient();

    const { data, error } = await (supabase as any)
      .from("student_points")
      .select("*")
      .eq("student_id", targetId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("getStudentPoints error:", error);
      return { total: 0, recent: [] };
    }

    const rows = (data || []) as StudentPointsRow[];
    const total = rows.reduce((sum, r) => sum + r.points, 0);
    return { total, recent: rows.slice(0, 20) };
  } catch (err) {
    console.error("getStudentPoints error:", err);
    return { total: 0, recent: [] };
  }
}

export async function getStudentStreak(
  studentId?: string
): Promise<StudentStreakRow | null> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return null;

    const targetId = studentId ?? user.user.id;
    const supabase = await createServerClient();

    const { data, error } = await (supabase as any)
      .from("student_streaks")
      .select("*")
      .eq("student_id", targetId)
      .maybeSingle();

    if (error) {
      console.error("getStudentStreak error:", error);
      return null;
    }

    return (data as StudentStreakRow) ?? null;
  } catch (err) {
    console.error("getStudentStreak error:", err);
    return null;
  }
}

export async function getStudentBadges(
  studentId?: string
): Promise<StudentBadgeRow[]> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) return [];

    const targetId = studentId ?? user.user.id;
    const supabase = await createServerClient();

    const { data, error } = await (supabase as any)
      .from("student_badges")
      .select("*")
      .eq("student_id", targetId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("getStudentBadges error:", error);
      return [];
    }

    return (data || []) as StudentBadgeRow[];
  } catch (err) {
    console.error("getStudentBadges error:", err);
    return [];
  }
}

export async function getLeaderboard(
  limit = 20
): Promise<LeaderboardEntry[]> {
  try {
    const supabase = await createServerClient();
    const tenantId = getTenantId();

    // Sum points per student
    const { data: pointsData, error: pointsError } = await (supabase as any)
      .from("student_points")
      .select("student_id, points")
      .eq("tenant_id", tenantId);

    if (pointsError) {
      console.error("getLeaderboard points error:", pointsError);
      return [];
    }

    // Aggregate total points per student
    const totals: Record<string, number> = {};
    for (const row of (pointsData || []) as { student_id: string; points: number }[]) {
      totals[row.student_id] = (totals[row.student_id] ?? 0) + row.points;
    }

    // Sort and take top N
    const sorted = Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    if (sorted.length === 0) return [];

    const studentIds = sorted.map(([id]) => id);

    // Fetch profiles
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", studentIds);

    if (profilesError) {
      console.error("getLeaderboard profiles error:", profilesError);
      return [];
    }

    const profileMap: Record<
      string,
      { first_name: string | null; last_name: string | null }
    > = {};
    for (const p of (profiles || []) as {
      id: string;
      first_name: string | null;
      last_name: string | null;
    }[]) {
      profileMap[p.id] = p;
    }

    // Fetch badge counts
    const { data: badgesData, error: badgesError } = await (supabase as any)
      .from("student_badges")
      .select("student_id")
      .eq("tenant_id", tenantId)
      .in("student_id", studentIds);

    const badgeCounts: Record<string, number> = {};
    if (!badgesError) {
      for (const b of (badgesData || []) as { student_id: string }[]) {
        badgeCounts[b.student_id] = (badgeCounts[b.student_id] ?? 0) + 1;
      }
    }

    return sorted.map(([studentId, total], index) => {
      const profile = profileMap[studentId];
      const firstName = profile?.first_name ?? "";
      const lastName = profile?.last_name ?? "";
      const name =
        `${firstName} ${lastName}`.trim() || "Unknown Student";
      return {
        student_id: studentId,
        name,
        total_points: total,
        badge_count: badgeCounts[studentId] ?? 0,
        rank: index + 1,
      };
    });
  } catch (err) {
    console.error("getLeaderboard error:", err);
    return [];
  }
}

export async function getStudentGamificationSummary(): Promise<GamificationSummary> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return {
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        badge_count: 0,
        rank: null,
        recent_points: [],
      };
    }

    const studentId = user.user.id;

    const [pointsResult, streak, badges, leaderboard] = await Promise.all([
      getStudentPoints(studentId),
      getStudentStreak(studentId),
      getStudentBadges(studentId),
      getLeaderboard(10),
    ]);

    const myRankEntry = leaderboard.find((e) => e.student_id === studentId);
    const rank = myRankEntry?.rank ?? null;

    return {
      total_points: pointsResult.total,
      current_streak: streak?.current_streak ?? 0,
      longest_streak: streak?.longest_streak ?? 0,
      badge_count: badges.length,
      rank,
      recent_points: pointsResult.recent,
    };
  } catch (err) {
    console.error("getStudentGamificationSummary error:", err);
    return {
      total_points: 0,
      current_streak: 0,
      longest_streak: 0,
      badge_count: 0,
      rank: null,
      recent_points: [],
    };
  }
}

// ============================================================
// Mutations — Streak tracking
// ============================================================

export async function updateStreak(
  studentId: string
): Promise<{ success: boolean; streakBroken?: boolean; newStreak?: number }> {
  try {
    const supabase = await createServerClient();
    const tenantId = getTenantId();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Fetch existing streak record
    const { data: existing } = await (supabase as any)
      .from("student_streaks")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("student_id", studentId)
      .maybeSingle();

    let newStreak = 1;
    let longestStreak = 1;
    let streakStartDate = today;
    let streakBroken = false;

    if (existing) {
      longestStreak = existing.longest_streak;
      const lastDate = existing.last_activity_date;

      if (lastDate === today) {
        // Already logged activity today — no change
        return { success: true, streakBroken: false, newStreak: existing.current_streak };
      }

      const lastDateObj = lastDate ? new Date(lastDate) : null;
      const todayObj = new Date(today);

      if (lastDateObj) {
        const diffDays = Math.round(
          (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          // Consecutive day — extend streak
          newStreak = existing.current_streak + 1;
          streakStartDate = existing.streak_start_date ?? today;
        } else {
          // Streak broken
          newStreak = 1;
          streakStartDate = today;
          streakBroken = true;
        }
      }

      longestStreak = Math.max(longestStreak, newStreak);

      const { error } = await (supabase as any)
        .from("student_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
          streak_start_date: streakStartDate,
        })
        .eq("id", existing.id);

      if (error) {
        console.error("updateStreak update error:", error);
        return { success: false };
      }
    } else {
      // First-ever activity
      const { error } = await (supabase as any)
        .from("student_streaks")
        .insert({
          tenant_id: tenantId,
          student_id: studentId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          streak_start_date: today,
        });

      if (error) {
        console.error("updateStreak insert error:", error);
        return { success: false };
      }
    }

    // Award streak bonuses
    if (newStreak === 7) {
      await awardPoints(studentId, "streak_7");
    }
    if (newStreak === 30) {
      await awardPoints(studentId, "streak_30");
    }

    return { success: true, streakBroken, newStreak };
  } catch (err) {
    console.error("updateStreak error:", err);
    return { success: false };
  }
}

// ============================================================
// Mutations — Badge checking & awarding
// ============================================================

async function awardBadge(
  studentId: string,
  badgeDef: BadgeDefinition
): Promise<void> {
  const supabase = await createServerClient();
  const tenantId = getTenantId();

  // Upsert — UNIQUE constraint prevents duplicates
  await (supabase as any)
    .from("student_badges")
    .upsert(
      {
        tenant_id: tenantId,
        student_id: studentId,
        badge_key: badgeDef.key,
        badge_name: badgeDef.name,
        badge_description: badgeDef.description,
      },
      { onConflict: "tenant_id,student_id,badge_key", ignoreDuplicates: true }
    );
}

export async function checkAndAwardBadges(
  studentId: string
): Promise<string[]> {
  const newBadges: string[] = [];

  try {
    const supabase = await createServerClient();
    const tenantId = getTenantId();

    // Fetch existing badges to avoid re-awarding
    const { data: existingBadges } = await (supabase as any)
      .from("student_badges")
      .select("badge_key")
      .eq("tenant_id", tenantId)
      .eq("student_id", studentId);

    const earned = new Set(
      ((existingBadges || []) as { badge_key: string }[]).map(
        (b) => b.badge_key
      )
    );

    // Fetch points history once
    const { data: pointsData } = await (supabase as any)
      .from("student_points")
      .select("action, reference_id")
      .eq("tenant_id", tenantId)
      .eq("student_id", studentId);

    const allPoints = (pointsData || []) as {
      action: PointAction;
      reference_id: string | null;
    }[];

    // first_steps — at least one lesson_complete event
    if (
      !earned.has("first_steps") &&
      allPoints.some((p) => p.action === "lesson_complete")
    ) {
      const def = BADGE_CATALOG.find((b) => b.key === "first_steps")!;
      await awardBadge(studentId, def);
      newBadges.push(def.key);
    }

    // quiz_whiz — passed 5 or more quizzes
    if (!earned.has("quiz_whiz")) {
      const passCount = allPoints.filter(
        (p) => p.action === "quiz_pass" || p.action === "quiz_perfect"
      ).length;
      if (passCount >= 5) {
        const def = BADGE_CATALOG.find((b) => b.key === "quiz_whiz")!;
        await awardBadge(studentId, def);
        newBadges.push(def.key);
      }
    }

    // perfect_score — any quiz_perfect event
    if (
      !earned.has("perfect_score") &&
      allPoints.some((p) => p.action === "quiz_perfect")
    ) {
      const def = BADGE_CATALOG.find((b) => b.key === "perfect_score")!;
      await awardBadge(studentId, def);
      newBadges.push(def.key);
    }

    // course_champion — any course_complete event
    if (
      !earned.has("course_champion") &&
      allPoints.some((p) => p.action === "course_complete")
    ) {
      const def = BADGE_CATALOG.find((b) => b.key === "course_champion")!;
      await awardBadge(studentId, def);
      newBadges.push(def.key);
    }

    // discussion_starter — any first_post event
    if (
      !earned.has("discussion_starter") &&
      allPoints.some((p) => p.action === "first_post")
    ) {
      const def = BADGE_CATALOG.find((b) => b.key === "discussion_starter")!;
      await awardBadge(studentId, def);
      newBadges.push(def.key);
    }

    // week_warrior / month_master — check via streaks table
    const { data: streakData } = await (supabase as any)
      .from("student_streaks")
      .select("longest_streak")
      .eq("tenant_id", tenantId)
      .eq("student_id", studentId)
      .maybeSingle();

    const longestStreak = (streakData as { longest_streak: number } | null)
      ?.longest_streak ?? 0;

    if (!earned.has("week_warrior") && longestStreak >= 7) {
      const def = BADGE_CATALOG.find((b) => b.key === "week_warrior")!;
      await awardBadge(studentId, def);
      newBadges.push(def.key);
    }

    if (!earned.has("month_master") && longestStreak >= 30) {
      const def = BADGE_CATALOG.find((b) => b.key === "month_master")!;
      await awardBadge(studentId, def);
      newBadges.push(def.key);
    }

    // top_10 — check leaderboard rank
    if (!earned.has("top_10")) {
      const leaderboard = await getLeaderboard(10);
      const inTop10 = leaderboard.some((e) => e.student_id === studentId);
      if (inTop10) {
        const def = BADGE_CATALOG.find((b) => b.key === "top_10")!;
        await awardBadge(studentId, def);
        newBadges.push(def.key);
      }
    }

    return newBadges;
  } catch (err) {
    console.error("checkAndAwardBadges error:", err);
    return [];
  }
}
