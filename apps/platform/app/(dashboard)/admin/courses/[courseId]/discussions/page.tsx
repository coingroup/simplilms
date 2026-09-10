import { requireRole } from "@simplilms/auth/server";
import { notFound } from "next/navigation";
import { getCourseById } from "@simplilms/core/actions/courses";
import { getThreadsByCourse, createThread } from "@simplilms/core/actions/forums";
import { ThreadList } from "@simplilms/core/components/forums/thread-list";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export const metadata = { title: "Course Discussions — Admin" };

export default async function AdminDiscussionsPage({ params }: PageProps) {
  await requireRole(["super_admin"]);
  const { courseId } = await params;

  const course = await getCourseById(courseId);
  if (!course) notFound();

  const threads = await getThreadsByCourse(courseId);

  const boundCreateThread = async (data: { title: string; body: string }) => {
    "use server";
    return createThread(courseId, data);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/courses/${courseId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage Discussions
        </p>
      </div>

      <ThreadList
        threads={threads}
        courseId={courseId}
        basePath={`/admin/courses/${courseId}`}
        canModerate={true}
        onCreateThread={boundCreateThread}
      />
    </div>
  );
}
