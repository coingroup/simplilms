import { requireRole } from "@simplilms/auth/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@simplilms/ui";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { getCourseById } from "@simplilms/core/actions/courses";
import { getDiscussionThreads } from "@simplilms/core/actions/discussions";
import { AdminDiscussionsClient } from "./admin-discussions-client";

interface Props {
  params: Promise<{ courseId: string }>;
}

export const metadata = {
  title: "Discussions — Admin",
};

export default async function AdminCourseDiscussionsPage({ params }: Props) {
  await requireRole(["super_admin"]);
  const { courseId } = await params;

  const course = await getCourseById(courseId);
  if (!course) notFound();

  const threads = await getDiscussionThreads(courseId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Discussions — {course.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Moderate and manage course discussions. {threads.length}{" "}
            {threads.length === 1 ? "thread" : "threads"} total.
          </p>
        </div>
      </div>

      {threads.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No discussions yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Students haven&apos;t started any discussions for this course.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-700">
              All Threads
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AdminDiscussionsClient threads={threads} courseId={courseId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
