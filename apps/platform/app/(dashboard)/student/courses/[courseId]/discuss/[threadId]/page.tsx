import { requireRole } from "@simplilms/auth/server";
import { notFound, redirect } from "next/navigation";
import { getStudentCourseEnrollments } from "@simplilms/core/actions/progress";
import { getDiscussionThread } from "@simplilms/core/actions/discussions";
import { ThreadDetail } from "@simplilms/core/components/discussions/thread-detail";

interface Props {
  params: Promise<{ courseId: string; threadId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { threadId } = await params;
  const thread = await getDiscussionThread(threadId);
  return {
    title: thread ? thread.title : "Discussion",
  };
}

export default async function CourseThreadPage({ params }: Props) {
  const user = await requireRole(["super_admin", "student", "teacher_paid", "teacher_unpaid"]);
  const { courseId, threadId } = await params;

  // Verify enrollment for students
  if (user.role === "student") {
    const enrollments = await getStudentCourseEnrollments(user.user.id);
    const enrollment = enrollments.find((e) => e.course_id === courseId);
    if (!enrollment) {
      redirect("/student/courses");
    }
  }

  const thread = await getDiscussionThread(threadId);
  if (!thread || thread.course_id !== courseId) {
    notFound();
  }

  return (
    <ThreadDetail
      thread={thread}
      currentUserId={user.user.id}
      currentUserRole={user.role}
      courseId={courseId}
    />
  );
}
