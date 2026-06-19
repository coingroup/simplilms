import { requireRole } from "@simplilms/auth/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { MessageSquare, Plus } from "lucide-react";
import { getStudentCourseEnrollments } from "@simplilms/core/actions/progress";
import { getCourseById } from "@simplilms/core/actions/courses";
import { getDiscussionThreads } from "@simplilms/core/actions/discussions";
import { ThreadList } from "@simplilms/core/components/discussions/thread-list";

interface Props {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  return {
    title: course ? `Discussions — ${course.title}` : "Discussions",
  };
}

export default async function CourseDiscussPage({ params }: Props) {
  const user = await requireRole(["super_admin", "student", "teacher_paid", "teacher_unpaid"]);
  const { courseId } = await params;

  // Verify enrollment (students must be enrolled; admins/teachers skip this check)
  if (user.role === "student") {
    const enrollments = await getStudentCourseEnrollments(user.user.id);
    const enrollment = enrollments.find((e) => e.course_id === courseId);
    if (!enrollment) {
      redirect("/student/courses");
    }
  }

  const course = await getCourseById(courseId);
  if (!course) {
    notFound();
  }

  const threads = await getDiscussionThreads(courseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Discussions
          </h1>
          <p className="text-sm text-gray-500 mt-1">{course.title}</p>
        </div>
        <Link href={`/student/courses/${courseId}/discuss/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Discussion
          </Button>
        </Link>
      </div>

      {/* Thread list */}
      <Card>
        <CardContent className="pt-2 pb-4 px-4">
          <ThreadList threads={threads} courseId={courseId} />
        </CardContent>
      </Card>
    </div>
  );
}
