import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "@simplilms/ui";
import { formatDateTime } from "../../lib/formatting";
import type { CommunicationLogRow } from "../../lib/queries";
import { Mail, MessageSquare, Phone, CheckCircle, Clock, Eye, MousePointer } from "lucide-react";

interface CommunicationLogTableProps {
  logs: CommunicationLogRow[];
}

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  sms: <Phone className="h-3.5 w-3.5" />,
  whatsapp: <MessageSquare className="h-3.5 w-3.5" />,
};

export function CommunicationLogTable({ logs }: CommunicationLogTableProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        No communications sent yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Channel</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>
              <span className="flex items-center gap-1.5 capitalize">
                {channelIcons[log.channel || ""] || null}
                {log.channel}
              </span>
            </TableCell>
            <TableCell className="text-sm">
              {formatDateTime(log.sent_at)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {log.clicked_at ? (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <MousePointer className="mr-1 h-3 w-3" />
                    Clicked
                  </Badge>
                ) : log.opened_at ? (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Eye className="mr-1 h-3 w-3" />
                    Opened
                  </Badge>
                ) : log.delivered_at ? (
                  <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Delivered
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    Sent
                  </Badge>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
