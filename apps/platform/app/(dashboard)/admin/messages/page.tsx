import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { MessageSquare } from "lucide-react";
import { getSentMessages, getStudentProfiles } from "@simplilms/core";
import { SentMessagesTable } from "@simplilms/core/components/messages/sent-messages-table";
import { AdminMessagesClient } from "./client";

export const metadata = {
  title: "Messages",
};

interface AdminMessagesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminMessagesPage({
  searchParams,
}: AdminMessagesPageProps) {
  await requireRole(["super_admin"]);

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = 20;

  const [{ messages, totalCount }, students] = await Promise.all([
    getSentMessages({ page, pageSize }),
    getStudentProfiles(),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Send messages to students and view message history.
          </p>
        </div>
        <AdminMessagesClient students={students} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Sent Messages
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {totalCount} total
          </span>
        </CardHeader>
        <CardContent>
          <SentMessagesTable messages={messages} />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/messages?page=${page - 1}`}
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/messages?page=${page + 1}`}
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
