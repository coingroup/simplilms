import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "@simplilms/ui";
import { MessageTypeBadge } from "./message-type-badge";
import { formatDateTime } from "../../lib/formatting";
import type { MessageRow } from "../../lib/queries";

interface SentMessagesTableProps {
  messages: MessageRow[];
}

export function SentMessagesTable({ messages }: SentMessagesTableProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">No messages sent yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell className="font-medium">
                {message.subject || "No Subject"}
                {message.is_system && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    System
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <MessageTypeBadge type={message.message_type} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(message.created_at)}
              </TableCell>
              <TableCell className="text-center">
                {message.is_read ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Read
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    Unread
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
