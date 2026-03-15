import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { MessageSquare } from "lucide-react";
import { getMessagesByUserId, getUnreadMessageCount } from "@simplilms/core";
import { MessageList } from "@simplilms/core/components/messages/message-list";

export const metadata = {
  title: "Messages",
};

export default async function StudentMessagesPage() {
  const user = await requireRole(["super_admin", "student"]);

  const [messages, unreadCount] = await Promise.all([
    getMessagesByUserId(user.user.id),
    getUnreadMessageCount(user.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          View messages from your institution.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Inbox
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        </CardHeader>
        <CardContent>
          <MessageList messages={messages} unreadCount={unreadCount} />
        </CardContent>
      </Card>
    </div>
  );
}
