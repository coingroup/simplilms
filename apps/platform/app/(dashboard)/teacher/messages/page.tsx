import { requireRole } from "@simplilms/auth/server";
import {
  getMessagesByUserId,
  getUnreadMessageCount,
  getInstructorStudents,
} from "@simplilms/core";
import { MessageList } from "@simplilms/core/components/messages/message-list";
import { TeacherMessagesClient } from "./client";

export const metadata = {
  title: "Messages",
};

export default async function TeacherMessagesPage() {
  const user = await requireRole([
    "super_admin",
    "teacher_paid",
    "teacher_unpaid",
  ]);

  const [messages, unreadCount, students] = await Promise.all([
    getMessagesByUserId(user.user.id),
    getUnreadMessageCount(user.user.id),
    getInstructorStudents(user.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}.`
              : "View and send messages to your students."}
          </p>
        </div>
        <TeacherMessagesClient students={students} />
      </div>

      <MessageList messages={messages} unreadCount={unreadCount} />
    </div>
  );
}
