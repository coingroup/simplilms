import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { MessageSquare } from "lucide-react";
import { getSentMessages, getStudentProfiles } from "@simplilms/core";
import { SentMessagesTable } from "@simplilms/core/components/messages/sent-messages-table";
import { RepMessagesClient } from "./client";

export const metadata = {
  title: "Messages -- Rep",
};

interface RepMessagesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function RepMessagesPage({
  searchParams,
}: RepMessagesPageProps) {
  await requireRole(["school_rep"]);

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
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send messages to students.
          </p>
        </div>
        <RepMessagesClient students={students} />
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
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No messages sent yet.</p>
            </div>
          ) : (
            <SentMessagesTable messages={messages} />
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/rep/messages?page=${page - 1}`}
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/rep/messages?page=${page + 1}`}
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
