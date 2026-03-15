import { requireRole } from "@simplilms/auth/server";
import { getLessonById, updateLesson } from "@simplilms/core/actions/courses";
import { notFound } from "next/navigation";
import { LessonEditorClient } from "./editor";

export const metadata = {
  title: "Edit Lesson -- Admin",
};

interface LessonEditorPageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonEditorPage({
  params,
}: LessonEditorPageProps) {
  await requireRole(["super_admin"]);
  const { courseId, lessonId } = await params;

  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    notFound();
  }

  const boundUpdateLesson = async (data: {
    title?: string;
    description?: string;
    content_type?: string;
    content?: Record<string, unknown>;
    duration_minutes?: number | null;
    is_required?: boolean;
  }) => {
    "use server";
    return updateLesson(lessonId, courseId, data);
  };

  return (
    <LessonEditorClient
      lesson={lesson}
      courseId={courseId}
      updateAction={boundUpdateLesson}
    />
  );
}
