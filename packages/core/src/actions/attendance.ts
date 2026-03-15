"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";

/**
 * Mark attendance for a single student in a class session.
 * Only teachers (paid/unpaid) and super_admin can mark attendance.
 */
export async function markAttendance(data: {
  classId: string;
  studentId: string;
  sessionDate: string;
  status: "present" | "absent" | "late" | "excused";
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!["super_admin", "teacher_paid", "teacher_unpaid"].includes(user.role)) {
      return { success: false, error: "Insufficient permissions" };
    }

    const tenantId = getTenantId();
    const supabase = await createServerClient();

    // Check if attendance record already exists for this student/class/date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("attendance")
      .select("id")
      .eq("class_id", data.classId)
      .eq("student_id", data.studentId)
      .eq("session_date", data.sessionDate)
      .maybeSingle();

    if (existing) {
      // Update existing record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("attendance")
        .update({
          status: data.status,
          marked_by: user.user.id,
          marked_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating attendance:", error);
        return { success: false, error: error.message };
      }
    } else {
      // Insert new record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("attendance")
        .insert({
          tenant_id: tenantId,
          class_id: data.classId,
          student_id: data.studentId,
          session_date: data.sessionDate,
          status: data.status,
          marked_by: user.user.id,
          marked_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error inserting attendance:", error);
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/teacher/attendance");
    revalidatePath(`/teacher/classes/${data.classId}`);
    return { success: true };
  } catch (err) {
    console.error("markAttendance error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Mark attendance for multiple students in a class session at once.
 * Used by the bulk attendance form.
 */
export async function markBulkAttendance(data: {
  classId: string;
  sessionDate: string;
  records: { studentId: string; status: "present" | "absent" | "late" | "excused" }[];
}): Promise<{ success: boolean; error?: string; updatedCount?: number }> {
  try {
    const { user, error: authError } = await getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!["super_admin", "teacher_paid", "teacher_unpaid"].includes(user.role)) {
      return { success: false, error: "Insufficient permissions" };
    }

    if (!data.records || data.records.length === 0) {
      return { success: false, error: "No attendance records provided" };
    }

    const tenantId = getTenantId();
    const supabase = await createServerClient();

    // Get existing attendance records for this class/date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingRecords } = await (supabase as any)
      .from("attendance")
      .select("id, student_id")
      .eq("class_id", data.classId)
      .eq("session_date", data.sessionDate);

    const existingMap = Object.fromEntries(
      (existingRecords || []).map((r: { id: string; student_id: string }) => [r.student_id, r.id])
    );

    const toInsert: Record<string, unknown>[] = [];
    const toUpdate: { id: string; status: string }[] = [];

    for (const record of data.records) {
      if (existingMap[record.studentId]) {
        toUpdate.push({
          id: existingMap[record.studentId],
          status: record.status,
        });
      } else {
        toInsert.push({
          tenant_id: tenantId,
          class_id: data.classId,
          student_id: record.studentId,
          session_date: data.sessionDate,
          status: record.status,
          marked_by: user.user.id,
          marked_at: new Date().toISOString(),
        });
      }
    }

    // Batch insert new records
    if (toInsert.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from("attendance")
        .insert(toInsert);

      if (insertError) {
        console.error("Error inserting bulk attendance:", insertError);
        return { success: false, error: insertError.message };
      }
    }

    // Update existing records one by one (Supabase doesn't support batch update with different values)
    for (const record of toUpdate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from("attendance")
        .update({
          status: record.status,
          marked_by: user.user.id,
          marked_at: new Date().toISOString(),
        })
        .eq("id", record.id);

      if (updateError) {
        console.error("Error updating attendance record:", updateError);
        // Continue updating others even if one fails
      }
    }

    revalidatePath("/teacher/attendance");
    revalidatePath(`/teacher/classes/${data.classId}`);
    return { success: true, updatedCount: data.records.length };
  } catch (err) {
    console.error("markBulkAttendance error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
